// referenced http://bl.ocks.org/tjdecke/5558084
import util from './utils.js'

var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 12),
    legendElementWidth = gridSize*2
const colors = ['#31a354', '#c7e9c0', '#fff']

function getColorScale(plotData) {
  // lowest & highest values are assigned green & white.
  // All middle values share the same color
  const minMaxNumStall = d3.extent(plotData, d => d.numStall)
  const colorDomain = [minMaxNumStall[0] + 1,
                       Math.max(minMaxNumStall[1] - 1, minMaxNumStall[0] + 1)]
  return d3.scaleThreshold().domain(colorDomain).range(colors)
}

function renderContent(plotData, svg) {
  var colorScale = getColorScale(plotData)
  var cards = svg.selectAll(".card")
    .data(plotData)

  cards.exit()
    .remove();

  cards.enter()
    .append("rect")
      .attr("x", d => (d.methodNum - 1) * gridSize)
      .attr("y", d => (d.profileNum - 1) * gridSize)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "card bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", 'white')
      .transition()
        .duration(500)
        .delay(d => d.methodNum * 15)
        .style("fill", d => colorScale(d.numStall))

  cards = svg.selectAll(".card") // need to re-select to indicate update
    .data(plotData)
    .transition()
      .duration(500)
      .delay(d => d.methodNum * 15)
      .style("fill", d => colorScale(d.numStall))
}

function render(data) {
  // select the first bufSize by default
  const bufSizes = Object.keys(data)
  const enabledBufSizeArr = [bufSizes[0]]
  const plotData = data[enabledBufSizeArr[0]]

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const ys = d3.set(plotData.map(d => d.profile)).values()
  var yLabels = svg.selectAll(".yLabel")
    .data(ys)
    .enter().append("text")
      .text(d => d)
      .attr("x", 0)
      .attr("y", (d, i) => i * gridSize)
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", "dayLabel mono axis")

  const xs = d3.set(plotData.map(d => d.method)).values()
  var xLabels = svg.selectAll(".xLabel")
    .data(xs)
    .enter().append("text")
      .text(d => d)
      .attr("x", (d, i) => i * gridSize)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", "timeLabel mono axis")

  var legend = svg.selectAll(".legend")
      .data([0, 1, 2])
      .enter().append("g")
        .attr("class", "legend")

  legend.append("rect")
    .attr("class", "bordered")
    .attr("x", (d, i) => legendElementWidth * i)
    .attr("y", height + gridSize/2)
    .attr("width", legendElementWidth)
    .attr("height", gridSize / 3)
    .style("fill", (d, i) => colors[i])

  const legendText = ['minimum number of stalls', 'in-between', 'maximum number of stalls']
  legend.append("text")
    .text(d => legendText[d])
    .attr("x", (d, i) => legendElementWidth * i)
    .attr("y", height + gridSize);

  var radioButtons = util.makeRadioLegend(svg, "BufSize", bufSizes, enabledBufSizeArr, updateData)
  svg.append("g")
      .attr("transform", `translate(${width - 120}, ${margin.top})`)
      .call(radioButtons);

  function updateData() {
    const newData = data[enabledBufSizeArr[0]]
    renderContent(newData, svg)
  }

  updateData()
}

export default function(data) {
  var plotData = data
    .filter(d => d.sample === 'v7')
    .map(d => ({
      bufSize: d.bufSize,
      profile: d.profile,
      profileNum: +(d.profile.replace('p', '')),
      method: d.method,
      methodNum: +(d.method.replace('Method', '')),
      numStall: d.numStall
    }))

  plotData = d3.nest()
    .key(d => d.bufSize)
    .object(plotData)

  render(plotData)
}
