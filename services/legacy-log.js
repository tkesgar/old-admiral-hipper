const pino = require('pino')
const {isProduction} = require('../utils/env')

module.exports = pino({
  name: process.env.LOG_NAME,
  level: process.env.LOG_LEVEL,
  serializers: pino.stdSerializers,
  prettyPrint: isProduction() ? false : {translateTime: 'SYS:HH:MM:ss.l'}
})
