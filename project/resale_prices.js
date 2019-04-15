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

  flatType = flatType.toLowerCase()
  const priceflatTypes = d3.set(data.map(d => d.flat_type))
  if (!priceflatTypes.has(flatType)) {
    console.log(priceflatTypes.values() + ' does not contain ' + flatType)
  }

     const priceInformation = data.filter(priceInfo => priceInfo.town === town && flatType.includes(priceInfo.flat_type)).map(d => ({ quarter: d.quarter, price: d.price }))
     const timeXaxis = ['x'].concat(priceInformation.map(
                           info=> parseDate(info.quarter)))
     const priceYaxis= [flatType].concat(priceInformation.map(info=> info.price))


   var chart = c3.generate({

         bindto: `#${"prices"} .viz .top.leftviz`,
         data: {
             x: 'x',
             columns: [
                 timeXaxis,
                 priceYaxis
             ]
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
                label: 'Price/SGD',
                tick:{
                    format: d3.format(".2s")
                }
             }
         },
         tooltip: {
             format: {
                 title: function (d) { return ("Date: "+ (new Date(d).getMonth() + 1) +" / " + new Date(d).getFullYear())},
                 value: function (d) {
                    return d
                 }
             }
         }
     });

}
