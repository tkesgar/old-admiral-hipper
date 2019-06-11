const cors = require('cors')
const {dev} = require('../config/env')

module.exports = app => {
  app.use(cors({
    origin: dev ? true : /nusaleague\.com$/,
    credentials: true
  }))
}
