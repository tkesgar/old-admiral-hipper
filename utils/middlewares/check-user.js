const {FailError} = require('../error')

module.exports = (userFn = null) => (req, res, next) => {
  const {user} = req
  if (!user) {
    next(new FailError('AUTH_REQUIRED', {
      message: 'User authentication required',
      statusCode: 401
    }))
    return
  }

  if (userFn && !userFn(user)) {
    next(new FailError('UNAUTHORIZED', {
      message: 'Unauthorized',
      statusCode: 403
    }))
    return
  }

  next()
}
