import util from './utils.js'
import housingTypeSlope from './housing_type_slope.js'

export default function(data, hdbData, keyword, dropdownEl) {
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
  const totalPercent = util.getPercentageMap(totalData)

  // HDB plot
  const totalHDBData = hdbData.filter(d => d.demographic === 'Total' && d.housing != 'Total')
  const totalHDBPercent = util.getPercentageMap(totalHDBData)
  const plotHDBData = totalHDBData.map(d => [d.housing, totalHDBPercent[d.housing]])
  var hdbChart = c3.generate({
    bindto: `#${keyword} .viz .top.rightviz`,
    data: {
      columns: plotHDBData,
      type : 'bar',
      groups: [plotHDBData.map(d => d[0])],
      labels: {
        format: util.formatPercent
      },
      order: null
    },
    axis: {
      rotated: true,
      x: {
        type: 'category',
        show: false
      },
      y: {
        show: false
      }
    },
    color: {
      pattern: d3.schemeBlues[plotHDBData.length + 2]
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
    const langPercent = util.getPercentageMap(filteredLangData)
    const maxType = filteredLangData[d3.scan(filteredLangData, (a, b) => b.value - a.value)]
    const percentage = langPercent[maxType.housing]
    const totalPercentage = totalPercent[maxType.housing]

    const langHDBPercent = util.getPercentageMap(filteredLangHDBData)
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
