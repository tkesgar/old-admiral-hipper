/* eslint-disable camelcase */
const {default: ow} = require('ow')
const toggle = require('../../config/toggle')

const VALIDATORS = {
  full_name: ow.string.maxLength(40),
  nick_name: ow.string.maxLength(20),
  jp_name: ow.string.maxLength(20),
  birthday_d: ow.number.inRange(1, 31).integer,
  birthday_m: ow.number.inRange(1, 12).integer,
  blood_type: ow.string.oneOf(['A', 'B', 'AB', 'O']),
  age: ow.number.integer.positive,
  height: ow.number.integer.positive,
  weight: ow.number.integer.positive,
  threesizes_b: ow.number.integer.positive,
  threesizes_w: ow.number.integer.positive,
  threesizes_h: ow.number.integer.positive,
  handedness: ow.string.oneOf(['right', 'left', 'mixed', 'ambidexterity']),
  hobby: ow.string,
  skill: ow.string,
  fav_food: ow.string,
  fav_drink: ow.string,
  fav_color_r: ow.number.inRange(0, 255).integer,
  fav_color_g: ow.number.inRange(0, 255).integer,
  fav_color_b: ow.number.inRange(0, 255).integer,
  hair_color_r: ow.number.inRange(0, 255).integer,
  hair_color_g: ow.number.inRange(0, 255).integer,
  hair_color_b: ow.number.inRange(0, 255).integer,
  eye_color_r: ow.number.inRange(0, 255).integer,
  eye_color_g: ow.number.inRange(0, 255).integer,
  eye_color_b: ow.number.inRange(0, 255).integer,
  horoscope: ow.string,
  hometown: ow.string,
  gender: ow.string,
  race: ow.string,
  hair_length: ow.string.oneOf(['nohair', 'ear', 'neck', 'shoulder', 'chest', 'waist', 'leg', 'floor'])
}

const STRINGABLE_KEYS = [
  'age',
  'height',
  'weight'
]

const allowedKeys = [...Object.keys(VALIDATORS), ...STRINGABLE_KEYS]

module.exports = {
  fn({key, value}) {
    ow(key, ow.any([
      ow.string.oneOf(allowedKeys),
      ow.string.startsWith('x_')
    ]))

    if (key.startsWith('x_')) {
      if (toggle.customCharaInfo) {
        return
      }

      throw new Error('Custom key is not allowed')
    }

    if (STRINGABLE_KEYS.includes(key)) {
      ow(value, ow.any([ow.string, VALIDATORS[key]]))
      return
    }

    ow(value, VALIDATORS[key])
  }
}
