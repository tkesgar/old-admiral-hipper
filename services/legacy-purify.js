const requireAll = require('../utils/require-all')

const validators = requireAll('./services/legacy-validators')
  .reduce((validators, [name, validator]) => {
    validators[name] = validator
    return validators
  }, {})

const sanitizers = requireAll('./services/legacy-sanitizers')
  .reduce((sanitizers, [name, sanitizer]) => {
    sanitizers[name] = sanitizer
    return sanitizers
  }, {})

async function validate(value, type, opts = {}) {
  const {fn, defaultOpts} = validators[type]
  await fn(value, {...defaultOpts, ...opts})
}

exports.validate = validate

async function sanitize(value, type, opts = {}) {
  const {fn, defaultOpts = {}} = sanitizers[type]
  return fn(value, {...defaultOpts, ...opts})
}

exports.sanitize = sanitize

async function purify(value, type, opts = {}) {
  await validate(value, type, opts)
  return sanitizers[type] ? sanitize(value, type, opts) : value
}

exports.purify = purify
