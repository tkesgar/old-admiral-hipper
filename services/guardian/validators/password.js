const {default: ow} = require('ow')

module.exports = value => {
  ow(value, ow.string.minLength(8))
}
