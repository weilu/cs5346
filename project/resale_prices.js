import util from './utils.js'

export default function(xAxis,yAxis, keyword) {

  var chart = c3.generate({
      data: {
          x: 'x',
          bindto: `#${keyword} .viz .top.leftviz`,
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
