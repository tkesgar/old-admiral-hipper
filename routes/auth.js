const {Router: router} = require('express')
const {default: ow} = require('ow')
const handle = require('../lib/handle')
const auth = require('../controllers/auth')

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

      res.sendStatus(200)
      resolve()
    })
  })
}))

route.delete('/auth', (req, res) => {
  req.logout()
  res.sendStatus(204)
})

module.exports = route
