// Referenced https://observablehq.com/@d3/disjoint-force-directed-graph
var margin = { top: 0, right: 0, bottom: 100, left: 20 },
    width = 1200 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom

function centroid(nodes) {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const d of nodes) {
    let k = d.paperCount ** 2;
    x += d.x * k;
    y += d.y * k;
    z += k;
  }
  return {x: x / z, y: y / z};
}

function forceCluster() {
  const strength = 0.3;
  let nodes;

  function force(alpha) {
    const centroids = d3.rollup(nodes, centroid, d => d.group);
    const l = alpha * strength;
    for (const d of nodes) {
      const {x: cx, y: cy} = centroids.get(d.group);
      d.vx -= (d.x - cx) * l;
      d.vy -= (d.y - cy) * l;
    }
  }

  force.initialize = _ => nodes = _;

  return force;
}

function render(nodes, links) {
  console.log(nodes)

  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      // .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("cluster", forceCluster())
      .force('collide', d3.forceCollide(d => d.paperCount + 10).strength(0.7))

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
      .attr("stroke-width", d => Math.sqrt(d.value));

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  function colorFn(d) {
    if (d.group != 0) {
      return colorScale(d.group)
    } else {
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
      .text(d => d.name);

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
  console.log(sortedAuthors.length)
  sortedAuthors.slice(0, 1000).forEach(a => top1000Authors[a.id] = a)

  const authors = {}
  const coauthors = {}
  data.forEach(function(d) {
    const selectedAuthors = d.authors.reduce(function(acc, curr) {
      if (curr.ids && curr.ids[0] in top1000Authors) {
        acc.push(curr)
      }
      return acc
    }, [])

    // prepare nodes
    selectedAuthors.forEach(a => authors[a.ids[0]] = a.name)

    // prepare links
    for (var i=0; i<selectedAuthors.length-1; i++) {
      const id1 = selectedAuthors[i].ids[0]
      for (var j=i+1; j<selectedAuthors.length; j++) {
        const id2 = selectedAuthors[j].ids[0]
        const linkId = [id1, id2].sort().join('&')
        if (coauthors[linkId] == null) {
          coauthors[linkId] = 1
        } else {
          coauthors[linkId] += 1
        }
      }
    }
  })

  function getGroup(author) {
    const hasTopCoauthors = Object.keys(author.coauthors).some(a => a in top1000Authors)
    return hasTopCoauthors ? author.group : 0
  }
  const nodes = Object.keys(authors).map(id => ({
    id: id,
    name: authors[id],
    paperCount: top1000Authors[id].papers,
    group: getGroup(top1000Authors[id])
  }))
  const links = Object.keys(coauthors).map(function(linkId) {
    const sourceTarget = linkId.split('&')
    return {source: sourceTarget[0], target: sourceTarget[1], value: coauthors[linkId]}
  })

  render(nodes, links)
}
