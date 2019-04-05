import housingType from './housing_type.js'

const languagePromise = d3.csv('data/resident-households-by-type-of-dwelling-and-predominant-household-language-2015/resident-households-by-type-of-dwelling-broad-and-predominant-household-language.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_2,
    value: +d.value
  }
})

const languageHDBPromise = d3.csv('data/resident-households-by-type-of-dwelling-and-predominant-household-language-2015/resident-households-by-type-of-dwelling-hdb-and-predominant-household-language.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

Promise.all([
  languagePromise,
  languageHDBPromise
]).then(function(data) {
  housingType(data[0], data[1], 'language')
})
