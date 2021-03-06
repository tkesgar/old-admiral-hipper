const log = require('../utils/log')
const {RecaptchaError} = require('../utils/middlewares/recaptcha')

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err instanceof RecaptchaError) {
      log.debug({err})
      res.sendStatus(403)
      return
    }

    next(err)
  })
}
