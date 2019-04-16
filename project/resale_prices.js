import util from './utils.js'

function parseDate(date){
  var splitted = date.split('-');
  var quarterEndMonth = splitted[1].charAt(1) * 3;
  var quarterStartMonth = quarterEndMonth - 3;
  var parseTime = d3.timeParse('%m %Y');
  return parseTime(quarterStartMonth + ' ' + splitted[0]);
}

export default function(data, town, flatType) {
  const priceTowns = d3.set(data.map(d => d.town))
  if (!priceTowns.has(town)) {
    console.log(priceTowns.values() + ' does not contain ' + town)
  }

  flatType = flatType.toLowerCase().replace(/ flats/, '').replace('1-&', '1-room &')
  const flatTypes = flatType.includes(' & ') ? flatType.split(' & ') : [flatType]

  const priceflatTypes = d3.set(data.map(d => d.flat_type))
  flatTypes.forEach(t => {
    if (!priceflatTypes.has(t)) {
      console.log(priceflatTypes.values() + ' does not contain ' + t)
    }
  })

  const priceInformation = data
    .filter(info => (info.town === town && flatTypes.includes(info.flat_type)))

  const priceQuarterTypeMap = priceInformation.reduce((acc, info) => {
    if (acc[info.quarter] == null) {
      acc[info.quarter] = {}
    }
    acc[info.quarter][info.flat_type] = info.price
    return acc
  }, {})

  const dates = Object.keys(priceQuarterTypeMap)
  const plotData = []
  plotData.push(['x'].concat(dates.map(parseDate)))
  const typePrices = []
  flatTypes.forEach(t => {
    const prices = dates.map(d => priceQuarterTypeMap[d][t])
    typePrices.push(prices)
    plotData.push([t].concat(prices))
  })

  function getColorPattern() {
    return {
      '1-room & 2-room': [d3.rgb('#fecc5c').brighter().hex(),
                          d3.rgb('#fecc5c').darker().hex()],
      '3-room': ['#fd8d3c'],
      '4-room': ['#f03b20'],
      '5-room & executive': [d3.rgb('#bd0026').brighter().hex(),
                             d3.rgb('#bd0026').darker().hex()]
    }[flatType]
  }

  var chart = c3.generate({

    bindto: '#summary-price',
    data: {
      x: 'x',
      columns: plotData,
    },
    axis: {
      x: {
        label: 'Year',
        type: 'timeseries',
        tick: {
          format: '%Y'
        }
      },
      y:{
        label: 'Price(SGD)',
        tick:{
          format: d3.format(".2s")
        }
      }
    },
    tooltip: {
      format: {
        title: function (d) { 
          const date = new Date(d)
          const quarter = Math.floor((date.getMonth() + 3) / 3)
          const year = date.getFullYear()
          return `${year} Q${quarter}`
        },
        value: formatMoney
      }
    },
    color: {
      pattern: getColorPattern()
    }
  });

  const latestPrices = typePrices.map(priceArray => {
    return priceArray.reverse().reduce((acc, curr) => {
     if (acc == null && !isNaN(curr)) {
        acc = curr
      }
      return acc
    }, null)
  })
  const estimatedPrice = latestPrices.map(formatMoney).join(' to ')
  var narrative = `You can expect to spend ${estimatedPrice} for
    a resale ${flatType} flat in ${town}, according to the median price
    from the last transacted quarter.`
  narrative += ` Below is the quarterly median resale price history of
    ${flatType} flat in ${town} for your reference.`
  const narrativeEl = document.querySelector(`#price-summary .narrative`)
  narrativeEl.innerHTML = `<p>${narrative}</p>`
}

function formatMoney(d) {
  return "$" + d3.format(",.0f")(d)
}
