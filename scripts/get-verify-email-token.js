#!/usr/bin/env node
require('../lib/load-env')()

const User = require('../models/user')

async function main(...args) {
  const [name] = args
  if (!name) {
    console.log('Usage: get-verify-email-token <name>')
    return
  }

  const user = await User.findByName(name)

  const token = await user.generateEmailVerifyToken()
  console.log(token)
}

main(...process.argv.slice(2))
  .then(() => {
    process.exit()
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
