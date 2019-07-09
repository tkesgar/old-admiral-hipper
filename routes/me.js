const {Router: router} = require('express')
const CharaController = require('../controllers/chara')
const UserController = require('../controllers/user')
const checkAuth = require('../middlewares/check-auth')
const handle = require('../middlewares/handle')

const route = router()

route.use('/me', checkAuth())

route.get('/me', (req, res) => {
  const {user} = req

  res.json(UserController.getUserData(user))
})

route.delete('/me', handle(async req => {
  const {user} = req

  await UserController.delete(user)
  req.logout()
}))

route.put('/me/email', handle(async req => {
  const {user, body: {email}} = req

  await UserController.setEmail(user, email)
}))

route.put('/me/display-name', handle(async req => {
  const {user, body: {displayName}} = req

  await UserController.setDisplayName(user, displayName)
}))

route.delete('/me/display-name', handle(async req => {
  const {user} = req

  await UserController.deleteDisplayName(user)
}))

route.put('/me/password', handle(async req => {
  const {user, body: {password, newPassword}} = req

  await UserController.setPassword(user, password, newPassword)
}))

route.post('/me/verify-email', handle(async req => {
  const {user} = req

  await UserController.sendVerifyEmailToken(user)
}))

route.get('/me/chara', handle(async req => {
  const {user} = req

  return CharaController.findAllByUser(user)
}))

module.exports = route
