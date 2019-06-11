const {Router: router} = require('express')
const passport = require('../utils/passport')

const route = router()

route.get('/auth', (req, res) => {
  res.json(req.user ? req.user.getData('personal') : null)
})

route.post('/auth', (req, res, next) => passport.authenticate('local', (err, user) => {
  if (err) {
    next(err)
    return
  }

  if (!user) {
    res.sendStatus(401)
    return
  }

  req.login(user, err => {
    if (err) {
      next(err)
      return
    }

    res.sendStatus(204)
  })
})(req, res, next))

route.delete('/auth', (req, res) => {
  req.logout()
  res.sendStatus(204)
})

module.exports = route
