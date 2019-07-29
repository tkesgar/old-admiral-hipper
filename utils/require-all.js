const fs = require('fs')
const path = require('path')

function requireAll(dir, opts = {}) {
  const {
    filter: filterFn = file => !file.startsWith('_'),
    name: nameFn = file => file.replace(/\.js$/, '')
  } = opts

  const dirPath = path.resolve(dir)

  if (!fs.existsSync(dirPath)) {
    return []
  }

  return fs.readdirSync(dirPath)
    .filter(direntry => !fs.statSync(path.join(dirPath, direntry)).isDirectory())
    .sort()
    .filter(filterFn)
    .map(file => {
      const value = require(path.resolve(dir, file))
      return nameFn ? [nameFn(file), value] : value
    })
}

module.exports = requireAll
