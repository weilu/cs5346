import util from './utils.js'

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

function renderContent(plotData, enabledYRadio, svg, x, y, yAxis) {
  // update y axis
  y.domain(getPaddedYDomain(plotData, enabledYRadio)).nice()
  svg.select('.y.axis')
    .transition()
    .duration(300)
    .call(yAxis)
  svg.select('.y.label')
    .transition()
    .duration(300)
    .text(enabledYRadio)

  // update bars
  const bars = svg.selectAll("rect")
    .data(plotData)

  bars.exit()
    .remove()

  const barGroups = bars.enter()
    .append("g")

  barGroups.append("rect")
    .attr("fill", '#428bca')
    .attr("x", d => x(d.method))
    .attr("y", d => y(d[enabledYRadio]))
    .attr("height", d => height - y(d[enabledYRadio]))
    .attr("width", x.bandwidth());

  bars.transition()
    .duration(300)
    .ease(d3.easeLinear)
    .attr("y", d => y(d[enabledYRadio]))
    .attr("height", d => height - y(d[enabledYRadio]))

  const barLabels = barGroups.append("text")
    .attr("class", "bar-text")
    .attr("x", d => x(d.method) + x.bandwidth()/2)
    .attr("y", d => y(d[enabledYRadio]) - 5)
    .style("text-anchor", "middle")
    .text(d => util.formatNumber(d[enabledYRadio]))

  svg.selectAll('text.bar-text')
    .data(plotData)
    .transition()
    .duration(300)
    .ease(d3.easeLinear)
    .attr("y", d => y(d[enabledYRadio]) - 5)
    .text(d => util.formatNumber(d[enabledYRadio]))
}

// pad y so we have space on top for radio buttons
function getPaddedYDomain(plotData, attr) {
  const minMaxY = d3.extent(plotData, d => d[attr])
  const maxYWithPadding = minMaxY[1] + 0.3 * (minMaxY[1] - minMaxY[0])
  return [minMaxY[0], maxYWithPadding]
}

function render(data, bufSizes) {
  // select the first bufSize by default
  const enabledBufSizeArr = [bufSizes[0]]
  const plotData = data[enabledBufSizeArr[0]]

  // show avgQuality by default
  const enabledYRadioArr = ['avgQuality']

  const methods = plotData.map(d => d.method)
  var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.4)
    .domain(methods)
  var xAxis = g => g
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))

  const yDomain = getPaddedYDomain(plotData, enabledYRadioArr[0])
  var y = d3.scaleLinear()
            .domain(yDomain).nice()
            .range([height, 0])
  var yAxis = g => g
      .call(d3.axisLeft(y))
      .call(g => g)

  var svg = d3.select("#q1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g").attr("class", "x axis").call(xAxis)
  const yAxisFrame = svg.append("g").attr("class", "y axis").call(yAxis)
  yAxisFrame.append("text")
    .attr("class", "y label")
    .attr("font-weight", "bold")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .text(enabledYRadioArr[0])

  var radioButtons = util.makeRadioLegend(svg, "BufSize", bufSizes, enabledBufSizeArr, updateData)
  svg.append("g")
      .attr("transform", `translate(${width - 120}, ${margin.top})`)
      .call(radioButtons);

  var yRadio = util.makeRadioLegend(svg, "Compare", ['avgQuality', 'avgChange'],
                                    enabledYRadioArr, updateData)
  svg.append("g")
      .attr("transform", `translate(${width - 60}, ${margin.top})`)
      .call(yRadio);

  function updateData() {
    const newData = data[enabledBufSizeArr[0]]
    renderContent(newData, enabledYRadioArr[0], svg, x, y, yAxis)
  }

  updateData()
}

export default function(data, bufSizes) {
  const dataByBufSizeByMethod = d3.nest()
    .key(d => d.bufSize)
    .key(d => d.method)
    .rollup(v => ({ avgQuality: d3.mean(v, d => d.quality),
                    avgChange: d3.mean(v, d => d.change) }))
    .object(data)

  const plotData = {}
  for (const bufSize in dataByBufSizeByMethod){
    const rows = []
    for (const method in dataByBufSizeByMethod[bufSize]) {
      rows.push({method, ...dataByBufSizeByMethod[bufSize][method]})
    }
    plotData[bufSize] = rows
  }

  render(plotData, bufSizes)
}
