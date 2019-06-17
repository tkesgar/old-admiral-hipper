const crypto = require('crypto')
const {promisify} = require('util')

const scryptAsync = promisify(crypto.scrypt)

const SALT = Buffer.from(process.env.EMAIL_HASH_SECRET, 'base64')

async function mailHash(email) {
  return (await scryptAsync(email, SALT, 64)).toString('base64')
}

module.exports = mailHash
