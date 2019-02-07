import q1 from './q1.js'
import q2 from './q2.js'
import q3 from './q3.js'
import q4 from './q4.js'

d3.csv("results.csv", function(d) {
  return {
    method : d.method,
    bufSize : d.bufSize,
    quality : +d.quality,
    change : +d.change,
    inefficiency : +d.inefficiency,
    qoe: +d.qoe,
    profile: d.profile,
    sample: d.sample,
    numStall: +d.numStall
  }
}).then(function(data) {
  const bufSizes = d3.set(data.map(d => d.bufSize)).values()
  q1(data, bufSizes)
  q2(data, bufSizes)
  q3(data, bufSizes)
  q4(data, bufSizes)
})
