const log = require('../services/log')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.name === 'ArgumentError') {
      log.debug({err})
      res.status(422).json({message: err.message})
      return
    }

    next(err)
  })
}
