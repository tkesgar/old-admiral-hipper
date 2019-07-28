const {default: ow} = require('ow')
const toggle = require('../../config/toggle')
const {
  CUSTOM_KEY_PREFIX,
  VALIDATORS,
  STRINGABLE_KEYS,
  ALLOWED_KEYS
} = require('../../utils/legacy-chara-info')

module.exports = {
  fn({key, value}) {
    ow(key, ow.any(
      ow.string.oneOf(ALLOWED_KEYS),
      ow.string.startsWith(CUSTOM_KEY_PREFIX)
    ))

    if (key.startsWith(CUSTOM_KEY_PREFIX)) {
      if (toggle.customCharaInfo) {
        return
      }

      throw new Error('Custom key is not allowed')
    }

    if (STRINGABLE_KEYS.includes(key)) {
      ow(value, ow.any(ow.string, VALIDATORS[key]))
      return
    }

    ow(value, VALIDATORS[key])
  }
}
