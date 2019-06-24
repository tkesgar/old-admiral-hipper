const {default: ow} = require('ow')

module.exports = {
  fn(value) {
    ow(value, ow.string.nonEmpty.maxLength(32))
  }
}
