import q1 from './q1.js'
import q3 from './q3.js'

d3.json("ArXiv.json").then(function(data) {
  q1(data)
})

d3.json("ICSE.json").then(function(data) {
  q3(data)
})
