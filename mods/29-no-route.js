const log = require('../services/legacy-log')

module.exports = app => {
  app.use((req, res) => {
    log.debug({req}, 'Route not found')
    res.sendStatus(404)
  })
}
