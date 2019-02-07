var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

function render(data) {
  // select the first bufSize by default
  var enabledBufSize = Object.keys(data)[0]
  const plotData = data[enabledBufSize]

  const methods = plotData.map(d => d.method)
  var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.4)
    .domain(methods)
  var xAxis = g => g
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))

  var y = d3.scaleLinear()
            .domain(d3.extent(plotData, d => d.avgQuality)).nice()
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

  svg.append("g")
    .attr("fill", '#428bca')
  .selectAll("rect")
  .data(plotData)
  .enter().append("rect")
    .attr("x", d => x(d.method))
    .attr("y", d => y(d.avgQuality))
    .attr("height", d => height - y(d.avgQuality))
    .attr("width", x.bandwidth());

  svg.append("g").call(xAxis)
  svg.append("g").call(yAxis)

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
