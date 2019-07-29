const log = require('../utils/log')

module.exports = app => {
  app.use((req, res) => {
    log.debug({req}, 'Route not found')
    res.sendStatus(404)
  })
}
