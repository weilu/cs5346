// Example 1
d3.select("body").style("background-color", "black");

// Example 2
d3.select("body")
  .append("svg")
    .attr("height", 500)
    .attr("width", 500)
    .attr("id", "drawhere");

// Example 3
d3.select("#drawhere")
  .append("rect")
    .attr("height", 500)
    .attr("width", 500)
    .attr("id", "background")
    .attr("fill", "white");
    
// Example 4
d3.select("#drawhere")
  .append("g")
     .attr("id", "rectangles")
d3.select("#drawhere")
  .append("g")
     .attr("id", "circles")

// Example 5
let colours = ["red", "blue", "black"];    
for(let i=0; i < colours.length; i+=1) {

  d3.select("#rectangles")
    .append("rect")
        .attr("height", 25)
        .attr("width", 25)
        .attr("x", 35 * i)
        .attr("y", 20)
        .attr("fill", colours[i]);

  d3.select("#circles")
    .append("circle")
        .attr("r", 12)
        .attr("cx", 12 + 35 * i)
        .attr("cy", 60)
        .attr("fill", colours[i]);
}

// Example 6
d3.select("#rectangles")
  .attr("transform", "translate(150,150)");
    
// Example 7
d3.selectAll("circle,rect")
  .filter(function(d, i) {
    return i % 2 === 1;
  })
  .attr("fill", "grey");

// Bonus scripts below,
// reload the page to reset everything

// Example 8
let data = await d3.csv("https://raw.githubusercontent.com/CS5346-Information-Visualisation/CS5346-Information-Visualisation.github.io/master/datasets/sample.csv");

// reload the page once again to reset everything

// Example 9
let w = 300;
let h = 200;
d3.select("body").append("svg").attr("height", h).attr("width", w);
let c = await d3.csv("https://raw.githubusercontent.com/CS5346-Information-Visualisation/CS5346-Information-Visualisation.github.io/master/datasets/sample.csv");
//*****************************************************************//
// wait until the data has been fetched (any log output produced) //
//***************************************************************//
let colours = ["red", "blue", "black"];
for(let i=0; i < c.length; i+=1) {
  let value = Math.floor((c[i].W2 - c[i].W1) * 100)
  let x = 30 + i * w/(c.length); 
  let y = h - (value * 10 + 25); // invert the y-axis
  d3.select("svg").append("circle").attr("cx", x).attr("cy", y).attr("r", value).attr("fill", colours[i%colours.length]);
}
