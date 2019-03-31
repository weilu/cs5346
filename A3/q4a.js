// Referenced https://observablehq.com/@d3/disjoint-force-directed-graph
var margin = { top: 0, right: 0, bottom: 100, left: 20 },
    width = 1200 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom

function render(nodes, links) {
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

  const svg = d3.select('#q4a').append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => d.value < 1 ? 0 : Math.sqrt(d.value));

  const allGroups = d3.set(nodes.map(n => n.group)).values().map(d => parseInt(d))
  const colorScale = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(allGroups.length));

  function colorFn(d) {
    if (d.group != 0) {
      const colorIndex = allGroups.indexOf(d.group) / allGroups.length
      return colorScale(colorIndex)
    }
    else {
      return 'grey'
    }
  }

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", d => d.paperCount)
      .attr("fill", colorFn)
      .call(drag(simulation));

  node.append("title")
      .text(d => d.name + ': ' + d.paperCount + ' publications');

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
  });

  function drag(simulation) {

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }
}

function buildLinks(selectedAuthors, coauthors) {
  for (var i=0; i<selectedAuthors.length-1; i++) {
    const id1 = selectedAuthors[i].id
    for (var j=i+1; j<selectedAuthors.length; j++) {
      const id2 = selectedAuthors[j].id
      const linkId = [id1, id2].sort().join('&')
      if (coauthors[linkId] == null) {
        coauthors[linkId] = 1
      } else {
        coauthors[linkId] += 1
      }
    }
  }
}

export default function(data) {
  const authorsById = {}
  data.forEach(function(paper){
    const paperAuthors = paper.authors.reduce((acc, curr) => acc.concat(curr.ids), [])
    paper.authors.forEach((d) => d.ids.forEach(function(id) {
      if (authorsById[id] == null) {
        authorsById[id] = {id: id, papers: 0, coauthors: {}}
      }
      authorsById[id].papers += 1
      paperAuthors.forEach(function(a){
        if (a !== id) { authorsById[id].coauthors[a] = 1 }
      })
    }))
  })

  const sortedAuthors = Object.values(authorsById).sort((a, b) => b.papers - a.papers)

  function dfs(author, parent) {
    if (parent == null) {
      author.group = parseInt(author.id)
    } else {
      author.group = parseInt(parent.group)
    }

    Object.keys(author.coauthors).forEach(function(neighborId){
      const neighbor = authorsById[neighborId]
      if (neighbor.group == null) dfs(neighbor, author)
    })
  }

  Object.keys(authorsById).forEach(function(id){
    const author = authorsById[id]
    if (author.group == null) dfs(author)
  })

  const top1000Authors = {}
  sortedAuthors.slice(0, 1000).forEach(a => top1000Authors[a.id] = a)

  const authors = {}
  const coauthors = {}
  data.forEach(function(d) {
    const selectedAuthors = d.authors.reduce(function(acc, curr) {
      if (curr.ids && curr.ids[0] in top1000Authors) {
        curr.id = curr.ids[0]
        acc.push(curr)
      }
      return acc
    }, [])

    // prepare nodes
    selectedAuthors.forEach(a => authors[a.ids[0]] = a.name)

    // prepare links
    buildLinks(selectedAuthors, coauthors)
  })

  const nodes = Object.keys(authors).map(id => ({
    id: id,
    name: authors[id],
    paperCount: top1000Authors[id].papers,
    group: top1000Authors[id].group
  }))

  const coauthorGroups = {}
  const authorsByGroup = d3.rollup(Object.values(top1000Authors), v => d3.set(v.map(n => n.id)), d => d.group)
  function subsetDfs(author, parent) {
    if (parent == null) {
      author.subsetGroup = author.id
    } else {
      author.subsetGroup = parent.subsetGroup
    }

    Object.keys(author.coauthors).forEach(function(neighborId){
      if (neighborId in top1000Authors) {
        const neighbor = authorsById[neighborId]
        if (neighbor.subsetGroup == null) subsetDfs(neighbor, author)
      }
    })
  }
  authorsByGroup.forEach(function(authorSet, gid) {
    const authorIds = authorSet.values()
    const selectedAuthorIds = []
    authorIds.forEach(function(id){
      const author = top1000Authors[id]
      if (author.subsetGroup == null) {
        selectedAuthorIds.push(id)
        subsetDfs(author)
      }
    })
    if (selectedAuthorIds.length > 1) {
      const selectedAuthors = selectedAuthorIds.map(id => top1000Authors[id])
      for (var i=0; i<selectedAuthors.length-1; i++) {
        const id1 = selectedAuthors[i].id
        const id2 = selectedAuthors[i+1].id
        const linkId = [id1, id2].sort().join('&')
        coauthorGroups[linkId] = 1
      }
    }
  })

  const groupLinks = Object.keys(coauthorGroups).map(function(linkId) {
    const sourceTarget = linkId.split('&')
    return {source: sourceTarget[0], target: sourceTarget[1], value: 0.01}
  })

  const links = Object.keys(coauthors).map(function(linkId) {
    const sourceTarget = linkId.split('&')
    return {source: sourceTarget[0], target: sourceTarget[1], value: coauthors[linkId]}
  }).concat(groupLinks)

  const connectedNodeIds = d3.set(links.reduce((acc, curr) => acc.concat([curr.source, curr.target]), [])).values()
  nodes.forEach(function(n){
    if (!connectedNodeIds.includes(n.id)) {
      n.group = 0
    }
  })

  render(nodes, links)
}
