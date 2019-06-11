const {urlencoded, json} = require('express')

module.exports = app => {
  app.use(urlencoded({extended: false}))
  app.use(json())
}
