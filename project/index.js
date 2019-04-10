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

const educationPromise = d3.csv('data/resident-households-by-type-of-dwelling-and-highest-qualification-attained-of-head-of-household-2015/resident-households-by-type-of-dwelling-total-and-hqa-of-head-of-household.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_2,
    value: +d.value
  }
})

const educationHDBPromise = d3.csv('data/resident-households-by-type-of-dwelling-and-highest-qualification-attained-of-head-of-household-2015/resident-households-by-type-of-dwelling-hdb-and-hqa-of-head-of-household.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

Promise.all([
  educationPromise,
  educationHDBPromise
]).then(function(data) {
  housingType(data[0], data[1], 'education')
})

const occupationPromise = d3.csv('data/resident-households-by-type-of-dwelling-and-occupation-of-head-of-household-2015/resident-households-by-type-of-dwelling-total-and-occupation-of-head-of-household.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_2,
    value: +d.value
  }
})

const occupationHDBPromise = d3.csv('data/resident-households-by-type-of-dwelling-and-occupation-of-head-of-household-2015/resident-households-by-type-of-dwelling-hdb-and-occupation-of-head-of-household.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

Promise.all([
  occupationPromise,
  occupationHDBPromise
]).then(function(data) {
  housingType(data[0], data[1], 'occupation')
})

const maritalPromise = d3.csv('data/resident-households-by-type-of-dwelling-marital-status-of-head-of-household-and-tenancy-2015/type-of-dwelling-total-marital-status-of-head-of-household-and-tenancy.csv', function(d) {
  return {
    demographic: d.level_1,
    tenancy: d.level_2,
    housing: d.level_3,
    value: +d.value
  }
})

const maritalHDBPromise = d3.csv('data/resident-households-by-type-of-dwelling-marital-status-of-head-of-household-and-tenancy-2015/type-of-dwelling-hdb-marital-status-of-head-of-household-and-tenancy.csv', function(d) {
  return {
    demographic: d.level_1,
    tenancy: d.level_2,
    housing: d.level_4,
    value: +d.value
  }
})

Promise.all([
  maritalPromise,
  maritalHDBPromise
]).then(function(data) {
  const ownerData = data[0].filter(d => d.tenancy === 'Owner')
  const ownerHDBData = data[1].filter(d => d.tenancy === 'Owner')
  housingType(ownerData, ownerHDBData, 'marital')
})

const sexReligionPromise = d3.csv('data/resident-population-aged-15-years-and-over-by-type-of-dwelling-religion-and-sex-2015/resident-population-aged-15-years-and-over-by-type-of-dwelling-broad-religion-and-sex.csv', function(d) {
  return {
    religion: d.level_1,
    sex: d.level_2,
    housing: d.level_3,
    value: +d.value
  }
})

const sexReligionHDBPromise = d3.csv('data/resident-population-aged-15-years-and-over-by-type-of-dwelling-religion-and-sex-2015/resident-population-aged-15-years-and-over-by-type-of-dwelling-hdb-religion-and-sex.csv', function(d) {
  return {
    religion: d.level_1,
    sex: d.level_2,
    housing: d.level_4,
    value: +d.value
  }
})

Promise.all([
  sexReligionPromise,
  sexReligionHDBPromise
]).then(function(data) {
  const sexData = data[0].filter(d => d.religion === 'Total').map(d => ({ ...d, demographic: d.sex }))
  const sexHDBData = data[1].filter(d => d.religion === 'Total').map(d => ({ ...d, demographic: d.sex }))
  housingType(sexData, sexHDBData, 'sex')

  const religionData = data[0].filter(d => d.sex === 'Total').map(d => ({ ...d, demographic: d.religion }))
  const religionHDBData = data[1].filter(d => d.sex === 'Total').map(d => ({ ...d, demographic: d.religion }))
  housingType(religionData, religionHDBData, 'religion')
})

const buttonEls = document.querySelectorAll('.next button')
buttonEls.forEach(b => b.addEventListener('click', e => {
  e.target.parentElement.parentElement.nextElementSibling.scrollIntoView({ behavior: 'smooth' })
}))
