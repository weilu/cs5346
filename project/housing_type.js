import util from './utils.js'
import housingTypeSlope from './housing_type_slope.js'

function getPercentageMap(data) {
  const total = d3.sum(data.map(d => d.value))
  return data.reduce((acc, d) => {
    acc[d.housing] = d.value/total
    return acc
  }, {})
}

export default function(data, hdbData, keyword) {
  const totalData = data.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const plotData = totalData.map(d => [d.housing, d.value])
  var chart = c3.generate({
    bindto: `#${keyword} .viz .top.leftviz`,
    data: {
      type : 'donut',
      columns: plotData,
    },
    donut: {
      title: "All Housing Types",
    },
    color: {
      pattern: d3.schemeCategory10
    }
  })
  const totalPercent = getPercentageMap(totalData)

  // HDB plot
  const totalHDBData = hdbData.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const plotHDBData = totalHDBData.map(d => [d.housing, d.value])
  var hdbChart = c3.generate({
    bindto: `#${keyword} .viz .top.rightviz`,
    data: {
      type : 'donut',
      columns: plotHDBData,
    },
    donut: {
      title: "HDB Housing Types",
    },
    color: {
      pattern: d3.schemeBlues[plotHDBData.length + 2]
    }
  })
  const totalHDBPercent = getPercentageMap(totalHDBData)

  // populate select options
  const langData = data.filter(d => !d.demographic.includes('Total') && d.housing != 'Total')
  var demographics = d3.set(langData.map(d => d.demographic)).values()
  const langSelect = document.querySelector(`#type-${keyword}`);
  demographics.forEach(l => langSelect.insertAdjacentHTML('afterbegin', '<option value="' + l + '">' + l + '</option>'))

  // on select visualize donut chart
  langSelect.addEventListener('change', (event) => {
    const selected = event.target.value
    const filteredLangData = langData.filter(d => d.demographic == selected)
    const plotData = filteredLangData.map(d => [d.housing, d.value])

    chart.load({
      columns: plotData
    })
    d3.select(`#${keyword} .viz .c3-chart-arcs-title`)
      .node().innerHTML = `${event.target.value} Group`

    // update HDB chart
    const langHDBData = hdbData.filter(d => !d.demographic.includes('Total') && d.housing != 'Total')
    const filteredLangHDBData = langHDBData.filter(d => d.demographic == event.target.value)
    const plotHDBData = filteredLangHDBData.map(d => [d.housing, d.value])
    hdbChart.load({
      columns: plotHDBData
    })

    // Construct & show commentary text
    const langPercent = getPercentageMap(filteredLangData)
    const maxType = filteredLangData[d3.scan(filteredLangData, (a, b) => b.value - a.value)]
    const percentage = langPercent[maxType.housing]
    const totalPercentage = totalPercent[maxType.housing]

    const langHDBPercent = getPercentageMap(filteredLangHDBData)
    const maxHDBType = filteredLangHDBData[d3.scan(filteredLangHDBData, (a, b) => b.value - a.value)]
    const hdbPercentage = langHDBPercent[maxHDBType.housing]
    const totalHDBPercentage = totalHDBPercent[maxHDBType.housing]

    const resultDiv = document.querySelector(`#${keyword} .narrative`)
    resultDiv.innerHTML = `<p>A majority (${util.formatPercent(percentage)}) 
                           of ${event.target.value} group live in ${maxType.housing},
                           which is ${util.toComparisonWord(percentage, totalPercentage)} than
                           the national average of ${util.formatPercent(totalPercentage)}. 
                           Among the ${event.target.value} group HDB residents,
                           the majority (${util.formatPercent(hdbPercentage)})
                           live in ${maxHDBType.housing},
                           which is ${util.toComparisonWord(hdbPercentage, totalHDBPercentage)} than
                           the national average of ${util.formatPercent(totalHDBPercentage)}.</p>`
    if (!resultDiv.className.includes('fade-in')) {
      resultDiv.className += ' fade-in'
    }

    housingTypeSlope(totalPercent, langPercent, keyword, selected, '.bottom.leftviz')
    housingTypeSlope(totalHDBPercent, langHDBPercent, keyword, selected, '.bottom.rightviz')

    var event = new Event('type-update')
    event.data = {dimension: keyword, ...langPercent}
    document.dispatchEvent(event)
  })
}
