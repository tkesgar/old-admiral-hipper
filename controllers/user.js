const log = require('../utils/log')
const {AppError} = require('../utils/legacy-error')
const {sendMailFromTemplate} = require('../services/legacy-mail')
const User = require('../models/user')
const {purify} = require('../services/legacy-purify')
const db = require('../utils/db')
const {getBaseURL} = require('../utils/env')

function getResetPasswordURL(token) {
  return `${process.env.APP_BASE_URL}/auth/reset-password?token=${token}`
}

function getVerifyEmailURL(token) {
  return `${getBaseURL()}/auth/verify-email?token=${token}&app`
}

exports.getUserData = user => {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    hasPassword: user.hasPassword,
    isEmailVerified: user.isEmailVerified,
    hasFacebook: Boolean(user.facebookId),
    hasGoogle: Boolean(user.googleId)
  }
}

exports.delete = async user => {
  await user.delete()
}

exports.setEmail = async (user, email) => {
  await purify(email, 'email')

  await user.setEmail(email)
}

exports.setDisplayName = async (user, displayName) => {
  await purify(displayName, 'display-name')

  await user.setDisplayName(displayName)
}

exports.deleteDisplayName = async user => {
  await user.setDisplayName(null)
}

exports.setPassword = async (user, password, newPassword) => {
  if (user.hasPassword) {
    if (password === newPassword) {
      throw new AppError('Same password', 'SAME_PASSWORD')
    }

    const match = await user.testPassword(password)
    if (!match) {
      throw new AppError('Invalid password', 'INVALID_PASSWORD')
    }
  }

  await purify(newPassword, 'password')

  await user.setPassword(newPassword)
}

exports.getAuthData = user => {
  return {
    id: user.id,
    displayName: user.displayName
  }
}

exports.authenticate = async (email, password) => {
  const user = await User.findByEmail(email)
  if (!user) {
    return null
  }

  return (await user.testPassword(password)) ? user : null
}

exports.sendResetPasswordToken = async email => {
  const user = await User.findByEmail(email)
  if (!user || !user.isEmailVerified) {
    throw new AppError('User does not exist', 'NO_USER')
  }

  if (user.recoverPasswordToken) {
    throw new AppError('Token already exists', 'TOKEN_EXIST')
  }

  const token = await user.generateRecoverPasswordToken()

  const info = await sendMailFromTemplate(email, 'forgot-password', {
    title: 'Account password recovery',
    displayName: user.displayName,
    link: getResetPasswordURL(token)
  })

  log.debug({info}, 'Reset password email sent')
}

exports.sendVerifyEmailToken = async user => {
  if (user.isEmailVerified) {
    throw new AppError('Email has been verified', 'EMAIL_VERIFIED')
  }

  if (user.verifyEmailToken) {
    throw new AppError('Token already exists', 'TOKEN_EXIST')
  }

  const token = await user.generateEmailVerifyToken()

  const info = await sendMailFromTemplate(user.email, 'verify-email', {
    title: 'Verify email',
    displayName: user.displayName,
    link: getVerifyEmailURL(token)
  })

  log.debug({info}, 'Reset password email sent')
}

exports.resetPassword = async (token, newPassword) => {
  await db.transaction(async trx => {
    // eslint-disable-next-line camelcase
    const user = await User.find({reset_password_token: token}, trx)
    if (!user) {
      throw new AppError('Invalid token', 'INVALID_TOKEN')
    }

    await user.clearRecoverPasswordToken()
    await user.setPassword(newPassword)
  })
}

exports.verifyEmail = async token => {
  await db.transaction(async trx => {
    // eslint-disable-next-line camelcase
    const user = await User.find({email_verify_token: token}, trx)

    if (!user) {
      throw new AppError('User does not exist', 'NO_USER')
    }

    const userToken = user.emailVerifyToken
    if (!userToken) {
      throw new AppError('Token does not exist or has expired', 'NO_TOKEN')
    }

    if (token !== userToken) {
      throw new AppError('Invalid token', 'INVALID_TOKEN')
    }

    await user.clearEmailVerifyToken()
    await user.setEmailVerified(true)
  })
}

exports.register = async (email, password, displayName = null) => {
  await purify(email, 'email')
  await purify(password, 'password')
  await purify(displayName, 'display-name')

  try {
    await User.insert({
      email,
      password,
      displayName
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('user_email_unique')) {
        throw new AppError('Email address is already registered', 'EMAIL_EXIST', {email})
      }
    }
  }
}
