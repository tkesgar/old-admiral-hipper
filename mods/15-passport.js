const passport = require('../services/legacy-passport')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
}
