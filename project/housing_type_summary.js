import util from './utils.js'

function buildNarrarive(summaryData, containerParentSelector) {
  const dimensions = Object.keys(summaryData)
  const votes = {} // {HDB: [education, gender], landed: [language]}
  dimensions.forEach(d => {
    var vote = null
    var voteVal = 0
    Object.keys(summaryData[d]).forEach(type => {
      if (summaryData[d][type] > voteVal) {
        voteVal = summaryData[d][type]
        vote = type
      }
    })

    if (votes[vote] == null) {
      votes[vote] = [d]
    } else {
      votes[vote].push(d)
    }
  })

  console.log(votes)

  // majority rule
  var type = null
  var topDimensions = []
  Object.keys(votes).forEach(t => {
    if (votes[t].length > topDimensions.length) {
      type = t
      topDimensions = votes[t]
    }
  })

  const narrativeEl = document.querySelector(`${containerParentSelector} div.narrative`)
  narrativeEl.innerHTML = `<p>Given your demographics, the most popular
    housing type is <b>${type}</b>, because based on majority rule
    ${type} is the most popular choice across ${topDimensions.length}
    dimensions, namely ${topDimensions.join(', ')},
    out of all ${dimensions.length} dimensions.</p>`
}

// Housing type summary using parallel coordinates
export default function(eventData, plotElSelector, summaryData, dimensions,
                        colorRange, sortTypes) {
  // eventData = {dimension: language, HDB: 0.34, Landed: 0.02, Others: 0.1}}
  summaryData[eventData.dimension] = eventData
  delete summaryData[eventData.dimension].dimension
  var allTypes = Object.values(summaryData)
                       .reduce((acc, curr) => acc.concat(Object.keys(curr)), [])

  allTypes = d3.set(allTypes).values()
  const summaryPlotData = allTypes.map(type => {
    const data = {type: type}
    Object.keys(summaryData).forEach(dim => {
      data[dim] = summaryData[dim][type] || 0
    })
    return data
  })

  var colorDomain = d3.set(summaryPlotData.map(d => d.type)).values()
  if (sortTypes) colorDomain = colorDomain.sort()
  var color = d3.scaleOrdinal()
    .domain(colorDomain).range(colorRange)
  parallelCoordinates(dimensions, summaryPlotData, plotElSelector, color)
  buildNarrarive(summaryData, plotElSelector)
}

// modified from https://www.d3-graph-gallery.com/graph/parallel_custom.html
function parallelCoordinates(dimensions, data, containerParentSelector, color) {
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
  const containerEl = document.querySelector(containerParentSelector)
  var margin = {top: 30, right: 150, bottom: 10, left: 50},
    width = containerEl.clientWidth - margin.left - margin.right,
    height = 0.5 * containerEl.clientWidth - margin.top - margin.bottom;

  // empty canvas
  const containerSelector = `${containerParentSelector} div.summary`
  d3.select(containerSelector).select('svg').remove()

  // append the svg object to the body of the page
  var svg = d3.select(containerSelector)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

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
    svg.selectAll(".tick text")
      .transition().duration(200)
      .style("opacity", "0")
  }

  // Unhighlight
  var doNotHighlight = function(d){
    svg.selectAll(".line, .line-label, .tick text")
      .transition().duration(200).delay(400)
      .style("opacity", "1")
    svg.selectAll(".dim-label")
      .transition().duration(200)
      .style("opacity", "0")
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
  const paths = pathGroups.append("path")
      .attr("class", function (d) { return "line " + getSafeClassName(d.type) } ) // 2 class for each line: 'line' and the group name
      .attr("d",  path)
      .style("fill", "none" )
      .style("stroke", function(d){ return( color(d.type))} )
      .style("opacity", 0.7)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)

  pathGroups.selectAll('text')
    .data(d => {
      return dimensions.map(k => ({
        dimension: k,
        type: d.type,
        value: d[k]
      }))
    })
    .enter()
    .append('text')
    .text(d => util.formatPercent(d.value))
    .attr("x", d => x(d.dimension))
    .attr("y", d => y[d.dimension](d.value))
    .attr("text-anchor", "end")
    .style("opacity", 0)
    .attr("class", d => "dim-label " + getSafeClassName(d.type))

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
    .each(function(d) {
      var tickFormat = ""
      // only mark the ticks on the first and last axis
      if (dimensions.indexOf(d) === 0 || dimensions.indexOf(d) === dimensions.length - 1) {
        tickFormat = d3.format(".0%")
      }
      return d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]).tickFormat(tickFormat))
    })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", '-1em')
      .text(d => d)
      .style("fill", "#333")
}

function getSafeClassName(group) {
  return 'c' + group.replace(/\W/g, '')
}
