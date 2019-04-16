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

export default function(data, keyword, dropdownEl, colorIndex) {
  const totalData = data.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const totalDataLabel = 'National Average'
  var loadedDataIds = [totalDataLabel]
  const plotData = computePlotData(totalDataLabel, totalData)

  var chart = c3.generate({
    bindto: `#${keyword} .viz .district`,
    data: {
      type: 'bar',
      columns: plotData,
      x: 'district',
      color: (c, d) => {
        if (d.id === totalDataLabel) {
          return util.warmColors[0]
        } else {
          return util.warmColors[colorIndex]
        }
      }
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

  const totalPercent = util.getPercentageMap(totalData)

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

    const maxDidstrict = filteredData[d3.scan(filteredData, (a, b) => b.value - a.value)]
    var narrative = `The most popular district for ${selected} group
      is ${maxDidstrict.housing}. `

    const filteredPercent = util.getPercentageMap(filteredData)
    const sortedDistrictByDiffPercent = Object.keys(totalPercent)
      .map(d => [d, filteredPercent[d] - totalPercent[d]])
      .sort((a, b) => a[1] - b[1])
    const morePopularDistrict = sortedDistrictByDiffPercent[sortedDistrictByDiffPercent.length - 1][0]
    const lessPopularDistrict = sortedDistrictByDiffPercent[0][0]
    narrative += `Most differently from the national average,
      ${morePopularDistrict} is more popular within the ${selected} group,
      while ${lessPopularDistrict} is less popular within the ${selected} group.`

    const narrativeEl = document.querySelector(`#${keyword} .district-all .narrative`)
    narrativeEl.innerHTML = `<p>${narrative}</p>`

    var event = new Event('district-update')
    event.data = {dimension: keyword, ...filteredPercent}
    document.dispatchEvent(event)
  })
}
