import dropdown from './dropdown.js'
import district from './district.js'
import housingType from './housing_type.js'
import housingTypeHDB from './housing_type_hdb.js'
import housingTypeSummary from './housing_type_summary.js'
import resale from './resale_prices.js'
import buildMap from './pick_estate.js'
import util from './utils.js'

const dimensions = []

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

const languageAll = Promise.all([
  languagePromise,
  languageHDBPromise,
  languageDistrictPromise
]).then(function(data) {
  const dimension = 'language'
  dimensions.push(dimension)
  // use district data for dropdown as it's aggregated for chinese dialects
  const dropdownEl = dropdown(data[2], dimension)
  util.cleanLanguageData(data[0])
  util.cleanLanguageData(data[1])
  housingType(data[0], dimension, dropdownEl)
  housingTypeHDB(data[1], dimension, dropdownEl, dimensions.length)
  district(data[2], dimension, dropdownEl, dimensions.length)
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
  dimensions.push(dimension)
  const dropdownEl = dropdown(data[0], dimension)
  housingType(data[0], dimension, dropdownEl)
  housingTypeHDB(data[1], dimension, dropdownEl, dimensions.length)
  district(data[2], dimension, dropdownEl, dimensions.length)
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
  dimensions.push(dimension)
  const dropdownEl = dropdown(data[0], dimension)
  housingType(data[0], dimension, dropdownEl)
  housingTypeHDB(data[1], dimension, dropdownEl, dimensions.length)
  district(data[2], dimension, dropdownEl, dimensions.length)
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
  dimensions.push(dimension)
  const ownerData = data[0].filter(d => d.tenancy === 'Owner')
  const ownerHDBData = data[1].filter(d => d.tenancy === 'Owner')
  const dropdownEl = dropdown(ownerData, dimension)
  housingType(ownerData, dimension, dropdownEl)
  housingTypeHDB(ownerHDBData, dimension, dropdownEl, dimensions.length)

  const maritalData = data[2].filter(d => d.sex === 'Total')
  district(maritalData, dimension, dropdownEl, dimensions.length)
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
  dimensions.push(dimension)
  const sexData = data[0].filter(d => d.religion === 'Total').map(d => ({ ...d, demographic: d.sex }))
  const sexHDBData = data[1].filter(d => d.religion === 'Total').map(d => ({ ...d, demographic: d.sex }))
  var dropdownEl = dropdown(sexData, dimension)
  housingType(sexData, dimension, dropdownEl)
  housingTypeHDB(sexHDBData, dimension, dropdownEl, dimensions.length)

  dimension = 'religion'
  dimensions.push(dimension)
  const religionData = data[0].filter(d => d.sex === 'Total').map(d => ({ ...d, demographic: d.religion }))
  const religionHDBData = data[1].filter(d => d.sex === 'Total').map(d => ({ ...d, demographic: d.religion }))
  dropdownEl = dropdown(religionData, dimension)
  housingType(religionData, dimension, dropdownEl)
  housingTypeHDB(religionHDBData, dimension, dropdownEl, dimensions.length)
  district(data[2], dimension, dropdownEl, dimensions.length)
})

const pricesBasedOnLocationPromise = d3.csv('data/median-resale-prices-for-registered-applications-by-town-and-flat-type/median-resale-prices-for-registered-applications-by-town-and-flat-type.csv', function(d) {
    return {
       quarter: d.quarter,
       town: d.town,
       flat_type: d.flat_type.toLowerCase(),
       price: d.price
    }
})

function getTypesFromSummaryData(data, sorted) {
  var allTypes = Object.values(data)
                       .reduce((acc, curr) => acc.concat(Object.keys(curr)), [])
  allTypes = d3.set(allTypes).values()
  if (sorted) {
    allTypes = allTypes.sort()
  }
  return allTypes
}

const summaryData = {}
const summaryHDBData = {}
const summaryDistrictData = {}
const recommendations = {}
Promise.all([
  pricesBasedOnLocationPromise,
  languageAll,
  educationAll,
  occupationAll,
  maritalAll,
  sexReligionAll
]).then((data) => {
  const resaleData = data[0]

  document.addEventListener('type-update', (e) => {
    const colorDomain = getTypesFromSummaryData(summaryData, false)
    var color = d3.scaleOrdinal()
      .domain(colorDomain)
      .range(util.coolColors)
    const typeWinner = housingTypeSummary(e.data, "#type-summary .viz",
      summaryData, dimensions, color)
    recommendations.type = typeWinner
    updatePriceViz(recommendations)
  }, false);
  document.addEventListener('type-hdb-update', (e) => {
    const colorDomain = getTypesFromSummaryData(summaryHDBData, true)
    var color = d3.scaleOrdinal()
      .domain(colorDomain)
      .range(d3.schemeYlOrRd[5].slice(1))
    const hdbTypeWinner = housingTypeSummary(e.data, "#type-hdb-summary .viz",
      summaryHDBData, dimensions, color)
    recommendations.hdbType = hdbTypeWinner
    updatePriceViz(recommendations)
  }, false);

  document.addEventListener('district-update', (e) => {
    summaryDistrictData[e.data.dimension] = e.data
    delete summaryDistrictData[e.data.dimension].dimension
    const districtVotes = util.tallyVotes(summaryDistrictData)
    const sortedDistrictAndDims = util.majorityRuleRanked(districtVotes)
    const winner = sortedDistrictAndDims[0][0]
    const topDimensions = sortedDistrictAndDims[0][1]

    const narrativeEl = document.querySelector(`#district-summary div.narrative`)
    var narrative = `The most popular district is <b>${winner}</b>
      among your demographic groups of ${topDimensions.join(', ')}`
    if (sortedDistrictAndDims.length > 1) {
      narrative += `, followed by `
      narrative += sortedDistrictAndDims.slice(1)
        .map(dd => `district ${dd[0]} among your demographic groups of ${dd[1].join(', ')}`)
        .join(' and ')
    }
    narrativeEl.innerHTML = `<p>${narrative}.</p>`

    const summaryMap = buildMap(document.querySelector('#summary-map'), true, function() {
      const numColors = sortedDistrictAndDims.length < 3 ? 3 : sortedDistrictAndDims.length
      const colors = d3.schemeYlGn[numColors].slice().reverse()
      for (var i = 0; i < sortedDistrictAndDims.length; i++) {
        const highlightOptions = {
          fillColor: colors[i],
          fillOpacity: 1,
        }
        summaryMap.highlightWithColor(sortedDistrictAndDims[i][0].toUpperCase(), highlightOptions)
      }
    })

    recommendations.district = winner
    updatePriceViz(recommendations)
  }, false);

  function updatePriceViz(recommendations) {
    if (Object.keys(recommendations).length !== 3 || recommendations.type !== 'HDB Dwellings') return

    resale(resaleData, recommendations.district, recommendations.hdbType)
  }
})


const selectEl = document.querySelectorAll('select')
selectEl.forEach(b => b.addEventListener('change', e => {
  e.target.parentElement.nextElementSibling.scrollIntoView({ behavior: 'smooth' })
}))

