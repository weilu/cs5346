import q2 from './q2.js'
import q3 from './q3.js'

d3.csv("results.csv", function(d) {
  return {
    method : d.method,
    bufSize : d.bufSize,
    quality : +d.quality,
    inefficiency : +d.inefficiency,
    qoe: +d.qoe
  }
}).then(function(data) {
  q2(data)
  q3(data)
})
