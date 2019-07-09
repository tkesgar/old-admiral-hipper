const crypto = require('crypto')

function token(randomLength = 8, timestamp = true) {
  let token = crypto.randomBytes(randomLength).toString('hex')

  if (timestamp) {
    token += Date.now().toString(16)
  }

  return token
}

module.exports = token
