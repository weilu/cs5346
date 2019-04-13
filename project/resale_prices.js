import util from './utils.js'

export default function(xAxis,yAxis, keyword) {

   var chart = c3.generate({

         bindto: `#${keyword} .viz .top.leftviz`,
         data: {
             columns: [
                 xAxis,
                 yAxis
             ]
         },
         axis: {
             x: {
                 tick: {
                     format: '%Y-%m-%d'
                 }
             }
         }
     });

}
