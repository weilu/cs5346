import util from './utils.js'

export default function(xAxis,yAxis, keyword) {

   var chart = c3.generate({

         bindto: `#${keyword} .viz .top.leftviz`,
         data: {
             x: 'x',
             columns: [
                 xAxis,
                 yAxis
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
