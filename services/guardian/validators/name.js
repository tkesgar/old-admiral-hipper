const {default: ow} = require('ow')

module.exports = value => {
  ow(value, ow.string.matches(/^\w{1,16}$/).not.matches(/admin/))
}
