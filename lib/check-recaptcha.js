const got = require('got')

class RecaptchaError extends Error {
  constructor(result) {
    super('reCAPTCHA verification failed')
    this.result = result
  }
}

exports.RecaptchaError = RecaptchaError

function checkRecaptcha(opts = {}) {
  const {
    secret = process.env.RECAPTCHA_SECRET_KEY,
    token: tokenFn = req => req.body.recaptchaToken,
    url = 'https://www.google.com/recaptcha/api/siteverify'
  } = opts

  return (req, res, next) => {
    (async () => {
      const token = tokenFn(req)

      const response = await got.post(url, {
        form: true,
        body: {
          secret,
          response: token
        }
      })

      const result = JSON.parse(response.body)
      if (result.success) {
        next()
        return
      }

      next(new RecaptchaError(result))
    })().catch(next)
  }
}

exports.checkRecaptcha = checkRecaptcha
