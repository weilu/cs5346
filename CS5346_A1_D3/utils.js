// color: the color mapping function
// enabledItems: a set to be modified
// updateData: callback function to refresh data & rerender graph content
export default function makeCheckboxLegend(svg, legendLabel, color, enabledItems, updateData) {
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
