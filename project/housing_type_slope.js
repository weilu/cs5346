import util from './utils.js'

// modified from https://bl.ocks.org/tlfrd/042b2318c8767bad7a485098fbf760fc
function render(data, keyword, demographic) {
  const containerSelector = `#${keyword} .bottomleftviz`
  d3.select(containerSelector).select('svg').remove()

  var margin = {top: 50, right: 150, bottom: 50, left: 150};

  const containerEl = document.querySelector(containerSelector)
  var width = containerEl.clientWidth - margin.left - margin.right,
    height = containerEl.clientWidth - margin.top - margin.bottom;

  var svg = d3.select(containerSelector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var y1 = d3.scaleLinear()
    .range([height, 0]);

  var config = {
    xOffset: 0,
    yOffset: 0,
    width: width,
    height: height,
    labelPositioning: {
      alpha: 0.5,
      spacing: 18
    },
    leftTitle: "National Average",
    rightTitle: demographic,
    labelGroupOffset: 5,
    labelKeyOffset: 50,
    radius: 6,
    // Reduce this to turn on detail-on-hover version
    unfocusOpacity: 0.7
  }

  function drawSlopeGraph(cfg, data, yScale, leftYAccessor, rightYAccessor) {
    var slopeGraph = svg.append("g")
      .attr("class", "slope-graph")
      .attr("transform", "translate(" + [cfg.xOffset, cfg.yOffset] + ")");
  }

  var nestedByName = d3.nest()
    .key(d => d.housing)
    .entries(data);

  y1.domain([0, 1]);

  var yScale = y1;

  var voronoi = d3.voronoi()
    .x(d => d.demographic == "Total" ? 0 : width)
    .y(d => yScale(d.value))
    .extent([[-margin.left, -margin.top],
             [width + margin.right, height + margin.bottom]]);

  var slopeGroups = svg.append("g")
    .selectAll("g")
    .data(nestedByName)
    .enter().append("g")
    .attr("class", "slope-group")
    .attr("id", function(d, i) {
      d.id = "group" + i;
      d.values[0].group = this;
      d.values[1].group = this;
    });

  var slopeLines = slopeGroups.append("line")
    .attr("class", "slope-line")
    .attr("x1", 0)
    .attr("y1", function(d) {
      return y1(d.values[0].value);
    })
    .attr("x2", config.width)
    .attr("y2", function(d) {
      return y1(d.values[1].value);
    });

  var leftSlopeCircle = slopeGroups.append("circle")
    .attr("r", config.radius)
    .attr("cy", d => y1(d.values[0].value));

  var leftSlopeLabels = slopeGroups.append("g")
    .attr("class", "slope-label-left")
    .each(function(d) {
      d.xLeftPosition = -config.labelGroupOffset;
      d.yLeftPosition = y1(d.values[0].value);
    });

  leftSlopeLabels.append("text")
    .attr("class", "label-figure")
    .attr("x", d => d.xLeftPosition)
    .attr("y", d => d.yLeftPosition)
    .attr("dx", -10)
    .attr("dy", 3)
    .attr("text-anchor", "end")
    .text(d => util.formatPercent(d.values[0].value));

  leftSlopeLabels.append("text")
    .attr("x", d => d.xLeftPosition)
    .attr("y", d => d.yLeftPosition)
    .attr("dx", -config.labelKeyOffset)
    .attr("dy", 3)
    .attr("text-anchor", "end")
    .text(d => d.key);

  var rightSlopeCircle = slopeGroups.append("circle")
    .attr("r", config.radius)
    .attr("cx", config.width)
    .attr("cy", d => y1(d.values[1].value));

  var rightSlopeLabels = slopeGroups.append("g")
    .attr("class", "slope-label-right")
    .each(function(d) {
      d.xRightPosition = width + config.labelGroupOffset;
      d.yRightPosition = y1(d.values[1].value);
    });

  rightSlopeLabels.append("text")
    .attr("class", "label-figure")
    .attr("x", d => d.xRightPosition)
    .attr("y", d => d.yRightPosition)
    .attr("dx", 10)
    .attr("dy", 3)
    .attr("text-anchor", "start")
    .text(d => util.formatPercent(d.values[1].value));

  rightSlopeLabels.append("text")
    .attr("x", d => d.xRightPosition)
    .attr("y", d => d.yRightPosition)
    .attr("dx", config.labelKeyOffset)
    .attr("dy", 3)
    .attr("text-anchor", "start")
    .text(d => d.key);

  var titles = svg.append("g")
    .attr("class", "title");

  titles.append("text")
    .attr("text-anchor", "end")
    .attr("dx", -10)
    .attr("dy", -margin.top / 2)
    .text(config.leftTitle);

  titles.append("text")
    .attr("x", config.width)
    .attr("dx", 10)
    .attr("dy", -margin.top / 2)
    .text(config.rightTitle);

  relax(leftSlopeLabels, "yLeftPosition", config);
  leftSlopeLabels.selectAll("text")
    .attr("y", d => d.yLeftPosition);

  relax(rightSlopeLabels, "yRightPosition", config);
  rightSlopeLabels.selectAll("text")
    .attr("y", d => d.yRightPosition);

  d3.selectAll(".slope-group")
    .attr("opacity", config.unfocusOpacity);

  var voronoiGroup = svg.append("g")
    .attr("class", "voronoi");

  voronoiGroup.selectAll("path")
    .data(voronoi.polygons(d3.merge(nestedByName.map(d => d.values))))
    .enter().append("path")
    .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  function mouseover(d) {
    d3.select(d.data.group).attr("opacity", 1);
  }

  function mouseout(d) {
    d3.selectAll(".slope-group")
      .attr("opacity", config.unfocusOpacity);
  }

}

// Function to reposition an array selection of labels (in the y-axis)
function relax(labels, position, config) {
  var again = false;
  labels.each(function (d, i) {
    var a = this;
    var da = d3.select(a).datum();
    var y1 = da[position];
    labels.each(function (d, j) {
      var b = this;
      if (a == b) return;
      var db = d3.select(b).datum();
      var y2 = db[position];
      var deltaY = y1 - y2;

      if (Math.abs(deltaY) > config.labelPositioning.spacing) return;

      again = true;
      var sign = deltaY > 0 ? 1 : -1;
      var adjust = sign * config.labelPositioning.alpha;
      da[position] = +y1 + adjust;
      db[position] = +y2 - adjust;

      if (again) {
        relax(labels, position, config);
      }
    })
  })
}

export default function(totalMap, demoMap, keyword, demo) {
  var data = []
  for (var key in totalMap) {
    data.push({demographic: 'Total', housing: key, value: totalMap[key]})
  }
  for (var key in demoMap) {
    data.push({demographic: demo, housing: key, value: demoMap[key]})
  }

  render(data, keyword, demo)
}
