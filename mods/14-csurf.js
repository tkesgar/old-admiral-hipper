const csurf = require('csurf')

module.exports = app => {
  app.use(csurf())

  app.use((req, res, next) => {
    const cookieOpts = {
      sameSite: 'lax',
      httpOnly: false
    }

    const {CSRF_COOKIE_DOMAIN: domain} = process.env
    if (domain) {
      cookieOpts.domain = domain
    }

    res.cookie('csrf-token', req.csrfToken(), cookieOpts)

    next()
  })
}
