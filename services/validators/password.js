const {default: ow} = require('ow')

// TODO Implementasi password validator yang lebih strict (zxcvbn)
module.exports = {
  fn(value) {
    ow(value, ow.string.minLength(8))
  }
}
