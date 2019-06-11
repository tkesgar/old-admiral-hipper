const express = require('express')
const requireAll = require('./require-all')

function createApp() {
  const app = express()

  requireAll('./mods', {name: null}).forEach(mod => mod(app))

  return app
}

module.exports = createApp
