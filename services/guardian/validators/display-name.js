const {default: ow} = require('ow')

module.exports = value => {
  ow(value, ow.any(ow.null, ow.string.nonEmpty.maxLength(32)))
}
