const {default: ow} = require('ow')

const VALUES = ['avatar', 'portrait', 'fullbody']

module.exports = {
  fn(value) {
    ow(value, ow.string.oneOf(VALUES))
  }
}
