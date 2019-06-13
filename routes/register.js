const {Router: router} = require('express')
const {default: ow} = require('ow')
const handle = require('../lib/handle')
const register = require('../controllers/register')

const route = router()

route.post('/register', handle(async (req, res) => {
  const {name, password, email} = req.body
  ow(name, ow.string)
  ow(password, ow.string)
  ow(email, ow.string)

  const user = await register.register(name, password, email)

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

module.exports = route
