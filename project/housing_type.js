export default function(languageData) {
  console.log(languageData)
  const langData = languageData.filter(d => !d.language.includes('Total') && d.housing != 'Total')

  // populate language select options
  var languages = d3.set(langData.map(d => d.language)).values()
  const langSelect = document.getElementById('type-language');
  languages.forEach(l => langSelect.insertAdjacentHTML('afterbegin', '<option value="' + l + '">' + l + '</option>'))

  // on select visualize donut chart
  langSelect.addEventListener('change', (event) => {
    const filteredLangData = langData.filter(d => d.language == event.target.value)
    const plotData = filteredLangData.map(d => [d.housing, d.value])

    c3.generate({
      bindto: '#language-viz',
      data: {
        columns: plotData,
        type : 'donut',
      },
      donut: {
        title: `${event.target.value} Speakers`
      }
    });
  })
}
