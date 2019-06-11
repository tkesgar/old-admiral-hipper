const requireAll = require('../lib/require-all')

module.exports = app => {
  requireAll('./routes', {name: null}).forEach(route => app.use(route))
}
