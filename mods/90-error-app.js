const log = require('../utils/log')
const {AppError} = require('../utils/error')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      if (err.level) {
        log[err.level]({err})
      }

      res.status(err.statusCode).json(err)
      return
    }

    next(err)
  })
}
