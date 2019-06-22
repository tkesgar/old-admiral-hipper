const {Router: router} = require('express')
const {default: ow} = require('ow')
const checkAuth = require('../middlewares/check-auth')
const handle = require('../lib/handle')
const User = require('../controllers/user')
const Chara = require('../controllers/chara')

const route = router()

route.use('/me', checkAuth())

route.get('/me', (req, res) => {
  const {user} = req

  res.json(user.getData({authData: true}))
})

route.delete('/me', handle(async req => {
  const {user} = req

  await User.delete(user)

  req.logout()
}))

route.put('/me/name', handle(async req => {
  const {user, body: {name}} = req
  ow(name, ow.string)

  await User.setName(user, name)
}))

route.put('/me/display-name', handle(async req => {
  const {user, body: {displayName}} = req
  ow(displayName, ow.string)

  await User.setDisplayName(user, displayName)
}))

route.delete('/me/display-name', handle(async req => {
  const {user} = req

  await User.setDisplayName(user, null)
}))

route.put('/me/password', handle(async req => {
  const {user, body: {password}} = req
  ow(password, ow.string)

  await User.setPassword(user, password)
}))

route.put('/me/email', handle(async req => {
  const {user, body: {email}} = req
  ow(email, ow.string)

  await User.setEmail(user, email)
}))

route.get('/me/chara', handle(async req => {
  const {user} = req

  return Chara.findAllByUser(user)
}))

module.exports = route
