const path = require('path')
const requireAll = require('../../utils/require-all')

const VALIDATORS = requireAll(path.join(__dirname, 'validators'))
  .reduce((validators, [name, validator]) => {
    validators[name] = validator
    return validators
  }, {})

const SANITIZER = requireAll(path.join(__dirname, 'sanitizers'))
  .reduce((sanitizers, [name, sanitizer]) => {
    sanitizers[name] = sanitizer
    return sanitizers
  }, {})

class GuardianService {
  static hasValidator(type) {
    return Boolean(VALIDATORS[type])
  }

  static async validate(type, value) {
    if (!this.hasValidator(type)) {
      throw new Error(`Unsupported type: ${type}`)
    }

    await VALIDATORS[type](value)
  }

  static async validateMany(...validateArgs) {
    await Promise.all(
      validateArgs.map(args => GuardianService.validate(...args))
    )
  }

  static hasSanitizer(type) {
    return Boolean(SANITIZER[type])
  }

  static async sanitize(type, value) {
    if (!this.hasSanitizer(type)) {
      throw new Error(`Unsupported type: ${type}`)
    }

    if (this.hasValidator(type)) {
      await this.validate(type, value)
    }

    return SANITIZER[type](value)
  }
}

module.exports = GuardianService
