const log = require('../services/legacy-log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      log.debug({err}, 'Invalid/missing CSRF token')
      res.sendStatus(err.statusCode)
      return
    }

    next(err)
  })
}
