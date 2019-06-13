const User = require('../models/user')
const log = require('../services/log')
const {AppError} = require('../utils/error')
const {sendMailFromTemplate} = require('../services/mail')

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

exports.sendForgotPasswordEmail = async (name, email) => {
  const user = await User.findByName(name)
  if (!user) {
    throw new AppError('User does not exist', 'USER_NOT_FOUND', {name})
  }

  if (user.recoverPasswordToken) {
    throw new AppError('Current recovery password token has not expired', 'TOKEN_NOT_EXPIRED')
  }

  if (!user.hasEmail) {
    throw new AppError('User does not have email or email has not been verified yet', 'USER_NO_EMAIL', {name})
  }

  const emailMatch = await user.testEmail(email)
  if (!emailMatch) {
    throw new AppError('Incorrect user email', 'USER_INCORRECT_EMAIL', {name})
  }

  const token = await user.generateRecoverPasswordToken()

  const info = await sendMailFromTemplate(email, 'forgot-password', {
    title: 'Account password recovery',
    user: {
      name: user.name,
      displayName: user.displayName
    },
    link: _getRecoverPasswordLink(user.name, token)
  })

  log.debug({info}, 'Email sent')
}

exports.resetPassword = async (name, token, password) => {
  const user = await User.findByName(name)
  if (!user) {
    throw new AppError('User does not exist', 'USER_NOT_FOUND', {name})
  }

  const userToken = user.recoverPasswordToken
  if (!userToken) {
    throw new AppError('User does not have token or token has expired', 'NO_TOKEN')
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
    throw new AppError('User does not exist', 'USER_NOT_FOUND', {name})
  }

  const userToken = user.emailVerifyToken
  if (!userToken) {
    throw new AppError('User does not have token or token has expired', 'NO_TOKEN')
  }

  if (token !== userToken) {
    throw new AppError('Invalid token', 'INVALID_TOKEN')
  }

  // TODO Buat jadi satu query (tambah function di model)
  await user.clearEmailVerifyToken()
  await user.setEmailVerified()
}

function _getRecoverPasswordLink(name, token) {
  return `${process.env.APP_BASE_URL}/recover-password?user=${name}&token=${token}`
}
