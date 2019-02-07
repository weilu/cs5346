// referenced http://bl.ocks.org/tjdecke/5558084
import util from './utils.js'

var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 10), // TODO: make this methods.length
    legendElementWidth = gridSize*2
const colors = ['#31a354', '#c7e9c0', '#fff']

function render(data) {
  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const ys = d3.set(data.map(d => d.profile)).values()
  var yLabels = svg.selectAll(".yLabel")
    .data(ys)
    .enter().append("text")
      .text(d => d)
      .attr("x", 0)
      .attr("y", (d, i) => i * gridSize)
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", "dayLabel mono axis")

  const xs = d3.set(data.map(d => d.method)).values()
  var xLabels = svg.selectAll(".xLabel")
    .data(xs)
    .enter().append("text")
      .text(d => d)
      .attr("x", (d, i) => i * gridSize)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", "timeLabel mono axis")

  // lowest & highest values are assigned green & white. 
  // All middle values share the same color
  const minMaxNumStall = d3.extent(data, d => d.numStall)
  const colorDomain = [minMaxNumStall[0] + 1,
                       Math.max(minMaxNumStall[1] - 1, minMaxNumStall[0] + 1)]
  var colorScale = d3.scaleThreshold()
    .domain(colorDomain)
    .range(colors)

  var cards = svg.selectAll(".numStall")
    .data(data)
    // .data(data, d => d.profile+':'+d.method)

  cards.enter().append("rect")
    .attr("x", function(d) { return (d.methodNum - 1) * gridSize; })
    .attr("y", function(d) { return (d.profileNum - 1) * gridSize; })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("class", "hour bordered")
    .attr("width", gridSize)
    .attr("height", gridSize)
    .style("fill", d => colorScale(d.numStall));

  cards.transition().duration(1000)
    .style("fill", d => colorScale(d.numStall));

  cards.exit().remove();

  // var legend = svg.selectAll(".legend")
  //     .data([0].concat(colorScale.quantiles()), function(d) { return d; });
  //
  // legend.enter().append("g")
  //     .attr("class", "legend");
  //
  // legend.append("rect")
  //   .attr("x", function(d, i) { return legendElementWidth * i; })
  //   .attr("y", height)
  //   .attr("width", legendElementWidth)
  //   .attr("height", gridSize / 2)
  //   .style("fill", function(d, i) { return colors[i]; });
  //
  // legend.append("text")
  //   .attr("class", "mono")
  //   .text(function(d) { return "≥ " + Math.round(d); })
  //   .attr("x", function(d, i) { return legendElementWidth * i; })
  //   .attr("y", height + gridSize);
  //
  // legend.exit().remove();
}

export default function(data) {
  const plotData = data
    .filter(d => d.sample === 'v7')
    .filter(d => d.bufSize === '240') // TODO: make this radio buttons
    .map(d => ({
      profile: d.profile,
      profileNum: +(d.profile.replace('p', '')),
      method: d.method,
      methodNum: +(d.method.replace('Method', '')),
      numStall: d.numStall
    }))
  render(plotData)
}
