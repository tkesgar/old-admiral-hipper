const {FailError} = require('../../utils/error')

class ValidationError extends FailError {
  constructor(message = 'Invalid value from request') {
    super('INVALID_VALUE', {message})
  }
}

exports.ValidationError = ValidationError
