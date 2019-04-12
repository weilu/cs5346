function toComparisonWord(a, b) {
  return a > b ? 'higher' : 'lower'
}

function formatPercent(n) {
  return d3.format(".1%")(n)
}

function getPercentageMap(data) {
  const total = d3.sum(data.map(d => d.value))
  return data.reduce((acc, d) => {
    acc[d.housing] = d.value/total
    return acc
  }, {})
}

export default {
  toComparisonWord,
  formatPercent,
  getPercentageMap
}
