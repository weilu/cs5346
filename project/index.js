import dropdown from './dropdown.js'
import district from './district.js'
import housingType from './housing_type.js'
import housingTypeSummary from './housing_type_summary.js'
import resale from './resale_prices.js'

const dimensions = []
const summaryData = {}

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

const languageDistrictPromise = d3.csv('data/resident-pop-aged-5-years-and-over-by-planning-area-language-most-frequently-spoken-at-home-2015/aged-5-years-and-over-by-planning-area-and-language-most-frequently-spoken-at-home.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

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

const languageAll = Promise.all([
  languagePromise,
  languageHDBPromise,
  languageDistrictPromise
]).then(function(data) {
  const dimension = 'language'
  // use district data for dropdown as it's aggregated for chinese dialects
  const dropdownEl = dropdown(data[2], dimension)
  cleanLanguageData(data[0])
  cleanLanguageData(data[1])
  housingType(data[0], data[1], dimension, dropdownEl)
  district(data[2], dimension, dropdownEl)
  dimensions.push(dimension)
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

const educationDistrictPromise = d3.csv('data/resident-population-aged-15-years-and-over-by-planning-area-and-highest-qualification-attained-2015/resident-population-aged-15-years-and-over-by-planning-area-and-hqa.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

const educationAll = Promise.all([
  educationPromise,
  educationHDBPromise,
  educationDistrictPromise
]).then(function(data) {
  const dimension = 'education'
  const dropdownEl = dropdown(data[0], dimension)
  housingType(data[0], data[1], dimension, dropdownEl)
  district(data[2], dimension, dropdownEl)
  dimensions.push(dimension)
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

const occupationDistrictPromise = d3.csv('data/resident-working-persons-aged-15-years-and-over-by-planning-area-and-occupation-2015/resident-working-persons-aged-15-years-and-over-by-planning-area-and-occupation.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

const occupationAll = Promise.all([
  occupationPromise,
  occupationHDBPromise,
  occupationDistrictPromise
]).then(function(data) {
  const dimension = 'occupation'
  const dropdownEl = dropdown(data[0], dimension)
  housingType(data[0], data[1], dimension, dropdownEl)
  district(data[2], dimension, dropdownEl)
  dimensions.push(dimension)
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

const maritalDistrictPromise = d3.csv('data/resident-population-aged-15-years-and-over-by-planning-area-marital-status-and-sex-2015/resident-population-aged-15-years-and-over-by-planning-area-marital-status-and-sex.csv', function(d) {
  return {
    demographic: d.level_1,
    sex: d.level_2,
    housing: d.level_4,
    value: +d.value
  }
})

const maritalAll = Promise.all([
  maritalPromise,
  maritalHDBPromise,
  maritalDistrictPromise
]).then(function(data) {
  const dimension = 'marital'
  const ownerData = data[0].filter(d => d.tenancy === 'Owner')
  const ownerHDBData = data[1].filter(d => d.tenancy === 'Owner')
  const dropdownEl = dropdown(ownerData, dimension)
  housingType(ownerData, ownerHDBData, dimension, dropdownEl)

  const maritalData = data[2].filter(d => d.sex === 'Total')
  district(maritalData, dimension, dropdownEl)
  dimensions.push(dimension)
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

const religionDistrictPromise = d3.csv('data/resident-population-aged-15-years-and-over-by-planning-area-and-religion-2015/resident-population-aged-15-years-and-over-by-planning-area-and-religion.csv', function(d) {
  return {
    demographic: d.level_1,
    housing: d.level_3,
    value: +d.value
  }
})

const sexReligionAll = Promise.all([
  sexReligionPromise,
  sexReligionHDBPromise,
  religionDistrictPromise
]).then(function(data) {
  var dimension = 'sex'
  const sexData = data[0].filter(d => d.religion === 'Total').map(d => ({ ...d, demographic: d.sex }))
  const sexHDBData = data[1].filter(d => d.religion === 'Total').map(d => ({ ...d, demographic: d.sex }))
  var dropdownEl = dropdown(sexData, dimension)
  housingType(sexData, sexHDBData, dimension, dropdownEl)
  dimensions.push(dimension)

  dimension = 'religion'
  const religionData = data[0].filter(d => d.sex === 'Total').map(d => ({ ...d, demographic: d.religion }))
  const religionHDBData = data[1].filter(d => d.sex === 'Total').map(d => ({ ...d, demographic: d.religion }))
  dropdownEl = dropdown(religionData, dimension)
  housingType(religionData, religionHDBData, dimension, dropdownEl)
  district(data[2], dimension, dropdownEl)
  dimensions.push(dimension)
})


const pricesBasedOnLocationPromise = d3.csv('data/median-resale-prices-for-registered-applications-by-town-and-flat-type/median-resale-prices-for-registered-applications-by-town-and-flat-type.csv', function(d) {
    return {
       quarter: d.quarter,
       town: d.town,
       flat_type: d.flat_type,
       price: d.price
    }
})

function parseDate(date){
    var splitted = date.split('-');
    var quarterEndMonth = splitted[1].charAt(1) * 3;
    var quarterStartMonth = quarterEndMonth - 3;
    var parseTime = d3.timeParse('%m %Y');
    return parseTime(quarterStartMonth + ' ' + splitted[0]);
}



const priceInfoAll = Promise.all([
  pricesBasedOnLocationPromise
]).then(function(data) {
  var dimension = "prices"
  const town = "Ang Mo Kio"
  const flatType = "3-room"
  const priceInformation = data[0].filter(priceInfo => priceInfo.town === town && priceInfo.flat_type === flatType).map(d => ({ quarter: d.quarter, price: d.price }))
  const timeXaxis = ['x'].concat(priceInformation.map(
                        info=> parseDate(info.quarter)))
  const priceYaxis= [flatType].concat(priceInformation.map(info=> info.price))

  resale(timeXaxis, priceYaxis, dimension)
  dimensions.push(dimension)

})


// Housing type summary using parallel coordinates
Promise.all([
  languageAll,
  educationAll,
  occupationAll,
  maritalAll,
  sexReligionAll
//  priceInfoAll
]).then(() => {
  document.addEventListener('type-update', function (e) {
    // e.data = {dimension: language, HDB: 0.34, Landed: 0.02, Others: 0.1}}
    summaryData[e.data.dimension] = e.data
    delete summaryData[e.data.dimension].dimension
    var allTypes = Object.values(summaryData)
                         .reduce((acc, curr) => acc.concat(Object.keys(curr)), [])
    allTypes = d3.set(allTypes).values()
    const summaryPlotData = allTypes.map(type => {
      const data = {type: type}
      Object.keys(summaryData).forEach(dim => {
        data[dim] = summaryData[dim][type] || 0
      })
      return data
    })
    housingTypeSummary(dimensions, summaryPlotData)
  }, false);
})

const buttonEls = document.querySelectorAll('.next button')
buttonEls.forEach(b => b.addEventListener('click', e => {
  e.target.parentElement.parentElement.nextElementSibling.scrollIntoView({ behavior: 'smooth' })
}))

