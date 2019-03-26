export default function(data) {
  const pubCountByYear = d3.nest()
    .key(d => d.year)
    .rollup(v => v.length)
    .object(data)

  var plotData = []
  plotData.push(['year'].concat(Object.keys(pubCountByYear).map(year => parseInt(year))))
  plotData.push(['publications'].concat(Object.values(pubCountByYear)))

  var chart = c3.generate({
    bindto: '#q3',
    data: {
      columns: plotData,
      x: 'year'
    }
  })
}
