const express = require('express')
const requireAll = require('./require-all')

function createApp() {
  const app = express()

  const mods = requireAll('./mods', {name: null})
  for (const mod of mods) {
    mod(app)
  }

  return app
}

module.exports = createApp
