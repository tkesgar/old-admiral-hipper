const fs = require('fs')
const path = require('path')
const log = require('../services/log')

const toggle = {
  register: true,
  customCharaInfo: true
}

const toggleFile = path.resolve('./toggle.json')
if (fs.existsSync(toggleFile)) {
  Object.assign(toggle, JSON.parse(fs.readFileSync(toggleFile)))
} else {
  log.info('toggle.json does not exist; using default toggle data')
}

module.exports = toggle
