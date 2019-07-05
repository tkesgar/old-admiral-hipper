/* eslint-disable quote-props */
const {default: ow} = require('ow')

const CUSTOM_KEY_PREFIX = 'x:'
exports.CUSTOM_KEY_PREFIX = CUSTOM_KEY_PREFIX

const VALIDATORS = {
  'full_name': ow.string.maxLength(40),
  'nick_name': ow.string.maxLength(20),
  'jp_name': ow.string.maxLength(20),
  'birthday.d': ow.number.inRange(1, 31).integer,
  'birthday.m': ow.number.inRange(1, 12).integer,
  'blood_type': ow.string.oneOf(['A', 'B', 'AB', 'O']),
  'age': ow.number.integer.positive,
  'height': ow.number.integer.positive,
  'weight': ow.number.integer.positive,
  'threesizes.b': ow.number.integer.positive,
  'threesizes.w': ow.number.integer.positive,
  'threesizes.h': ow.number.integer.positive,
  'handedness': ow.string.oneOf(['right', 'left', 'mixed', 'ambidexterity']),
  'hobby': ow.string,
  'skill': ow.string,
  'fav_food': ow.string,
  'fav_drink': ow.string,
  'fav_color.r': ow.number.inRange(0, 255).integer,
  'fav_color.g': ow.number.inRange(0, 255).integer,
  'fav_color.b': ow.number.inRange(0, 255).integer,
  'hair_color.r': ow.number.inRange(0, 255).integer,
  'hair_color.g': ow.number.inRange(0, 255).integer,
  'hair_color.b': ow.number.inRange(0, 255).integer,
  'eye_color.r': ow.number.inRange(0, 255).integer,
  'eye_color.g': ow.number.inRange(0, 255).integer,
  'eye_color.b': ow.number.inRange(0, 255).integer,
  'horoscope': ow.string,
  'hometown': ow.string,
  'gender': ow.string,
  'species': ow.string,
  'hair_length': ow.string.oneOf(['nohair', 'ear', 'neck', 'shoulder', 'chest', 'waist', 'leg', 'floor'])
}

exports.VALIDATORS = VALIDATORS

const STRINGABLE_KEYS = [
  'age',
  'height',
  'weight'
]

exports.STRINGABLE_KEYS = STRINGABLE_KEYS

const ALLOWED_KEYS = [
  ...Object.keys(VALIDATORS),
  STRINGABLE_KEYS
]

exports.ALLOWED_KEYS = ALLOWED_KEYS

const GROUPS = {
  'birthday': {
    keys: ['birthday.d', 'birthday.m'],
    validate(day, month) {
      ow(month, ow.number.inRange(1, 12).integer)
      ow(day, ow.number.positive.is(day => {
        switch (month) {
          case 1:
          case 3:
          case 5:
          case 7:
          case 8:
          case 10:
          case 12:
            return day <= 31
          case 4:
          case 6:
          case 9:
          case 11:
            return day <= 30
          case 2:
            return day <= 29
          default:
            return false
        }
      }))
    }
  },
  'threesizes': {
    keys: ['threesizes.b', 'threesizes.w', 'threesizes.h']
  },
  'fav_color': {
    keys: ['fav_color.r', 'fav_color.g', 'fav_color.b']
  },
  'hair_color': {
    keys: ['hair_color.r', 'hair_color.g', 'hair_color.b']
  },
  'eye_color': {
    keys: ['eye_color.r', 'eye_color.g', 'eye_color.b']
  }
}

exports.GROUPS = GROUPS

exports.getInfoGroupFromKey = key => {
  for (const [infoGroup, group] of Object.entries(GROUPS)) {
    if (group.keys.includes(key)) {
      return infoGroup
    }
  }

  return null
}

exports.getInfoGroupKeys = key => {
  const group = Object.values(GROUPS).find(group => group.keys.includes(key))
  return group ? group.keys : null
}
