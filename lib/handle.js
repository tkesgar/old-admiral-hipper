function handle(asyncFn, middleware = false) {
  return (req, res, next) => (async () => {
    const result = await asyncFn(req, res)

    if (res.headersSent) {
      return
    }

    if (middleware) {
      next()
      return
    }

    if (typeof result === 'undefined') {
      res.sendStatus(204)
      return
    }

    res.json(result)
  })().catch(next)
}

module.exports = handle
