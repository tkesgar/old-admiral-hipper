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
