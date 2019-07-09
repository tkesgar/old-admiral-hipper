function toggleRoute(flag = true, opts = {}) {
  const {
    statusCode = 500,
    message = 'Route is currently disabled',
    code = 'ROUTE_DISABLED'
  } = opts

  if (flag) {
    return (req, res, next) => next()
  }

  return (req, res) => res.status(statusCode).json({message, code})
}

module.exports = toggleRoute
