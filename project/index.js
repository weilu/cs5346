import housingType from './housing_type.js'

d3.csv('data/resident-households-by-type-of-dwelling-and-predominant-household-language-2015/resident-households-by-type-of-dwelling-broad-and-predominant-household-language.csv', function(d) {
  return {
    language: d.level_1,
    housing: d.level_2,
    value: +d.value
  }
}).then(housingType)
