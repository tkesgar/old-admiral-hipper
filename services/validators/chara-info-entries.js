const {default: ow} = require('ow')

const TESTS = [
  {
    keys: ['birthday_d', 'birthday_m'],
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
  {
    keys: ['threesizes_b', 'threesizes_w', 'threesizes_h']
  },
  {
    keys: ['fav_color_r', 'fav_color_g', 'fav_color_b']
  },
  {
    keys: ['hair_color_r', 'hair_color_g', 'hair_color_b']
  },
  {
    keys: ['eye_color_r', 'eye_color_g', 'eye_color_b']
  }
]

module.exports = {
  fn(value) {
    ow(value, ow.object.valuesOfType(ow.any([ow.string, ow.number.integer])))

    TESTS
      .filter(test => test.keys.find(key => typeof value[key] !== 'undefined'))
      .forEach(test => {
        const {keys, validate} = test

        if (keys.find(key => typeof value[key] === 'undefined')) {
          throw new Error(`All keys must exist altogether: ${keys.join(', ')}`)
        }

        if (validate) {
          validate(...keys.map(key => value[key]))
        }
      })
  }
}
