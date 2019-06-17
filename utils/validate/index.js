const {default: ow} = require('ow')
const {AppError} = require('../error')
const isValidCharaInfo = require('./chara-info')

// Regex source: https://html.spec.whatwg.org/#e-mail-state-(type=email)
// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function validate(value, predicate, message, code) {
  if (!ow.isValid(value, predicate)) {
    throw new AppError(message, code, {value})
  }
}

exports.validate = validate

exports.validateName = name => validate(
  name,
  ow.string.matches(/^\w{1,16}$/).not.matches(/admin/),
  'Name is not allowed',
  'NAME_NOT_ALLOWED'
)

exports.validateDisplayName = displayName => validate(
  displayName,
  ow.string.nonEmpty.maxLength(32),
  'Display name is not allowed',
  'DISPLAY_NAME_NOT_ALLOWED'
)

exports.validateEmail = email => validate(
  email,
  ow.string.matches(EMAIL_REGEX),
  'Email is not allowed',
  'EMAIL_NOT_ALLOWED'
)

exports.validatePassword = password => validate(
  password,
  ow.string.minLength(8),
  'Password is not allowed',
  'PASSWORD_NOT_ALLOWED'
)

exports.validateBio = bio => validate(
  bio,
  ow.any(ow.null, ow.string.nonEmpty.maxLength(65535)),
  'Biodata is not allowed',
  'BIO_NOT_ALLOWED'
)

exports.validateCharaInfo = (key, value) => {
  if (!isValidCharaInfo(key, value)) {
    throw new AppError('Chara info is not allowed', 'CHARA_INFO_NOT_ALLOWED', {value: {key, value}})
  }
}
