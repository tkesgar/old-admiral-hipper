const loadEnv = require('./lib/load-env')

loadEnv()

module.exports = {
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME
  },
  migrations: {
    tableName: '_knex_migrations'
  }
}
