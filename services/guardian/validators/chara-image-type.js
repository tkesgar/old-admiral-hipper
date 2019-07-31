const {default: ow} = require('ow')
const {IMAGE_TYPES} = require('../../legacy-image')

module.exports = value => {
  ow(value, ow.string.oneOf(IMAGE_TYPES))
}
