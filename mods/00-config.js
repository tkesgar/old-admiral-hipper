const upash = require('upash')
const pbkdf2 = require('@phc/pbkdf2')
const {env} = require('../config/env')

module.exports = app => {
  if (!upash.list().includes('pbkdf2')) {
    upash.install('pbkdf2', pbkdf2)
  }

  app.set('view engine', 'ejs')
  app.set('env', env)
  app.set('trust proxy', JSON.parse(process.env.TRUST_PROXY))
}
