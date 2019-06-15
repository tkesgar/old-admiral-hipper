const {Router: router} = require('express')
const {default: ow} = require('ow')
const handle = require('../lib/handle')
const Auth = require('../controllers/auth')
const {appCallbackUrl} = require('../config/env')
const {checkRecaptcha} = require('../lib/check-recaptcha')

const route = router()

route.get('/auth', (req, res) => {
  const {user} = req
  if (!user) {
    res.json(null)
    return
  }

  res.json(user)
})

route.post('/auth/login', handle(async (req, res) => {
  const {name, password} = req.body
  ow(name, ow.string)
  ow(password, ow.string)

  const user = await Auth.authByPassword(name, password)
  if (!user) {
    res.sendStatus(401)
    return
  }

  await new Promise((resolve, reject) => {
    req.login(user, err => {
      if (err) {
        reject(err)
        return
      }

      resolve()
    })
  })
}))

route.get('/auth/logout', (req, res) => {
  req.logout()
  res.sendStatus(204)
})

route.post('/auth/forgot', handle(async req => {
  const {name, email} = req.body
  ow(name, ow.string)
  ow(email, ow.string)

  await Auth.sendResetPasswordToken(name, email)
}))

route.post('/auth/reset', handle(async req => {
  const {name, token, password} = req.body
  ow(name, ow.string)
  ow(token, ow.string)
  ow(password, ow.string)

  await Auth.resetPassword(name, token, password)
}))

route.get('/auth/verify-email', handle(async (req, res) => {
  const {name, token} = req.query
  ow(name, ow.string)
  ow(token, ow.string)

  await Auth.verifyEmail(name, token)

  res.redirect(`${appCallbackUrl}?info=verify_email_success`)
}))

route.post('/auth/register',
  checkRecaptcha(),
  handle(async req => {
    const {name, password, email} = req.body
    ow(name, ow.string)
    ow(password, ow.string)
    ow(email, ow.string)

    await Auth.register(name, password, email)
  })
)

module.exports = route
