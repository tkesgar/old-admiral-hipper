/* eslint-disable camelcase */

const CUSTOM_KEY_PREFIX = 'x_'
exports.CUSTOM_KEY_PREFIX = CUSTOM_KEY_PREFIX

const TYPE_INTEGER = 'i'
const TYPE_STRING = 's'

const KEY_VALUE_INFO = {
  full_name: {
    type: TYPE_STRING
  },
  nick_name: {
    type: TYPE_STRING
  },
  jp_name: {
    type: TYPE_STRING
  },
  age: {},
  height: {},
  weight: {},
  birthday_d: {
    min: 1,
    max: 31
  },
  birthday_m: {
    min: 1,
    max: 12
  },
  blood_type: {
    choice: ['A', 'B', 'AB', 'O']
  },
  threesizes_b: {
    min: 0
  },
  threesizes_w: {
    min: 0
  },
  threesizes_h: {
    min: 0
  },
  handedness: {
    choice: ['right', 'left', 'mixed', 'ambidexterity']
  },
  hobby: {
    type: TYPE_STRING
  },
  skill: {
    type: TYPE_STRING
  },
  fav_food: {
    type: TYPE_STRING
  },
  fav_drink: {
    type: TYPE_STRING
  },
  fav_color_r: {
    min: 0,
    max: 255
  },
  fav_color_g: {
    min: 0,
    max: 255
  },
  fav_color_b: {
    min: 0,
    max: 255
  },
  hair_color_r: {
    min: 0,
    max: 255
  },
  hair_color_g: {
    min: 0,
    max: 255
  },
  hair_color_b: {
    min: 0,
    max: 255
  },
  eye_color_r: {
    min: 0,
    max: 255
  },
  eye_color_g: {
    min: 0,
    max: 255
  },
  eye_color_b: {
    min: 0,
    max: 255
  },
  horoscope: {
    type: TYPE_STRING
  },
  hometown: {
    type: TYPE_STRING
  },
  gender: {
    type: TYPE_STRING
  },
  hair_length: {
    choice: ['nohair', 'ear', 'neck', 'shoulder', 'chest', 'waist', 'leg', 'floor']
  },
  race: {
    type: TYPE_STRING
  }
}

function isValidCharaInfo(key, value) {
  if (!/^(x_)?[a-z_]+$/.test(key)) {
    return false
  }

  if (key.startsWith(CUSTOM_KEY_PREFIX)) {
    return true
  }

  const valueInfo = KEY_VALUE_INFO[key]
  if (!valueInfo) {
    return false
  }

  const isValueInteger = Number.isInteger(value)
  const isValueString = typeof value === 'string'

  const {type} = valueInfo
  if (type) {
    if (type === TYPE_INTEGER && !isValueInteger) {
      return false
    }

    if (type === TYPE_STRING && !isValueString) {
      return false
    }
  }

  const {min} = valueInfo
  if (min) {
    if (!isValueInteger) {
      return false
    }

    if (value < min) {
      return false
    }
  }

  const {max} = valueInfo
  if (max) {
    if (!isValueInteger) {
      return false
    }

    if (value > max) {
      return false
    }
  }

  const {choice} = valueInfo
  if (choice) {
    if (!choice.includes(value)) {
      return false
    }
  }
}

exports.isValidCharaInfo = isValidCharaInfo
