const cookieSession = require('cookie-session')

module.exports = app => {
  app.use(cookieSession({
    secret: process.env.SESSION_SECRET,
    maxAge: 14 * 24 * 3600 * 1000
  }))
}
