const {default: ow} = require('ow')

// Regex source: https://html.spec.whatwg.org/#e-mail-state-(type=email)
// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

module.exports = value => {
  ow(value, ow.string.matches(EMAIL_REGEX))
}
