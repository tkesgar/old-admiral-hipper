function handleByValue(value) {
  return (req, res) => {
    if (typeof value === 'undefined') {
      res.sendStatus(204)
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

    if (res.headersSent) {
      return
    }

    if (middleware) {
      next()
      return
    }

    handleByValue(result)(req, res)
  })().catch(next)
}

module.exports = handle
