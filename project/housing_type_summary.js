import util from './utils.js'

// modified from https://www.d3-graph-gallery.com/graph/parallel_custom.html
export default function(dimensions, data, containerSelector) {
  // keep dimension order, filter to keep only those available in data
  dimensions = dimensions.filter(d => d in data[0])

  // function getSampleData() {
  //   const result = {}
  //   dimensions.forEach(d => result[d] = Math.random())
  //   return result
  // }
  // // TODO: pass in data
  // const data = [{...getSampleData(), type: 'HDB'},
  //         {...getSampleData(), type: 'Condo'},
  //         {...getSampleData(), type: 'Landed'},
  //         {...getSampleData(), type: 'Others'}]

  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 150, bottom: 10, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // empty canvas
  d3.select(containerSelector).select('svg').remove()

  // append the svg object to the body of the page
  var svg = d3.select(containerSelector)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var color = d3.scaleOrdinal()
    .domain(d3.set(data.map(d => d.type)).values())
    .range(d3.schemeCategory10)
  //TODO: make it consistent with color usage

  var y = {}
  for (var i in dimensions) {
    var name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain( [0, 1] )
      .range([height, 0])
  }

  var x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

  // Highlight the specie that is hovered
  var highlight = function(d){

    var selected_specie = d.type

    // first every group turns grey
    svg.selectAll(".line, .line-label")
      .transition().duration(200)
      .style("opacity", "0.2")
    // Second the hovered specie takes its color
    svg.selectAll("." + getSafeClassName(selected_specie))
      .transition().duration(200)
      .style("opacity", "1")
  }

  // Unhighlight
  var doNotHighlight = function(d){
    svg.selectAll(".line, .line-label")
      .transition().duration(200).delay(400)
      .style("opacity", "1")
  }

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(p => {
        return [x(p), y[p](d[p])]
      }));
  }

  const pathGroups = svg.selectAll("myPath")
    .data(data)
    .enter()
    .append("g")

  // Draw the lines
  pathGroups.append("path")
      .attr("class", function (d) { return "line " + getSafeClassName(d.type) } ) // 2 class for each line: 'line' and the group name
      .attr("d",  path)
      .style("fill", "none" )
      .style("stroke", function(d){ return( color(d.type))} )
      .style("opacity", 0.7)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)

  const lastDim = dimensions[dimensions.length - 1]
  pathGroups.append('text')
    .text(d => d.type)
    .attr("x", width)
    .attr("y", d => y[lastDim](d[lastDim]))
    .attr("dx", 5)
    .attr("class", d => "line-label " + getSafeClassName(d.type))
    .attr("text-anchor", "start")
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight)

  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]).tickFormat(d3.format(".0%"))) })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(d => d)
      .style("fill", "black")
}

function getSafeClassName(group) {
  return 'c' + group.replace(/\W/g, '')
}
