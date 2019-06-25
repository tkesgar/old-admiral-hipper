function checkAuth(fn = null) {
  return (req, res, next) => {
    if (!req.user) {
      res.sendStatus(403)
      return
    }

    if (fn) {
      if (!fn(req.user, req)) {
        res.sendStatus(403)
        return
      }
    }

    next()
  }
}

module.exports = checkAuth
