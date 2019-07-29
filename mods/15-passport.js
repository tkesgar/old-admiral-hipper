const {passport} = require('../utils/passport')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
}
