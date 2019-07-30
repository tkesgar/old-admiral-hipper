const {default: ow} = require('ow')

module.exports = {
  fn(value) {
    ow(value, ow.string.matches(/^\w{1,16}$/).not.matches(/admin/))
  }
}
