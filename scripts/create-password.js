#!/usr/bin/env node
const upash = require('upash')
const pbkdf2 = require('@phc/pbkdf2')

upash.install('pbkdf2', pbkdf2)

async function main(...args) {
  const [password, method = 'pbkdf2'] = args
  if (!password) {
    console.log('Usage: create-password <password> (method=pbkdf2)')
    return
  }

  const hash = await upash.use(method).hash(password)
  console.log(hash)
}

main(...process.argv.slice(2))
  .then(() => {
    process.exit()
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
