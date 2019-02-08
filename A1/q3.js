import util from './utils.js'

// Modified from: https://bl.ocks.org/ctufts/674ece47de093f6e0cd5af22d7ee9b9b
function linearRegress(x, y) {
  // calculate mean x and y
  var n = x.length
  var x_mean = x.reduce((acc, c) => acc + c) / n;
  var y_mean = y.reduce((acc, c) => acc + c) / n;;

  // calculate coefficients
  var xr = 0;
  var yr = 0;
  var term1 = 0
  var term2 = 0
  for (var i = 0; i < x.length; i++) {
      xr = x[i] - x_mean;
      yr = y[i] - y_mean;
      term1 += xr * yr;
      term2 += xr * xr;
  }
  const b1 = term1 / term2;
  const b0 = y_mean - (b1 * x_mean);

  const xRange = d3.extent(x)
  const min_x = xRange[0]
  const min_y = b0 + (min_x * b1)
  const max_x = xRange[1]
  const max_y = b0 + (max_x * b1)

  return [min_x, min_y, max_x, max_y]
};

function renderContent(data, svg, tooltip, x, y, color) {
  var regData = []
  var dataByMethod = d3.nest()
    .key(d => d.method)
    .entries(data)
  for (const entry of dataByMethod) {
    var regPoints = linearRegress(entry.values.map(d => d.quality),
      entry.values.map(d => d.inefficiency))
    regData.push([entry.key, regPoints])
  }

  // empty dots & line
  svg.selectAll(".dot,.regLine").remove()

  function tooltipHTML(d) {
    var text = d.method
    if (d.quality != null && d.inefficiency != null) {
      text += "<br/> (" + d.quality + ", " + d.inefficiency + ")"
    }
    return text
  }

  function showMore(method) {
    return function() {
      svg.selectAll(`.regLine:not(.${method})`)
        .style("stroke", "#ddd")
      svg.selectAll(`.dot:not(.${method})`)
        .style("stroke", "#ddd")
        .style("fill", "#ddd")
      svg.selectAll(`.${method}`).raise()
    }
  }

  function hideMore(method) {
    return function() {
      svg.selectAll(`.regLine:not(.${method})`)
        .style("stroke", d => color(d[0]))
      svg.selectAll(`.dot:not(.${method})`)
        .style("stroke", "#000")
        .style("fill", d => color(d.method))
    }
  }

  const dot = svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", d => d.method + " dot")
      .attr("r", 3.5)
      .attr("cx", d => x(d.quality))
      .attr("cy", d => y(d.inefficiency))
      .style("fill", d => color(d.method))
      .on("mouseover", d => tooltip.show(tooltipHTML(d), showMore(d.method)))
      .on("mouseout", d => tooltip.hide(hideMore(d[0])))

  const path = svg.selectAll(".regLine")
      .data(regData)
    .enter().append("line")
      .attr("x1", d => x(d[1][0]))
      .attr("y1", d => y(d[1][1]))
      .attr("x2", d => x(d[1][2]))
      .attr("y2", d => y(d[1][3]))
      .attr("class", d => d[0] + " regLine")
      .style("stroke", d => color(d[0]))
      .on("mouseover", d => tooltip.show(tooltipHTML({method: d[0]}), showMore(d[0])))
      .on("mouseout", d => tooltip.hide(hideMore(d[0])))

}

function render(data, bufSizes) {
  const color = d3.scaleOrdinal()
                  .domain(data.map(d => d.method))
                  .range(d3.schemeCategory10)

  // by default select the first bufSize
  var enabledBufSizeArr = [bufSizes[0]]

  // only enable the 1st method initially
  var enabledMethods = d3.set([data[0].method])
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // setup x
  var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.quality)).nice()
            .range([0, width])
  var xAxis = g => g
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .call(g => g.append("text")
        .attr("class", "label")
        .attr("font-weight", "bold")
        .attr("x", width)
        .attr("y", -6)
        .text("Quality"))

  // setup y
  var y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.inefficiency)).nice()
            .range([height, 0])
  var yAxis = g => g
      .call(d3.axisLeft(y))
      .call(g => g.append("text")
        .attr("class", "label")
        .attr("font-weight", "bold")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .text("Inefficiency"))

  var svg = d3.select("#q3").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = util.makeTooltip()

  var radioButtons = util.makeRadioLegend(svg, "BufSize", bufSizes, enabledBufSizeArr, updateData)
  const legend = util.makeCheckboxLegend(svg, "Streaming", color, enabledMethods, updateData)

  // axis
  svg.append("g").call(xAxis)
  svg.append("g").call(yAxis)
  svg.append("g")
      .attr("transform", `translate(${width - 50}, ${margin.top + 200})`)
      .call(legend);
  svg.append("g")
      .attr("transform", `translate(${width - 120}, ${margin.top + 335})`)
      .call(radioButtons);

  function updateData() {
    const newData = data.filter(d => enabledBufSizeArr[0] == d.bufSize)
                        .filter(d => enabledMethods.has(d.method))
    renderContent(newData, svg, tooltip, x, y, color)
  }

  updateData()
}

export default function(data, bufSizes) {
  render(data, bufSizes)
}
