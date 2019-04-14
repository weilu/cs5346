import util from './utils.js'
import housingTypeSlope from './housing_type_slope.js'

export default function(data, keyword, dropdownEl) {
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
      pattern: util.coolColors
    }
  })
  const totalPercent = util.getPercentageMap(totalData)

  dropdownEl.addEventListener('change', (event) => {
    onSelect(event.target.value)
  })

  function onSelect(selected) {
    const filteredLangData = data.filter(d => d.demographic == selected && d.housing != 'Total')
    const plotData = filteredLangData.map(d => [d.housing, d.value])

    chart.unload()
    chart.load({
      columns: plotData
    })

    // Construct & show commentary text
    const langPercent = util.getPercentageMap(filteredLangData)
    const maxType = filteredLangData[d3.scan(filteredLangData, (a, b) => b.value - a.value)]
    const percentage = langPercent[maxType.housing]
    const totalPercentage = totalPercent[maxType.housing]

    var narrativeEl = document.querySelector(`#${keyword} .type-all .narrative`)
    narrativeEl.innerHTML = `<p>A majority (${util.formatPercent(percentage)}) 
                           of ${selected} group live in ${maxType.housing},
                           which is ${util.toComparisonWord(percentage, totalPercentage)} than
                           the national average of ${util.formatPercent(totalPercentage)}.</p>`

    housingTypeSlope(totalPercent, langPercent, keyword, selected,
                     '.type-all .viz .housing-type-slope')

    var event = new Event('type-update')
    event.data = {dimension: keyword, ...langPercent}
    document.dispatchEvent(event)
  }
}
