// Referenced https://observablehq.com/@d3/disjoint-force-directed-graph
var margin = { top: 0, right: 0, bottom: 100, left: 20 },
    width = 1200 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom

function render(dataNodes, dataLinks) {
  const links = dataLinks.map(d => Object.create(d));
  const nodes = dataNodes.map(d => Object.create(d));

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
      .attr("stroke-width", d => Math.sqrt(d.value));

  function color() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.group);
  }

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", 5)
      .attr("fill", color)
      .call(drag(simulation));

  node.append("title")
      .text(d => d.id);

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
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
    paper.authors.forEach((d) => d.ids.forEach(function(id) {
      if (authorsById[id] == null) {
        authorsById[id] = {id: id, papers: 1}
      } else {
        authorsById[id].papers += 1
      }
    }))
  })

  const sortedAuthors = Object.values(authorsById).sort((a, b) => b.papers - a.papers)
  const top1000AuthorIds = sortedAuthors.slice(0, 1000).map(a => a.id)

  const authors = {}
  const coauthors = {}
  data.forEach(function(d) {
    const selectedAuthors = d.authors.reduce(function(acc, curr) {
      if (curr.ids && top1000AuthorIds.includes(curr.ids[0])) {
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

  const nodes = Object.keys(authors).map(id => ({id: id, name: authors[id]}))
  const links = Object.keys(coauthors).map(function(linkId) {
    const sourceTarget = linkId.split('&')
    return {source: sourceTarget[0], target: sourceTarget[1], value: coauthors[linkId]}
  })

  render(nodes, links)
}
