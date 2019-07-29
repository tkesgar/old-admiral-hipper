const {Router: router} = require('express')
const UserController = require('../controllers/user')
const handle = require('../utils/middlewares/handle')
const passport = require('../services/legacy-passport')
const toggleRoute = require('../utils/middlewares/toggle')
const {getAppCallbackURL} = require('../utils/env')
const recaptcha = require('../utils/middlewares/recaptcha')

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
  recaptcha(),
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
    res.redirect(`${getAppCallbackURL()}?info=verify_email_success`)
  }
}))

route.post('/auth/register',
  toggleRoute('register'),
  recaptcha(),
  handle(async req => {
    const {body: {email, password}} = req

    await UserController.register(email, password)
  })
)

route.get('/auth/google', authGoogle())

route.get('/auth/google/_callback',
  authGoogle(),
  (req, res) => res.redirect(`${getAppCallbackURL()}?action=auth`)
)

module.exports = route
