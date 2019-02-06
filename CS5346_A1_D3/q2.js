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
  var yScale = d3.scaleLinear()
    .domain(min_max_y)
    .range([height, 0])
    .nice()

  var g = svg.append("g")
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
      .attr("y1", d =>  yScale(d.whiskers[0]))
      .attr("x2", d =>  x1(d.key) + barWidth/2)
      .attr("y2", d => yScale(d.whiskers[1]))
      .attr("stroke", boxPlotColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("fill", "none");

  // Draw the boxes of the box plot, filled in white and on top of vertical lines
  g.selectAll("rect")
    .data(makeSubgroupPlotData)
    .enter().append("rect")
    .attr("width", barWidth)
    .attr("height", d => yScale(d.quartile[2]) - yScale(d.quartile[0]))
    .attr("x", d => x1(d.key))
    .attr("y", d => yScale(d.quartile[0]))
    .attr("fill", d => z(d.key) )
    .attr("stroke-width", 1)
    // .attr("stroke", boxPlotColor)
    // .on('mouseover', tip.show)
    // .on('mouseout', tip.hide);

  function drawHorizontalLine(selection, yDataFn, strokeColor) {
      selection.data(makeSubgroupPlotData)
      .enter().append("line")
        .attr("x1", d => x1(d.key))
        .attr("y1", d => yScale(yDataFn(d)))
        .attr("x2", d => x1(d.key) + barWidth)
        .attr("y2", d => yScale(yDataFn(d)))
        .attr("stroke", strokeColor)
  }

  for(var i=0; i < 2; i++) {
    drawHorizontalLine(g.selectAll(".whiskers"), d => d.whiskers[i], boxPlotColor)
  }
  drawHorizontalLine(g.selectAll(".median"), d => d.quartile[1], boxPlotColor)
  drawHorizontalLine(g.selectAll(".mean"), d => d.mean, medianLineColor)

  // add the Y gridlines
  svg.append("g")
    .attr("transform", "translate(40,0)")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
    )

  // Setup a scale on the left
  var yAxis = d3.axisLeft(yScale).ticks(6)
  yAxisBox.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // Setup a series axis on the bottom
  var xAxis = d3.axisBottom(x0);
  xAxisBox.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  var legend = svg => {
    svg.append("text")
      .attr("font-weight", "bold")
      .attr("dy", -8)
      .text("BufSize")

    const g = svg
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g")
      .data(z.domain().slice())
      .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)

    g.append("rect")
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d => z(d))
        .attr("class", d => d)
        // .on("click", d => toggleLegend(d))

    g.append("text")
        .attr("x", 24)
        .attr("y", 9.5)
        .attr("dy", "0.35em")
        .text(d => d)
  }
  svg.append("g")
      .attr("transform", `translate(${width - 50}, ${margin.top + 400})`)
      .call(legend);
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

