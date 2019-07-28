const knex = require('knex')
const {dev} = require('../config/env')

module.exports = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    charset: 'utf8mb4'
  },
  asyncStackTrace: dev
})
