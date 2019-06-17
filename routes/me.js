const {Router: router} = require('express')
const checkAuth = require('../middlewares/check-auth')
const handle = require('../lib/handle')
const User = require('../controllers/user')

const route = router()

route.use('/me', checkAuth())

route.get('/me', (req, res) => {
  const {user} = req

  res.json(user.getData('personal'))
})

route.delete('/me', handle(async req => {
  const {user} = req

  await User.delete(user)

  req.logout()
}))

route.put('/me/name', handle(async req => {
  const {user, body: {name}} = req

  await User.setName(user, name)
}))

route.put('/me/display-name', handle(async req => {
  const {user, body: {displayName}} = req

  await User.setDisplayName(user, displayName)
}))

route.delete('/me/display-name', handle(async req => {
  const {user} = req

  await User.setDisplayName(user, null)
}))

route.put('/me/password', handle(async req => {
  const {user, body: {password}} = req

  await User.setPassword(user, password)
}))

route.put('/me/email', handle(async req => {
  const {user, body: {email}} = req

  await User.setEmail(user, email)
}))

module.exports = route
