function checkAuth(fn = null) {
  return (req, res, next) => {
    if (!req.user) {
      res.sendStatus(403)
      return
    }

    if (fn && !fn(req.user)) {
      res.sendStatus(403)
      return
    }

    next()
  }
}

module.exports = checkAuth
