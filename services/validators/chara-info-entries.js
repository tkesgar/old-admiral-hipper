const {default: ow} = require('ow')
const {GROUPS} = require('../../utils/chara-info')

module.exports = {
  fn(value) {
    ow(value, ow.object.valuesOfType(ow.any(ow.string, ow.number.integer)))

    GROUPS
      .filter(test => test.keys.find(key => typeof value[key] !== 'undefined'))
      .forEach(test => {
        const {keys, validate} = test

        ow(value, ow.object.hasKeys(...keys))

        if (validate) {
          validate(...keys.map(key => value[key]))
        }
      })
  }
}
