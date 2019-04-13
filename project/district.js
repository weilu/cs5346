import util from './utils.js'

function computePlotData(dataLabel, data, filteredDataLabel, filteredData) {
  const totalPercent = util.getPercentageMap(data)
  const sortedDistrictPercent = Object.keys(totalPercent)
    .map(d => [d, totalPercent[d]]) // district-percent pairs e.g. ['Kallang', 0.32]
    .sort((d1, d2) => d2[1] - d1[1]) // sort by percent desc
  const sortedDistrict = sortedDistrictPercent.map(d => d[0])

  const plotData = []
  plotData.push(['district'].concat(sortedDistrict))
  plotData.push([dataLabel].concat(sortedDistrictPercent.map(d => d[1])))

  if (filteredDataLabel != null && filteredData != null) {
    const filteredPercent = util.getPercentageMap(filteredData)
    const filteredPlotData = sortedDistrict.map(d => [filteredPercent[d]])
    plotData.push([filteredDataLabel].concat(filteredPlotData))
  }

  return plotData
}

export default function(data, keyword, dropdownEl) {
  const totalData = data.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const totalDataLabel = 'National Average'
  var loadedDataIds = [totalDataLabel]
  const plotData = computePlotData(totalDataLabel, totalData)

  var chart = c3.generate({
    bindto: `#${keyword} .viz .district`,
    data: {
      type: 'bar',
      columns: plotData,
      x: 'district'
    },
    color: {
      pattern: util.warmColors
    },
    axis: {
      rotated: true,
      x: {
        type: 'category',
        tick: { multiline: false }
      },
      y: {
        tick: {
          format: util.formatPercent
        }
      }
    }
  })

  const demoData = data.filter(d => !d.demographic.includes('Total') && d.housing != 'Total')
  dropdownEl.addEventListener('change', (event) => {
    const selected = event.target.value
    const filteredData = demoData.filter(d => d.demographic == selected)
    const plotData = computePlotData(selected, filteredData,
                                     totalDataLabel, totalData)

    chart.unload({ids: loadedDataIds, done: () => {
      chart.load({
        columns: plotData
      })
      loadedDataIds = [totalDataLabel, selected]
    }})
  })
}
