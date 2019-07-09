const csurf = require('csurf')

module.exports = app => {
  app.use(csurf())

  app.use((req, res, next) => {
    res.cookie('csrf-token', req.csrfToken())
    next()
  })
}
