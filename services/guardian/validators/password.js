const {default: ow} = require('ow')
const {ValidationError} = require('../utils')

module.exports = value => {
  try {
    ow(value, ow.string.minLength(8))
  } catch {
    throw new ValidationError('Invalid password')
  }
}
