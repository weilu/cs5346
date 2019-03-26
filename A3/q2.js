export default function(data) {
  const top5CitedPapers = data
    .sort((p1, p2) => p2.inCitations.length - p1.inCitations.length)
    .slice(0, 5)

  var plotData = []
  plotData.push(['citations'].concat(top5CitedPapers.map(p => p.inCitations.length)))
  plotData.push(['paper'].concat(top5CitedPapers.map(p => p.title)))

  var chart = c3.generate({
    bindto: '#q2',
    data: {
      columns: plotData,
      type: 'bar',
      x: 'paper'
    },
    axis: {
      rotated: true,
      x: {
        type: 'category',
        tick: {
          multiline: false
        }
      }
    }
  })
}
