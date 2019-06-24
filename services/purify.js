const requireAll = require('../lib/require-all')

const validators = requireAll('./services/validators')
  .reduce((validators, [name, validator]) => {
    validators[name] = validator
    return validators
  }, {})

const sanitizers = requireAll('./services/sanitizers')
  .reduce((sanitizers, [name, sanitizer]) => {
    sanitizers[name] = sanitizer
    return sanitizers
  }, {})

async function validate(type, value, opts = {}) {
  const {fn, defaultOpts} = validators[type]
  await fn(value, {...defaultOpts, ...opts})
}

exports.validate = validate

async function sanitize(type, value, opts = {}) {
  const {fn, defaultOpts = {}} = sanitizers[type]
  return fn(value, {...defaultOpts, ...opts})
}

exports.sanitize = sanitize

async function purify(type, value, opts = {}) {
  await validate(type, value, opts)
  return sanitizers[type] ? sanitize(type, value, opts) : value
}

exports.purify = purify
