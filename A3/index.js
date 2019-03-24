import q1 from './q1.js'

d3.json("ArXiv.json").then(function(data) {
  q1(data)
})
