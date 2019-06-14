const User = require('../models/user')
const log = require('../services/log')
const {AppError} = require('../utils/error')
const {sendMailFromTemplate} = require('../services/mail')
const v = require('../utils/validate')

exports.authByPassword = async (name, password) => {
  const user = await User.findByName(name)
  if (!user) {
    log.debug({name}, 'User not found in database')
    return null
  }

  const passwordMatch = await user.testPassword(password)
  if (!passwordMatch) {
    log.debug({name}, 'Password for user does not match')
    return null
  }

  log.debug({user}, 'User logged in')
  return user
}

exports.sendResetPasswordToken = async (name, email) => {
  const user = await User.findByName(name)
  if (!user) {
    throw new AppError('User does not exist', 'NO_USER', {name})
  }

  if (user.recoverPasswordToken) {
    throw new AppError('Current token has not expired', 'TOKEN_EXIST')
  }

  if (!user.hasEmail) {
    throw new AppError('User does not have email address or email address has not been verified', 'NO_EMAIL')
  }

  const emailMatch = await user.testEmail(email)
  if (!emailMatch) {
    throw new AppError('Incorrect email address', 'INCORRECT_EMAILADDR')
  }

  const token = await user.generateRecoverPasswordToken()

  const info = await sendMailFromTemplate(email, 'forgot-password', {
    title: 'Account password recovery',
    user: {
      name: user.name,
      displayName: user.displayName
    },
    link: _getResetPasswordLink(user.name, token)
  })

  log.debug({info}, 'Email sent')
}

exports.resetPassword = async (name, token, password) => {
  v.validatePassword(password)

  const user = await User.findByName(name)
  if (!user) {
    throw new AppError('User does not exist', 'NO_USER', {name})
  }

  const userToken = user.recoverPasswordToken
  if (!userToken) {
    throw new AppError('Token does not exist or has expired', 'NO_TOKEN')
  }

  if (token !== userToken) {
    throw new AppError('Invalid token', 'INVALID_TOKEN')
  }

  // TODO Buat jadi satu query (tambah function di model)
  await user.clearRecoverPasswordToken()
  await user.setPassword(password)
}

exports.verifyEmail = async (name, token) => {
  const user = await User.findByName(name)
  if (!user) {
    throw new AppError('User does not exist', 'NO_USER', {name})
  }

  const userToken = user.emailVerifyToken
  if (!userToken) {
    throw new AppError('Token does not exist or has expired', 'NO_TOKEN')
  }

  if (token !== userToken) {
    throw new AppError('Invalid token', 'INVALID_TOKEN')
  }

  // TODO Buat jadi satu query (tambah function di model)
  await user.clearEmailVerifyToken()
  await user.setEmailVerified()
}

exports.register = async (name, password, email) => {
  v.validateName(name)
  v.validatePassword(password)
  v.validateEmail(email)

  const user = await User.insert({name, password, email})

  log.debug({user}, 'New user registered')
  return user
}

function _getResetPasswordLink(name, token) {
  return `${process.env.APP_BASE_URL}/recover-password?user=${name}&token=${token}`
}
