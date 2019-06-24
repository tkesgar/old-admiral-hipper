function handle(asyncFn, middleware = false) {
  return (req, res, next) => (async () => {
    const result = await asyncFn(req, res)

    if (middleware) {
      next()
      return
    }

    if (res.headersSent) {
      return
    }

    if (req.method === 'POST') {
      res.header('Location', result)
      res.status(201).send(result)
      return
    }

    if (typeof result === 'undefined') {
      if (![204, 205].includes(res.statusCode)) {
        res.status(204)
      }

      res.end()
      return
    }

    res.json(result)
  })().catch(next)
}

module.exports = handle
