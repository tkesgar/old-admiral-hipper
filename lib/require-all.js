const fs = require('fs')
const path = require('path')

function requireAll(dir, opts = {}) {
  const {
    filter: filterFn = file => !file.startsWith('_'),
    name: nameFn = file => file.replace(/\.js$/, ''),
    require: requireFn = (dir, file) => require(path.resolve(dir, file))
  } = opts

  return fs.readdirSync(path.resolve(dir))
    .sort()
    .filter(filterFn)
    .map(file => {
      const value = requireFn(dir, file)
      return nameFn ? [nameFn(file), value] : value
    })
}

module.exports = requireAll
