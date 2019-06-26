function handleByValue(value) {
  return (req, res) => {
    if (req.method === 'POST') {
      if (typeof value !== 'string') {
        throw new TypeError('POST must return a location URL string')
      }

      res.status(201)
        .location(value)
        .type('application/octet-stream').send(value)
      return
    }

    if (typeof value === 'undefined') {
      if (![204, 205].includes(res.statusCode)) {
        res.status(204)
      }

      res.end()
      return
    }

    if (typeof value === 'number') {
      res.sendStatus(value)
      return
    }

    res.json(value)
  }
}

function handle(handler, middleware = false) {
  if (typeof handler !== 'function') {
    return handleByValue(handler)
  }

  return (req, res, next) => (async () => {
    const result = await handler(req, res)

    if (middleware) {
      next()
      return
    }

    if (res.headersSent) {
      return
    }

    handleByValue(result)(req, res)
  })().catch(next)
}

module.exports = handle
