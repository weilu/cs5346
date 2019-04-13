export default function(data, keyword) {
  // populate select options
  const filteredData = data.filter(d => (
    !d.demographic.includes('Total') &&
    d.housing != 'Total'
  ))
  var demographics = d3.set(filteredData.map(d => d.demographic)).values()
  const selectEl = document.querySelector(`#type-${keyword}`);
  demographics.forEach(l => selectEl.insertAdjacentHTML('afterbegin', '<option value="' + l + '">' + l + '</option>'))

  return selectEl
}
