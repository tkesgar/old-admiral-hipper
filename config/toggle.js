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
  log.debug({toggle}, 'Toggle file read')
}

module.exports = toggle
