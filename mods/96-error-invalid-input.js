const log = require('../utils/log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.name === 'ArgumentError') {
      log.debug({err})
      res.sendStatus(422)
      return
    }

    next(err)
  })
}
