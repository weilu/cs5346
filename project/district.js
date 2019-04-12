import util from './utils.js'

function computePlotData(data) {
  const totalPercent = util.getPercentageMap(data)
  const sortedDistrictPercent = Object.keys(totalPercent)
    .map(d => [d, totalPercent[d]]) // district-percent pairs e.g. ['Kallang', 0.32]
    .sort((d1, d2) => d2[1] - d1[1]) // sort by percent desc

  const plotData = []
  plotData.push(['district'].concat(sortedDistrictPercent.map(d => d[0])))
  plotData.push(['percentage'].concat(sortedDistrictPercent.map(d => d[1])))

  return plotData
}

export default function(data, keyword) {
  const totalData = data.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const plotData = computePlotData(totalData)

  var chart = c3.generate({
    bindto: `#${keyword} .viz .top.rightrightviz`,
    data: {
      type: 'bar',
      columns: plotData,
      x: 'district'
    },
    axis: {
      rotated: true,
      x: {
        type: 'category',
        tick: { multiline: false }
      }
    }
  })

  const demoData = data.filter(d => !d.demographic.includes('Total') && d.housing != 'Total')
  const demoSelect = document.querySelector(`#type-${keyword}`);
  demoSelect.addEventListener('change', (event) => {
    const selected = event.target.value
    const filteredData = demoData.filter(d => d.demographic == selected)
    const plotData = computePlotData(filteredData)

    chart.load({
      columns: plotData
    })
  })
}
