export default function(data) {
  const pubCountByYear = d3.nest()
    .key(d => d.year)
    .rollup(v => v.length)
    .object(data)

  var plotData = []
  plotData.push(['year'].concat(Object.keys(pubCountByYear).map(year => parseInt(year))))
  plotData.push(['publications'].concat(Object.values(pubCountByYear)))

  // basic line chart
  c3.generate({
    bindto: '#q3',
    data: {
      columns: plotData,
      x: 'year'
    }
  })

  // stacked area chart by topic
  const expandedData = []
  data.forEach(d => d.entities.forEach(function(keyword) {
    const simplePaper = {
      title: d.title,
      year: d.year,
      keyword: keyword
    }
    expandedData.push(simplePaper)
  }))
  const pubCountByTopic = d3.nest()
    .key(d => d.keyword)
    .rollup(v => v.length)
    .object(expandedData)

  const top10Topics = Object.keys(pubCountByTopic)
    .sort((a, b) => pubCountByTopic[b] - pubCountByTopic[a])
    .slice(0, 10)

  const pubCountByYearByTopic = d3.nest()
    .key(d => d.year)
    .key(d => d.keyword)
    .rollup(v => v.length)
    .object(expandedData)

  var stackedPlotData = []
  top10Topics.forEach(function(topic) {
    const counts = [topic]
    for (const year in pubCountByYearByTopic) {
      const count = pubCountByYearByTopic[year][topic] || 0
      counts.push(count)
    }
    stackedPlotData.push(counts)
  })
  stackedPlotData.push(['year'].concat(Object.keys(pubCountByYearByTopic)))

  c3.generate({
    bindto: '#q3a',
    data: {
      columns: stackedPlotData,
      x: 'year',
      type: 'area-spline',
      groups: [
        top10Topics
      ]
    }
  })
}
