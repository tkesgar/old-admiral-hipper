function handleByValue(value) {
  return (req, res) => {
    switch (typeof value) {
      case 'undefined':
        res.sendStatus(204)
        break
      case 'number':
        res.sendStatus(value)
        break
      case 'symbol':
        res.json(null)
        break
      default:
        res.json(value)
        break
    }
  }
}

function handle(handler, middleware = false) {
  if (typeof handler !== 'function') {
    return handleByValue(handler)
  }

  return (req, res, next) => (async () => {
    let result
    try {
      result = await handler(req, res)
    } catch (error) {
      next(error)
      return
    }

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
