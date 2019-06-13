const {Router: router} = require('express')
const {default: ow} = require('ow')
const checkAuth = require('../middlewares/check-auth')
const handle = require('../lib/handle')
const User = require('../controllers/user')

const route = router()

route.use('/me', checkAuth())

route.get('/me', (req, res) => {
  res.json(req.user.getData('personal'))
})

route.delete('/me', handle(async req => {
  const {user, body: {password}} = req
  ow(password, ow.string)

  await User.deleteUser(user, password)

  req.logout()
}))

route.post('/me/verify-email', handle(async req => {
  const {user, body: {email}} = req
  ow(email, ow.string)

  await User.sendVerifyEmail(user, email)
}))

module.exports = route
