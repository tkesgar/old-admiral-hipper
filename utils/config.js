const fs = require('fs')
const path = require('path')
const log = require('./log')

function loadConfig(name, defaults = {}) {
  const config = {...defaults}

  const configPath = path.resolve(`./config/${name}.json`)
  if (fs.existsSync(configPath)) {
    Object.assign(config, require(configPath))
  }

  log.debug({config}, `Configuration '${name}' loaded`)
  return config
}

exports.toggle = loadConfig('toggle', {
  registerUser: true,
  sendEmail: true
})

exports.limits = loadConfig('limits', {
  maxCharaPerUser: 5,
  maxInfoPerChara: 100,
  maxFilePerChara: 10
})
