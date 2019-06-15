const crypto = require('crypto')
const {promisify} = require('util')

const scryptAsync = promisify(crypto.scrypt)

const SALT = Buffer.from(process.env.EMAIL_HASH_SECRET, 'base64')

async function emailHash(email) {
  return (await scryptAsync(email, SALT, 64)).toString('base64')
}

module.exports = emailHash
