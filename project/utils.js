function toComparisonWord(a, b) {
  return a > b ? 'higher' : 'lower'
}

function formatPercent(n) {
  return d3.format(".1%")(n)
}

export default {
  toComparisonWord,
  formatPercent
}
