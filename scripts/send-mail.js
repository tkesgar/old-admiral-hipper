#!/usr/bin/env node
require('../lib/load-env')()

const fs = require('fs')
const Mail = require('../utils/mail')

async function main() {
  const {to, template, data} = JSON.parse(fs.readFileSync(0))
  await new Mail().sendTemplate(to, template, data)
}

main(...process.argv.slice(2)).catch(error => {
  console.error(error)
  process.exitCode = 1
})
