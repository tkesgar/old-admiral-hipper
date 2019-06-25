const {Router: router} = require('express')
const handle = require('../lib/handle')
const {appCallbackURL} = require('../config/env')
const toggle = require('../config/toggle')
const passport = require('../services/passport')
const {checkRecaptcha} = require('../lib/check-recaptcha')
const toggleRoute = require('../middlewares/toggle-route')
const UserController = require('../controllers/user')

const route = router()

route.get('/auth', (req, res) => {
  const {user} = req

  res.json(user ? UserController.getAuthData(user) : null)
})

route.post('/auth/login', handle(async (req, res) => {
  const {body: {name, password}} = req

  const user = await UserController.authenticate(name, password)
  if (!user) {
    res.sendStatus(401)
    return
  }

  await new Promise((resolve, reject) => {
    req.login(user, err => err ? reject(err) : resolve())
  })
}))

route.get('/auth/logout', (req, res) => {
  req.logout()
  res.sendStatus(204)
})

route.post('/auth/recover', handle(async req => {
  const {body: {email}} = req

  await UserController.sendResetPasswordToken(email)
}))

route.post('/auth/reset-password', handle(async req => {
  const {body: {token, password}} = req

  await UserController.resetPassword(token, password)
}))

route.get('/auth/verify-email', handle(async (req, res) => {
  const {query: {token, app}} = req

  await UserController.verifyEmail(token)

  if (typeof app !== 'undefined') {
    res.redirect(`${appCallbackURL}?info=verify_email_success`)
  }
}))

route.post('/auth/register',
  toggleRoute(toggle.register),
  checkRecaptcha(),
  handle(async req => {
    const {body: {email, password}} = req

    await UserController.register(email, password)
  })
)

route.get('/auth/google', passport.authenticate('google'))

route.get('/auth/google/_callback',
  (req, res, next) => {
    const {query: {app}} = req

    if (typeof app !== 'undefined') {
      res.session.appCallback = true
    }

    next()
  },
  passport.authenticate('google'),
  (req, res) => {
    const {session: {appCallback}} = req

    if (appCallback) {
      res.redirect(`${appCallbackURL}?info=auth`)
      delete res.session.appCallback
    }
  }
)

module.exports = route
