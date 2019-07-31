const {default: ow} = require('ow')
const ToggleService = require('../../toggle')

const {
  CUSTOM_KEY_PREFIX,
  VALIDATORS,
  STRINGABLE_KEYS,
  ALLOWED_KEYS
} = require('../../../utils/legacy-chara-info')

module.exports = ({key, value}) => {
  ow(key, ow.any(
    ow.string.oneOf(ALLOWED_KEYS),
    ow.string.startsWith(CUSTOM_KEY_PREFIX)
  ))

  if (key.startsWith(CUSTOM_KEY_PREFIX)) {
    ToggleService.checkToggle('customCharaInfo')
  }

  if (STRINGABLE_KEYS.includes(key)) {
    ow(value, ow.any(ow.string, VALIDATORS[key]))
    return
  }

  ow(value, VALIDATORS[key])
}
