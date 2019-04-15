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

function cleanLanguageData(data) {
  data.forEach(d => {
    if (d.demographic === 'Chinese Dialects- Total') {
      d.demographic = 'Chinese Dialects'
    } else if (d.demographic.includes('Indian Languages') &&
             d.demographic !== 'Indian Languages- Total') {
      d.demographic = d.demographic.replace('Indian Languages- ', '')
    }
  })
}

// deal with "1-and 2-Room Flats" "1- and 2-Room Flats"
function cleanHDBData(data) {
  data.forEach(d => {
    d.housing = d.housing.replace(/- /g, '-').replace('and', '&')
  })
}

function tallyVotes (summaryData) {
  const votes = {} // {HDB: [education, gender], landed: [language]}
  const dimensions = Object.keys(summaryData)
  dimensions.forEach(d => {
    var vote = null
    var voteVal = 0
    Object.keys(summaryData[d]).forEach(type => {
      if (summaryData[d][type] > voteVal) {
        voteVal = summaryData[d][type]
        vote = type
      }
    })

    if (votes[vote] == null) {
      votes[vote] = [d]
    } else {
      votes[vote].push(d)
    }
  })
  return votes
}

function majorityRuleRanked(votes) {
  const typeValuePairs = Object.keys(votes).map(t => [t, votes[t]])
  return typeValuePairs.sort((a, b) => b[1].length - a[1].length)
}

function majorityRuleWinnerAndSupporters(votes) {
  return majorityRuleRanked(votes)[0]
}

// 99% accessible colors: https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
// grey is the first color for national average
const warmColors = ['#a9a9a9', '#800000', '#e6194B', '#9A6324', '#f58231', '#f032e6', '#ffe119', '#fabebe', '#e6beff']
const coolColors = ['#4363d8', '#3cb44b', '#42d4f4', '#000075', '#469990', '#aaffc3']

export default {
  toComparisonWord,
  formatPercent,
  getPercentageMap,
  warmColors,
  coolColors,
  cleanLanguageData,
  cleanHDBData,
  tallyVotes,
  majorityRuleRanked,
  majorityRuleWinnerAndSupporters,
}
