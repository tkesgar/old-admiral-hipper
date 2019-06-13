const {Router: router} = require('express')
const {default: ow} = require('ow')
const handle = require('../lib/handle')
const auth = require('../controllers/auth')
const {appCallbackUrl} = require('../config/env')

const route = router()

route.get('/auth', (req, res) => {
  const {user} = req
  if (!user) {
    res.json(null)
    return
  }

  const userData = user.getData('personal')
  res.json(userData)
})

route.post('/auth', handle(async (req, res) => {
  const {name, password} = req.body
  ow(name, ow.string)
  ow(password, ow.string)

  const user = await auth.authByPassword(name, password)
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

  await auth.sendForgotPasswordEmail(name, email)
}))

route.post('/auth/reset', handle(async req => {
  const {name, token, password} = req.body
  ow(name, ow.string)
  ow(token, ow.string)
  ow(password, ow.string)

  await auth.resetPassword(name, token, password)
}))

route.get('/auth/verify-email', handle(async (req, res) => {
  const {name, token} = req.query
  ow(name, ow.string)
  ow(token, ow.string)

  await auth.verifyEmail(name, token)

  res.redirect(`${appCallbackUrl}?info=verify_email_success`)
}))

module.exports = route
