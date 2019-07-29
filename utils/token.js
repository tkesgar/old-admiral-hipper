const {randomBytes} = require('crypto')

module.exports = (length = 32, time = new Date()) => {
  if (length < 24) {
    throw new Error('Length must be >= 24')
  }

  let token = time ? time.getTime().toString(16) : ''
  token += randomBytes((length - token.length + 1) / 2).toString('hex')

  return token.slice(0, length)
}
