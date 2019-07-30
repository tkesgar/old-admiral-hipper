const path = require('path')
const dotenv = require('dotenv')

function loadEnv(dir = './env') {
  dotenv.config({path: path.join(dir, '.env')})

  if (process.env.NODE_ENV) {
    dotenv.config({path: path.join(dir, `${process.env.NODE_ENV}.env`)})
  }

  dotenv.config({path: path.join(dir, 'default.env')})
}

exports.loadEnv = loadEnv

function getValue(name, defaultValue) {
  const value = process.env[name]
  if (typeof value === 'undefined') {
    if (typeof defaultValue === 'undefined') {
      throw new TypeError(`Environment variable does not exist: ${name}`)
    }

    return defaultValue
  }

  return value
}

exports.getValue = getValue

function getEnv() {
  return getValue('NODE_ENV', 'development')
}

exports.getEnv = getEnv

function isDev() {
  return getEnv() === 'development'
}

exports.isDev = isDev

function isTest() {
  return getEnv() === 'test'
}

exports.isTest = isTest

function isProduction() {
  return getEnv() === 'production'
}

exports.isProduction = isProduction

function getBaseURL() {
  return getValue('BASE_URL', `http://localhost:${getValue('PORT')}`)
}

exports.getBaseURL = getBaseURL

function getAppBaseURL() {
  return getValue('APP_BASE_URL', 'http://localhost:8080')
}

exports.getAppBaseURL = getAppBaseURL

function getAppCallbackURL() {
  return `${getAppBaseURL()}/_callback`
}

exports.getAppCallbackURL = getAppCallbackURL

function getFileUploadDirPath() {
  return path.resolve(getValue('FILE_UPLOAD_DIR'))
}

exports.getFileUploadDirPath = getFileUploadDirPath
