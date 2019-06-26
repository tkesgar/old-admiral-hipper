const log = require('../services/log')
const {AppError} = require('../utils/error')
const {sendMailFromTemplate} = require('../services/mail')
const User = require('../models/user')
const {purify} = require('../services/purify')
const db = require('../services/database')

function getResetPasswordURL(name, token) {
  return `${process.env.APP_BASE_URL}/recover-password?user=${name}&token=${token}`
}

exports.getUserData = user => {
  return {
    email: user.email,
    displayName: user.displayName,
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

exports.setPassword = async (user, password) => {
  await purify(password, 'password')

  await user.setPassword(password)
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
  if (!user) {
    throw new AppError('User does not exist', 'NO_USER')
  }

  const token = await user.generateRecoverPasswordToken()

  const info = await sendMailFromTemplate(email, 'forgot-password', {
    title: 'Account password recovery',
    user: {
      name: user.name,
      displayName: user.displayName
    },
    link: getResetPasswordURL(token)
  })

  log.debug({info}, 'Email sent')
}

exports.resetPassword = async (token, newPassword) => {
  await db.transaction(async trx => {
    // eslint-disable-next-line camelcase
    const user = await User.findByEmail({reset_password_token: token}, trx)
    if (!user) {
      throw new AppError('User does not exist', 'NO_USER')
    }

    const userToken = user.recoverPasswordToken
    if (!userToken) {
      throw new AppError('Token does not exist or has expired', 'NO_TOKEN')
    }

    if (token !== userToken) {
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

  await User.insert({
    email,
    password,
    displayName
  })
}

/* =
exports.sendEmailVerifyToken = async (user, email) => {
  if (user.hasEmail) {
    throw new AppError('Email address has been verified', 'EMAILADDR_VERIFIED')
  }

  if (user.emailVerifyToken) {
    throw new AppError('Current token has not expired', 'TOKEN_EXIST')
  }

  const emailMatch = await user.testEmail(email, false)
  if (!emailMatch) {
    throw new AppError('Incorrect email address', 'INCORRECT_EMAILADDR')
  }

  const token = await user.generateEmailVerifyToken()

  const info = await sendMailFromTemplate(email, 'verify-email', {
    title: 'Email verification',
    user: {
      name: user.name,
      displayName: user.displayName
    },
    link: _getEmailVerifyLink(user.name, token)
  })

  log.debug({info}, 'Email verify token sent')
}

exports.setName = async (user, name) => {
  v.validateName(name)

  await user.setName(name)
}

exports.setDisplayName = async (user, displayName) => {
  v.validateDisplayName(displayName)

  await user.setDisplayName(displayName)
}

exports.setPassword = async (user, password) => {
  v.validatePassword(password)

  await user.setPassword(password)
}

exports.setEmail = async (user, email) => {
  v.validateEmail(email)

  await user.setEmail(email)
}

function _getEmailVerifyLink(name, token) {
  return `${baseurl}/auth/verify-email?name=${name}&token=${token}`
}
*/
