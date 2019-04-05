function getPercentageMap(data) {
  const total = d3.sum(data.map(d => d.value))
  return data.reduce((acc, d) => {
    acc[d.housing] = d.value/total
    return acc
  }, {})
}

function toComparisonWord(a, b) {
  return a > b ? 'higher' : 'lower'
}

function formatPercent(n) {
  return d3.format(".1%")(n)
}

export default function(languageData) {
  const allLangData = languageData.filter(d => d.language === 'Total' && d.housing != 'Total')
  const plotData = allLangData.map(d => [d.housing, d.value])
  var chart = c3.generate({
    bindto: '#language-viz',
    data: {
      type : 'donut',
      columns: plotData,
    },
    donut: {
      title: "Housing types",
    }
  })
  const totalPercent = getPercentageMap(allLangData)

  // populate language select options
  const langData = languageData.filter(d => !d.language.includes('Total') && d.housing != 'Total')
  var languages = d3.set(langData.map(d => d.language)).values()
  const langSelect = document.getElementById('type-language');
  languages.forEach(l => langSelect.insertAdjacentHTML('afterbegin', '<option value="' + l + '">' + l + '</option>'))

  // on select visualize donut chart
  langSelect.addEventListener('change', (event) => {
    const filteredLangData = langData.filter(d => d.language == event.target.value)
    const plotData = filteredLangData.map(d => [d.housing, d.value])

    chart.load({
      columns: plotData
    })
    d3.select('#language-viz .c3-chart-arcs-title')
      .node().innerHTML = `${event.target.value} Speakers`

    // Construct & show commentary text
    const langPercent = getPercentageMap(filteredLangData)
    const maxType = filteredLangData[d3.scan(filteredLangData, (a, b) => b.value - a.value)]
    const percentage = langPercent[maxType.housing]
    const totalPercentage = totalPercent[maxType.housing]

    const resultDiv = document.querySelector('#language-result')
    resultDiv.innerHTML = `<p>A majority (${formatPercent(percentage)}) 
                           of ${event.target.value} speakers live in ${maxType.housing},
                           which is ${toComparisonWord(percentage, totalPercentage)} than
                           the national average of ${formatPercent(totalPercentage)}.</p>`
    resultDiv.innerHTML += '<button>Next</button>'
    if (!resultDiv.className.includes('fade-in')) {
      resultDiv.className += ' fade-in'
    }
  })
}
