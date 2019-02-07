// color: the color mapping function
// enabledItems: a set to be modified
// updateData: callback function to refresh data & rerender graph content
function makeCheckboxLegend(svg, legendLabel, color, enabledItems, updateData) {
  // modified from: https://beta.observablehq.com/@mbostock/d3-stacked-area-chart
  var legend = svg => {
    svg.append("text")
      .attr("font-weight", "bold")
      .attr("dy", -8)
      .text(legendLabel)

    const g = svg
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g")
      .data(color.domain().slice())
      .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)

    g.append("rect")
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d => initLegendState(d))
        .attr("class", d => getClassName(d))
        .on("click", d => toggleLegend(d))

    g.append("text")
        .attr("x", 24)
        .attr("y", 9.5)
        .attr("dy", "0.35em")
        .text(d => d)
  }

  function getLegendColor(item, enabled) {
    if (enabled) {
      return color(item)
    } else {
      return "#ddd"
    }
  }

  function initLegendState(item) {
    const enabled = enabledItems.has(item)
    return getLegendColor(item, enabled)
  }

  function toggleLegend(item) {
    const enabled = enabledItems.has(item)
    if (enabled) {
      enabledItems.remove(item)
    } else {
      enabledItems.add(item)
    }

    svg.selectAll(`rect.${getClassName(item)}`)
      .style("fill", d => getLegendColor(d, !enabled))

    updateData()
  }

  function getClassName(item) {
    return 'c' + item.replace('/', '')
  }

  return legend
}

// enabledItem: an array with a single item
function makeRadioLegend(svg, legendLabel, legendData, enabledItem, updateData) {
  var radioButtons = svg => {
    svg.append("text")
      .attr("x", 3)
      .attr("font-weight", "bold")
      .text(legendLabel)

    const g = svg
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g")
      .data(legendData)
      .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)

    g.append("circle")
        .attr("class", "radio")
        .attr("r", 6)
        .attr("cx", 10)
        .attr("cy", 15)
        .style("fill", d => initRadio(d))
        .on("click", function(d) {
          enabledItem[0] = d
          svg.selectAll("circle.radio")
            .style("fill", d => getRadioColor(false))
          d3.select(this)
            .style("fill", d => getRadioColor(true))
          updateData()
        })

      g.append("text")
          .attr("x", 24)
          .attr("y", 15)
          .attr("dy", "0.35em")
          .text(d => d)
  }

  function getRadioColor(enabled) {
    if (enabled) {
      return '#428bca' // blue
    } else {
      return 'fff'
    }
  }

  function initRadio(item) {
    return getRadioColor(enabledItem[0] == item)
  }

  return radioButtons
}

function makeTooltip() {
  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip d3-tip")
      .style("opacity", 0);

  function show(html, showMoreFn) {
    tooltip.transition()
         .duration(200)
         .style("opacity", .9);

    tooltip.html(html)
         .style("left", (d3.event.pageX + 5) + "px")
         .style("top", (d3.event.pageY - 28) + "px");

    if (showMoreFn != null) {
      showMoreFn()
    }
  }

  function hide(hideMoreFn) {
    tooltip.transition()
         .duration(500)
         .style("opacity", 0);

    if (hideMoreFn != null) {
      hideMoreFn()
    }
  }

  return {show, hide}
}

function formatNumber(number) {
  if (Math.abs(number) < 100) {
    return d3.format(".2f")(number)
  } else {
    return d3.format(",d")(number)
  }
}

export default {
  makeCheckboxLegend,
  makeRadioLegend,
  makeTooltip,
  formatNumber
}
