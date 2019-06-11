const path = require('path')
const dotenv = require('dotenv')

function loadEnv(dir = './env') {
  dotenv.config({path: path.join(dir, '.env')})

  if (process.env.NODE_ENV) {
    dotenv.config({path: path.join(dir, `${process.env.NODE_ENV}.local.env`)})
    dotenv.config({path: path.join(dir, `${process.env.NODE_ENV}.env`)})
  }

  dotenv.config({path: './env/default.env'})
}

module.exports = loadEnv
