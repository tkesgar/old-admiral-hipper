const {AppError} = require('../utils/error')

exports.validateUserName = name => {
  if (/admin/.test(name)) {
    throw new AppError('User name containing \'admin\' is not allowed', 'USERNAME_NOT_ALLOWED', {name})
  }
}
