const {default: ow} = require('ow')
const {IMAGE_TYPES} = require('../image')

module.exports = {
  fn(value) {
    ow(value, ow.string.oneOf(IMAGE_TYPES))
  }
}
