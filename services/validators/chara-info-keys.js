const {default: ow} = require('ow')
const {GROUPS, ALLOWED_KEYS} = require('../../utils/chara-info')

module.exports = {
  fn(value) {
    ow(value, ow.array.ofType(ow.string.oneOf(ALLOWED_KEYS)))

    GROUPS
      .filter(test => test.keys.find(key => value.includes(key)))
      .forEach(({keys}) => ow(value, ow.array.includes(...keys)))
  }
}
