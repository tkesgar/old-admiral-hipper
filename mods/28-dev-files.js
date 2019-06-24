const express = require('express')
const {dev, fileDir} = require('../config/env')

module.exports = app => {
  if (dev) {
    app.use('/files', express.static(fileDir))
  }
}
