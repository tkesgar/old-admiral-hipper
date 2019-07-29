const {default: ow} = require('ow')
const {ValidationError} = require('../utils')

module.exports = (value, allowNull = false) => {
  if (allowNull && value === null) {
    return
  }

  try {
    ow(value, ow.string.nonEmpty.maxLength(32))
  } catch {
    throw new ValidationError('Invalid display name')
  }
}
