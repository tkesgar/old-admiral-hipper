const {default: ow} = require('ow')
const {GROUPS, ALLOWED_KEYS} = require('../../utils/legacy-chara-info')

module.exports = {
  fn(value) {
    ow(value, ow.array.ofType(ow.string.oneOf(ALLOWED_KEYS)))

    Object.values(GROUPS)
      .filter(test => test.keys.find(key => value.includes(key)))
      .forEach(({keys}) => ow(value, ow.array.includes(...keys)))
  }
}
