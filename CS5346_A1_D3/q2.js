import makeCheckboxLegend from './utils.js'

// box plot refereced https://bl.ocks.org/bytesbysophie/0311395c1e082f98e67efaf2c7f9555b
// grouped plot refereced https://bl.ocks.org/mbostock/3887051
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
var barWidth = 20;
var boxPlotColor = "#898989";
var medianLineColor = "#ffffff";
var axisColor = "#898989";

// Setup the svg and group we will draw the box plot in
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Move axis to center align the bars with the xAxis ticks
var yAxisBox = svg.append("g").attr("transform", "translate(40,0)");
var xAxisBox = svg.append("g").attr("transform", "translate(40,0)");

function render(plotData, min_max_y, bufSizes) {
  // // Create Tooltips
  // var tip = d3.tip().attr('class', 'd3-tip').direction('e').offset([0,5])
  //     .html(function(d) {
  //         var content = "<span style='margin-left: 2.5px;'><b>" + d.key + "</b></span><br>";
  //         content +=`
  //             <table style="margin-top: 2.5px;">
  //                     <tr><td>Max: </td><td style="text-align: right">` + d3.format(".2f")(d.whiskers[0]) + `</td></tr>
  //                     <tr><td>Q3: </td><td style="text-align: right">` + d3.format(".2f")(d.quartile[0]) + `</td></tr>
  //                     <tr><td>Median: </td><td style="text-align: right">` + d3.format(".2f")(d.quartile[1]) + `</td></tr>
  //                     <tr><td>Q1: </td><td style="text-align: right">` + d3.format(".2f")(d.quartile[2]) + `</td></tr>
  //                     <tr><td>Min: </td><td style="text-align: right">` + d3.format(".2f")(d.whiskers[1]) + `</td></tr>
  //             </table>
  //             `;
  //         return content;
  //     });
  // svg.call(tip);

  // method
  const methods = plotData.map(d => d.method)
  var x0 = d3.scaleBand()
    .rangeRound([0, width-margin.right])
    .paddingInner(0.1)
    .domain(methods)

  // bufSize
  var x1 = d3.scaleBand()
    .rangeRound([0, x0.bandwidth()])
    .padding(0.5)
    .domain(bufSizes)
  var z = d3.scaleOrdinal()
    .range(["#98abc5", "#6b486b", "#ff8c00"])
    .domain(bufSizes)

  // Compute a global y scale based on the global counts
  var y = d3.scaleLinear()
    .domain(min_max_y)
    .range([height, 0])
    .nice()

  // add the Y gridlines
  svg.append("g")
    .attr("transform", "translate(40,0)")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
    )

  var yAxis = d3.axisLeft(y).ticks(6)
  yAxisBox.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  var xAxis = d3.axisBottom(x0);
  xAxisBox.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  const enabledBufSizes = d3.set(bufSizes)
  var legend = makeCheckboxLegend(svg, "BufSize", z, enabledBufSizes, updateData)
  svg.append("g")
      .attr("transform", `translate(${width - 50}, ${margin.top + 400})`)
      .call(legend);

  function updateData() {
    const bufSizes = enabledBufSizes.values()
    const newData = []
    plotData.forEach(function(r) {
      const row = {method: r.method}
      bufSizes.forEach(s => row[s] = r[s])
      newData.push(row)
    })
    renderContent(newData, bufSizes, svg, x0, x1, y, z)
  }

  updateData()
}

function renderContent(plotData, bufSizes, svg, x0, x1, y, z) {
  // empty dots & line
  svg.selectAll(".q2content").remove()

  var g = svg.append("g")
    .attr("class", "q2content")
    .attr("transform", "translate(40,0)")
    .selectAll("g")
    .data(plotData)
    .enter().append("g")
      .attr("transform", d => "translate(" + x0(d.method) + ",0)")

  function makeSubgroupPlotData(d) {
    return bufSizes.map(key => ({key, ...d[key]}))
  }

  g.selectAll(".verticalLines")
    .data(makeSubgroupPlotData)
    .enter().append("line") // Draw the box plot vertical lines
      .attr("x1", d => x1(d.key) + barWidth/2)
      .attr("y1", d =>  y(d.whiskers[0]))
      .attr("x2", d =>  x1(d.key) + barWidth/2)
      .attr("y2", d => y(d.whiskers[1]))
      .attr("stroke", boxPlotColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("fill", "none");

  // Draw the boxes of the box plot, filled in white and on top of vertical lines
  g.selectAll("rect")
    .data(makeSubgroupPlotData)
    .enter().append("rect")
    .attr("width", barWidth)
    .attr("height", d => y(d.quartile[2]) - y(d.quartile[0]))
    .attr("x", d => x1(d.key))
    .attr("y", d => y(d.quartile[0]))
    .attr("fill", d => z(d.key) )
    .attr("stroke-width", 1)
    // .attr("stroke", boxPlotColor)
    // .on('mouseover', tip.show)
    // .on('mouseout', tip.hide);

  function drawHorizontalLine(selection, yDataFn, strokeColor) {
      selection.data(makeSubgroupPlotData)
      .enter().append("line")
        .attr("x1", d => x1(d.key))
        .attr("y1", d => y(yDataFn(d)))
        .attr("x2", d => x1(d.key) + barWidth)
        .attr("y2", d => y(yDataFn(d)))
        .attr("stroke", strokeColor)
  }

  for(var i=0; i < 2; i++) {
    drawHorizontalLine(g.selectAll(".whiskers"), d => d.whiskers[i], boxPlotColor)
  }
  drawHorizontalLine(g.selectAll(".median"), d => d.quartile[1], boxPlotColor)
  drawHorizontalLine(g.selectAll(".mean"), d => d.mean, medianLineColor)
}

function boxQuartiles(d) {
    return [
        d3.quantile(d, .75),
        d3.quantile(d, .5),
        d3.quantile(d, .25),
    ];
}

export default function(allData) {
  const min_max_y = d3.extent(allData, d => d.qoe)
  const dataByMethodByBufSize = d3.nest()
    .key(d => d.method)
    .key(d => d.bufSize)
    .object(allData)

  const plotData = []
  // strip other fields & prep data
  for (const method in dataByMethodByBufSize) {
    const rowObj = { method: method }
    for (const bufSize in dataByMethodByBufSize[method]) {
      const stripped = dataByMethodByBufSize[method][bufSize].map(o => o.qoe)
      const record = {};
      record.counts = stripped.sort((a, b) => a - b) // sort group counts so quantile methods work
      record.quartile = boxQuartiles(record.counts)
      record.mean = d3.mean(record.counts)
      record.whiskers = d3.extent(record.counts)
      rowObj[bufSize] = record
    }
    plotData.push(rowObj)
  }

  const bufSizes = d3.set(allData.map(d => d.bufSize)).values()
  render(plotData, min_max_y, bufSizes)
}

