const loadEnv = require('../lib/load-env')

loadEnv()

const env = process.env.NODE_ENV
exports.env = env

const dev = env === 'development'
exports.dev = dev

const test = env === 'test'
exports.test = test

const production = env === 'production'
exports.production = production

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`
exports.baseurl = baseUrl

const appCallbackUrl = `${process.env.APP_BASE_URL}/_callback`
exports.appCallbackUrl = appCallbackUrl
