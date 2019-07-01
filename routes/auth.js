const {Router: router} = require('express')
const UserController = require('../controllers/user')
const handle = require('../middlewares/handle')
const passport = require('../services/passport')
const toggle = require('../config/toggle')
const toggleRoute = require('../middlewares/toggle-route')
const {appCallbackURL} = require('../config/env')
const {checkRecaptcha} = require('../lib/check-recaptcha')

const authGoogle = () => passport.authenticate('google')

const route = router()

route.get('/auth', handle(req => {
  const {user} = req

  return user ? UserController.getAuthData(user) : null
}))

route.post('/auth/login', handle(async (req, res) => {
  const {body: {email, password}} = req

  const user = await UserController.authenticate(email, password)
  if (!user) {
    res.sendStatus(401)
    return
  }

  await new Promise((resolve, reject) => {
    req.login(user, err => err ? reject(err) : resolve())
  })

  return '/auth'
}))

route.get('/auth/logout', handle(req => req.logout()))

route.post('/auth/recover',
  checkRecaptcha(),
  handle(async req => {
    const {body: {email}} = req

    await UserController.sendResetPasswordToken(email)
  })
)

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

route.get('/auth/google', authGoogle())

route.get('/auth/google/_callback',
  authGoogle(),
  (req, res) => res.redirect(`${appCallbackURL}?info=auth`)
)

module.exports = route
