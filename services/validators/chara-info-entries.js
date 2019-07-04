const {default: ow} = require('ow')
const {GROUPS} = require('../../utils/chara-info')

module.exports = {
  fn(value) {
    console.log(value)
    ow(value, ow.object.valuesOfType(ow.any(ow.string, ow.number.integer)))

    GROUPS
      .filter(test => test.keys.find(key => typeof value[key] !== 'undefined'))
      .forEach(test => {
        const {keys, validate} = test

        // Nggak bisa pakai hasKeys soalnya pakai dot notation :(
        for (const key of keys) {
          ow(value[key], ow.any(ow.string, ow.number.integer))
        }

        if (validate) {
          validate(...keys.map(key => value[key]))
        }
      })
  }
}
