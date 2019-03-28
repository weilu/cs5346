// Referenced https://d3indepth.com/layouts/
import util from './utils.js'

var margin = {top: 20, right: 0, bottom: 100, left: 200},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    gridSize = Math.floor(height / 10), legendElementWidth = gridSize * 2

export default function(data) {
  var svg =
      d3.select('#q4b')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr(
              'transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const authors = {}

                  data.forEach(function(paper) {
                    paper.authors.forEach((d) => d.ids.forEach(function(id) {
                      if (authors[id] == null) {
                        authors[id] = {name: d.name, papers: 1}
                      } else {
                        authors[id].papers = authors[id].papers + 1;
                      }
                    }))
                  });

  const authorsCount = {'name': 'papers', 'children': []};

  for (const id in authors) {
    const author = authors[id];
    authorsCount.children.push(author);
  }

  // authorsCount.children.sort(function(a, b) { return a.papers > b.papers; });

  var root = d3.hierarchy(authorsCount)
                 .sum(function(d) {
                   return d.papers;
                 })
                 .sort(function(a, b) {
                   return a > b;
                 });

  var treemap = d3.treemap().size([width, height]).padding(10);

  treemap(root);

  svg.data(root.descendants())
      .enter()
      .append('rect')
      .attr(
          'x',
          function(d) {
            return d.x0;
          })
      .attr(
          'y',
          function(d) {
            return d.y0;
          })
      .attr(
          'width',
          function(d) {
            return d.x1 - d.x0;
          })
      .attr('height', function(d) {
        return d.y1 - d.y0;
      });

  // var plotData = []
  // // plotData.push(['citations'].concat(top5CitedPapers.map(p =>
  // p.inCitations.length))) plotData.push(['author'].concat(data.map(p =>
  // p.authors.length)))

  // var chart = c3.generate({
  //   bindto: '#q4b',
  //   data: {
  //     columns: plotData,
  //     type: 'bar',
  //     x: 'author'
  //   },
  //   axis: {
  //     rotated: true,
  //     x: {
  //       type: 'category',
  //       tick: {
  //         multiline: false
  //       }
  //     }
  //   }
  // })
}