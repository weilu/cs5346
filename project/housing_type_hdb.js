import util from './utils.js'
import housingTypeSlope from './housing_type_slope.js'

export default function(hdbData, keyword, dropdownEl) {
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
    color: {
      pattern: util.warmColors
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

  dropdownEl.addEventListener('change', (event) => {
    onSelect(event.target.value)
  })

  // update HDB chart
  function onSelect(selected) {
    const langHDBData = hdbData.filter(d => !d.demographic.includes('Total') && d.housing != 'Total')
    const filteredLangHDBData = langHDBData.filter(d => d.demographic == selected)
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
    const maxHDBType = filteredLangHDBData[d3.scan(filteredLangHDBData, (a, b) => b.value - a.value)]
    const hdbPercentage = langHDBPercent[maxHDBType.housing]
    const totalHDBPercentage = totalHDBPercent[maxHDBType.housing]

    const narrativeEl = document.querySelector(`#${keyword} .type-hdb .narrative`)
    narrativeEl.innerHTML = `<p>Among the ${selected} group HDB residents,
                           the majority (${util.formatPercent(hdbPercentage)})
                           live in ${maxHDBType.housing},
                           which is ${util.toComparisonWord(hdbPercentage, totalHDBPercentage)} than
                           the national average of ${util.formatPercent(totalHDBPercentage)}.</p>`

    housingTypeSlope(totalHDBPercent, langHDBPercent, keyword, selected,
                     '.type-hdb .viz .housing-type-slope')

    // var event = new Event('type-update')
    // event.data = {dimension: keyword, ...langPercent}
    // document.dispatchEvent(event)
  }
}
