const log = require('../services/log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.name === 'AppError') {
      const statusCode = err.origin === 'user' ? 400 : 500

      log.debug({err})
      res.status(statusCode).json({
        message: err.message,
        code: err.code,
        data: err.data
      })
      return
    }

    next(err)
  })
}
