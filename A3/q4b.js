// Referenced https://d3indepth.com/layouts/
var margin = {top: 20, right: 0, bottom: 100, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

function render(dataNodes) {
  const svg =
      d3.select('#q4b')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr(
              'transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
      .data(dataNodes)
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

export default function(data) {
  const authors = {};

  data.forEach(function(paper) {
    paper.authors.forEach((d) => d.ids.forEach(function(id) {
      if (authors[id] == null) {
        authors[id] = { name: d.name, papers: 1 }
      } else {
        authors[id].papers += 1;
      }
    }))
  });

  const sortedAuthors =
      Object.values(authors).sort((a, b) => b.papers - a.papers)

  var authorNodes = {'name': 'authors', 'children': []};
  Object.values(sortedAuthors).forEach((d) => authorNodes.children.push(d))

  var root = d3.hierarchy(authorNodes);

  var treemap = d3.treemap().size([width, height]).padding(1);

  root.sum(function(d) {
    return d.papers;
  });

  treemap(root);

  render(root.descendants());
}