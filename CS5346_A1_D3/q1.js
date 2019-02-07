import util from './utils.js'

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

function renderContent(plotData, svg, x, y) {
  svg.selectAll(".q3g").remove()

  svg.append("g")
    .attr("fill", '#428bca')
    .attr('class', 'q3g')
  .selectAll("rect")
  .data(plotData)
  .enter().append("rect")
    .attr("x", d => x(d.method))
    .attr("y", d => y(d.avgQuality))
    .attr("height", d => height - y(d.avgQuality))
    .attr("width", x.bandwidth());
}

function render(data) {
  // select the first bufSize by default
  const bufSizes = Object.keys(data)
  var enabledBufSizeArr = [bufSizes[0]]
  const plotData = data[enabledBufSizeArr[0]]

  const methods = plotData.map(d => d.method)
  var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.4)
    .domain(methods)
  var xAxis = g => g
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))

  const minMaxY = d3.extent(plotData, d => d.avgQuality)
  const maxYWithPadding = minMaxY[1] + 0.3 * (minMaxY[1] - minMaxY[0])
  var y = d3.scaleLinear()
            .domain([minMaxY[0], maxYWithPadding]).nice()
            .range([height, 0])
  var yAxis = g => g
      .call(d3.axisLeft(y))
      .call(g => g.append("text")
        .attr("class", "label")
        .attr("font-weight", "bold")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .text("Average Quality"))

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g").call(xAxis)
  svg.append("g").call(yAxis)

  var radioButtons = util.makeRadioLegend(svg, "BufSize", bufSizes, enabledBufSizeArr, updateData)
  svg.append("g")
      .attr("transform", `translate(${width - 120}, ${margin.top})`)
      .call(radioButtons);

  function updateData() {
    const newData = data[enabledBufSizeArr[0]]
    renderContent(newData, svg, x, y)
  }

  updateData()
}

export default function(data) {
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
  render(plotData)
}
