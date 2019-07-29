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

function getEnv() {
  return process.env.NODE_ENV || 'development'
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
  return process.env.BASE_URL || `localhost:${process.env.PORT}`
}

exports.getBaseURL = getBaseURL

function getAppBaseURL() {
  return process.env.APP_BASE_URL || 'localhost:8080'
}

exports.getAppBaseURL = getAppBaseURL

function getAppCallbackURL() {
  return `${getAppBaseURL()}/_callback`
}

exports.getAppCallbackURL = getAppCallbackURL

function getFileUploadDirPath() {
  return path.resolve(process.env.FILE_UPLOAD_DIR)
}

exports.getFileUploadDirPath = getFileUploadDirPath
