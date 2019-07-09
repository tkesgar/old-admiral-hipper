const log = require('../services/log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      log.fatal({err, req, res}, 'Server oops (headers already sent)')
      next(err)
      return
    }

    log.error({err, req}, 'Server oops')
    res.status(500).send({
      message: 'Server oops',
      code: 'SERVER_OOPS'
    })
  })
}
