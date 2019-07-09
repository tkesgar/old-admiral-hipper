const passport = require('../services/passport')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
}
