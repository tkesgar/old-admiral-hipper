/* eslint-disable camelcase */
const toggle = require('../../config/toggle')

const TYPE_INTEGER = 'i'
const TYPE_STRING = 's'

const VALUE_INFO = {
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

const SET_INFO = {
  birthday: {
    keys: ['birthday_d', 'birthday_m'],
    test: (day, month) => {
      if ([4, 6, 9, 11].includes(month)) {
        return day <= 30
      }

      if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        return day <= 31
      }

      if (month === 2) {
        return day <= 29
      }

      return false
    }
  },
  threesizes: {
    keys: ['threesizes_b', 'threesizes_w', 'threesizes_h']
  },
  fav_color: {
    keys: ['fav_color_r', 'fav_color_g', 'fav_color_b']
  },
  hair_color: {
    keys: ['hair_color_r', 'hair_color_g', 'hair_color_b']
  },
  eye_color: {
    keys: ['eye_color_r', 'eye_color_g', 'eye_color_b']
  }
}

function isValidCharaInfo({key, value}) {
  if (!/^(x_)?[a-z_]+$/.test(key)) {
    return false
  }

  if (key.startsWith('x_')) {
    if (!toggle.customCharaInfo) {
      return false
    }

    return true
  }

  const valueInfo = VALUE_INFO[key]
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

  return true
}

exports.isValidCharaInfo = isValidCharaInfo

function isValidCharaInfoEntries(entries, validateEntry = true) {
  if (validateEntry) {
    for (const {key, value} of entries) {
      if (!isValidCharaInfo(key, value)) {
        return false
      }
    }
  }

  for (const {key} of entries) {
    for (const setInfo of Object.values(SET_INFO)) {
      const {keys} = setInfo
      if (keys.includes(key) && keys.find(searchKey => !entries.find(entry => entry.key === searchKey))) {
        return false
      }

      const {test} = setInfo
      if (test) {
        if (!test(...keys.map(key => entries.find(entry => entry.key === key).value))) {
          return false
        }
      }
    }
  }

  return true
}

exports.isValidCharaInfoEntries = isValidCharaInfoEntries
