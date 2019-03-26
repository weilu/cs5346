// referenced http://bl.ocks.org/tjdecke/5558084
import util from './utils.js'

var margin = { top: 70, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 12),
    legendElementWidth = gridSize*2

function render(plotData, xs, ys) {
  var svg = d3.select("#q1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yLabels = svg.selectAll(".yLabel")
    .data(ys)
    .enter().append("text")
      .text(d => d)
      .attr("x", 0)
      .attr("y", (d, i) => i * gridSize)
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", "dayLabel mono axis")

  var xLabels = svg.selectAll(".xLabel")
    .data(xs)
    .enter().append("text")
      .text(d => d)
      .attr("x", (d, i) => i * gridSize)
      .attr("y", 0)
      .style("text-anchor", "start")
      .attr("transform", (d, i) => "translate(" + gridSize / 4 + ", -6) rotate(-30," + i * gridSize + ", 0)")
      .attr("class", "timeLabel mono axis")

  var colorScale = d3.scaleSequential(d3.interpolateGreens)
    .domain(d3.extent(plotData, d => d.count))
  var cards = svg.selectAll(".card")
    .data(plotData)

  cards.exit()
    .remove();

  const cardGroups = cards.enter()
    .append("g")
      .attr("class", d => "card-group c" + d.numStall)
      .on("mouseover", function(d) {
        d3.select(this)
          .select('text')
          .transition()
          .duration(300)
          .style("opacity", 1.0)
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .select('text')
          .transition()
          .duration(300)
          .style("opacity", 0)
      })

  cardGroups.append("rect")
      .attr("x", d => (xs.indexOf(d.name)) * gridSize)
      .attr("y", d => (d.year - d3.min(ys)) * gridSize)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "card bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", 'white')
      .transition()
        .duration(500)
        .delay(d => xs.indexOf(d.name) * 15)
        .style("fill", d => colorScale(d.count))
      .select('.card-text')

  cardGroups.append("text")
    .attr("class", "card-text")
    .attr("font-weight", "bold")
    .attr("x", d => (xs.indexOf(d.name)) * gridSize + gridSize/2 - 5)
    .attr("y", d => (d.year - d3.min(ys)) * gridSize + gridSize/2)
    .text(d => `${d.count}`)

  svg.selectAll(".card") // need to re-select to indicate update
    .data(plotData)
    .transition()
      .duration(500)
      .delay(d => (xs.indexOf(d.name)) * 15)
      .style("fill", d => colorScale(d.count))

  svg.selectAll(".card-group")
    .data(plotData)
    .attr("class", d => "card-group c" + d.count)

  svg.selectAll(".card-text")
    .data(plotData)
    .text(d => `${d.count}`)
}

export default function(data) {
  const authorsById = {}
  data.forEach(function(paper){
    const simplePaper = {year: paper.year, title: paper.title}
    paper.authors.forEach((d) => d.ids.forEach(function(id) {
      if (authorsById[id] == null) {
        authorsById[id] = {id: id, name: d.name, papers: [simplePaper]}
      } else {
        authorsById[id].papers.push(simplePaper)
      }
    }))
  })

  const sortedAuthors = Object.values(authorsById).sort((a, b) => b.papers.length - a.papers.length)
  const top10Authors = sortedAuthors.slice(0, 10)

  top10Authors.forEach(function(author){
    const paperCount = d3.nest()
      .key(d => d.year)
      .rollup(v => v.length)
      .object(author.papers)
    author.paperCount = paperCount
  })

  var years = []
  top10Authors.forEach(d => years = years.concat(d.papers.map(p => parseInt(p.year))))
  const xRange = d3.extent(years)
  // fill out years to make it continuous
  const contYears = [] 
  for (var i = xRange[0]; i <= xRange[1]; i++) {
    contYears.push(i)
  }

  const plotData = []
  // flatten data for plotting
  top10Authors.forEach(function(author){
    contYears.forEach(function(year){
      var count = author.paperCount[year] || 0
      plotData.push({name: author.name, year: year, count: count})
    })
  })

  render(plotData, top10Authors.map(d => d.name), contYears)
}
