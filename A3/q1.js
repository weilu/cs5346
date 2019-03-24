export default function(data) {
  const authors = data.reduce((acc, d) => acc.concat(d.authors), [])
  const authorsById = {}
  authors.forEach((d) => d.ids.forEach(function(id) {
    if (authorsById[id] == null) {
      authorsById[id] = {id: id, name: d.name, count: 1}
    } else {
      authorsById[id].count += 1
    }
  }))

  const sortedAuthors = Object.values(authorsById).sort((a, b) => b.count - a.count)
  const top10Authors = sortedAuthors.slice(0, 10)
  console.log(top10Authors)
}
