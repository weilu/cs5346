import util from './utils.js'
import housingTypeSlope from './housing_type_slope.js'

export default function(data, hdbData, keyword, dropdownEl) {
  const totalData = data.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const plotData = totalData.map(d => [d.housing, d.value])
  var chart = c3.generate({
    bindto: `#${keyword} .type-all .viz .housing-type`,
    data: {
      type : 'donut',
      columns: plotData,
    },
    donut: {
      title: "Housing Types",
    },
    color: {
      pattern: d3.schemeCategory10
    }
  })
  const totalPercent = util.getPercentageMap(totalData)

  // HDB plot
  const totalDataLabel = 'National Average'
  var loadedDataIds = [totalDataLabel]
  const totalHDBData = hdbData.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const totalHDBPercent = util.getPercentageMap(totalHDBData)
  const plotHDBData = []
  plotHDBData.push(['type'].concat(totalHDBData.map(d => d.housing)))
  plotHDBData.push([totalDataLabel].concat(totalHDBData.map(d => totalHDBPercent[d.housing])))
  var hdbChart = c3.generate({
    bindto: `#${keyword} .type-hdb .viz .housing-type`,
    data: {
      columns: plotHDBData,
      type : 'bar',
      labels: {
        format: util.formatPercent
      },
      x: 'type'
    },
    axis: {
      x: {
        type: 'category',
      },
      y: {
        show: false
      }
    }
  })

  // on select visualize donut chart
  dropdownEl.addEventListener('change', (event) => {
    const selected = event.target.value
    const filteredLangData = data.filter(d => d.demographic == selected && d.housing != 'Total')
    const plotData = filteredLangData.map(d => [d.housing, d.value])

    chart.load({
      columns: plotData
    })

    // update HDB chart
    const langHDBData = hdbData.filter(d => !d.demographic.includes('Total') && d.housing != 'Total')
    const filteredLangHDBData = langHDBData.filter(d => d.demographic == event.target.value)
    const langHDBPercent = util.getPercentageMap(filteredLangHDBData)
    const plotHDBData = []
    plotHDBData.push(['type'].concat(filteredLangHDBData.map(d => d.housing)))
    plotHDBData.push([selected].concat(filteredLangHDBData.map(d => langHDBPercent[d.housing])))
    hdbChart.unload({ids: loadedDataIds, done: () => {
      hdbChart.load({
        columns: plotHDBData
      })
      loadedDataIds = [totalDataLabel, selected]
    }})

    // Construct & show commentary text
    const langPercent = util.getPercentageMap(filteredLangData)
    const maxType = filteredLangData[d3.scan(filteredLangData, (a, b) => b.value - a.value)]
    const percentage = langPercent[maxType.housing]
    const totalPercentage = totalPercent[maxType.housing]

    var narrativeEl = document.querySelector(`#${keyword} .type-all .narrative`)
    narrativeEl.innerHTML = `<p>A majority (${util.formatPercent(percentage)}) 
                           of ${event.target.value} group live in ${maxType.housing}, </p>`

    narrativeEl = document.querySelector(`#${keyword} .type-all .narrative-slope`)
    narrativeEl.innerHTML = `<p>which is ${util.toComparisonWord(percentage, totalPercentage)} than
                           the national average of ${util.formatPercent(totalPercentage)}.</p>`

    const maxHDBType = filteredLangHDBData[d3.scan(filteredLangHDBData, (a, b) => b.value - a.value)]
    const hdbPercentage = langHDBPercent[maxHDBType.housing]
    const totalHDBPercentage = totalHDBPercent[maxHDBType.housing]

    narrativeEl = document.querySelector(`#${keyword} .type-hdb .narrative`)
    narrativeEl.innerHTML = `<p>Among the ${event.target.value} group HDB residents,
                           the majority (${util.formatPercent(hdbPercentage)})
                           live in ${maxHDBType.housing},</p>`

    narrativeEl = document.querySelector(`#${keyword} .type-hdb .narrative-slope`)
    narrativeEl.innerHTML = `<p>which is ${util.toComparisonWord(hdbPercentage, totalHDBPercentage)} than
                           the national average of ${util.formatPercent(totalHDBPercentage)}.</p>`

    housingTypeSlope(totalPercent, langPercent, keyword, selected,
                     '.type-all .viz .housing-type-slope')
    housingTypeSlope(totalHDBPercent, langHDBPercent, keyword, selected,
                     '.type-hdb .viz .housing-type-slope')

    var event = new Event('type-update')
    event.data = {dimension: keyword, ...langPercent}
    document.dispatchEvent(event)
  })
}
