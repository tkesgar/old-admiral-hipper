#!/usr/bin/env node
require('../lib/load-env')()

const fs = require('fs')
const {sendMailFromTemplate} = require('../services/mail')

async function main() {
  const {to, template, data} = JSON.parse(fs.readFileSync(0))
  await sendMailFromTemplate(to, template, data)
}

main(...process.argv.slice(2))
  .then(() => {
    process.exit()
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
