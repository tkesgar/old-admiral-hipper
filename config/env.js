const path = require('path')
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

const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT}`
exports.baseURL = baseURL

const appBaseURL = process.env.APP_BASE_URL
exports.appBaseURL = appBaseURL

const appCallbackURL = `${appBaseURL}/_callback`
exports.appCallbackURL = appCallbackURL

const fileDir = path.resolve(process.env.FILE_UPLOAD_DIR)
exports.fileDir = fileDir
