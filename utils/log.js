const pino = require('pino')
const {production} = require('../config/env')

module.exports = pino({
  name: process.env.LOG_NAME,
  level: process.env.LOG_LEVEL,
  serializers: pino.stdSerializers,
  prettyPrint: production ? false : {translateTime: 'SYS:HH:MM:ss.l'}
})
