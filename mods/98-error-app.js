const log = require('../services/log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.name === 'AppError') {
      log.debug({err})
      res.status(400).json(err)
      return
    }

    next(err)
  })
}
