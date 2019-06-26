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
