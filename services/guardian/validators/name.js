const {default: ow} = require('ow')
const {ValidationError} = require('../utils')

module.exports = value => {
  try {
    ow(value, ow.string.matches(/^\w{1,16}$/).not.matches(/admin/))
  } catch {
    throw new ValidationError('Invalid display name')
  }
}
