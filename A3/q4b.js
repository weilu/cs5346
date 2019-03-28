// Referenced https://d3indepth.com/layouts/
import util from './utils.js'
var margin = {top: 20, right: 0, bottom: 100, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

export default function(data) {
  const svg =
      d3.select('#q4b')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr(
              'transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const authors = {};

  data.forEach(function(paper) {
    paper.authors.forEach((d) => d.ids.forEach(function(id) {
      if (authors[id] == null) {
        authors[id] = { name: d.name, papers: 1 }
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

  var root = d3.hierarchy(authorsCount);
  root.sum(function(d) {
        return d.papers;
      })
      .sort(function(a, b) {
        return a > b;
      });

  var treemap = d3.treemap().size([width, height]).padding(1);

  treemap(root);

  svg.selectAll('g')
      .data(root.descendants())
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
}