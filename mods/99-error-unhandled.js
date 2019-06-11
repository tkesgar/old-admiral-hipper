const log = require('../utils/log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      log.fatal({err, req, res}, 'Unhandled server error (headers already sent)')
      next(err)
      return
    }

    log.error({err, req}, 'Unhandled server error')
    res.sendStatus(500)
  })
}
