const log = require('../utils/log')
const err = require('../utils/error')
const MailService = require('../services/mail')
const User = require('../models/user')
const GuardianService = require('../services/guardian')
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
  await GuardianService.validate('email', email)

  await user.setEmail(email)
}

exports.setDisplayName = async (user, displayName) => {
  await GuardianService.validate('display-name', displayName)

  await user.setDisplayName(displayName)
}

exports.deleteDisplayName = async user => {
  await user.setDisplayName(null)
}

exports.setPassword = async (user, password, newPassword) => {
  if (user.hasPassword) {
    if (password === newPassword) {
      throw new err.FailError('SAME_PASSWORD', {
        message: 'Password is same'
      })
    }

    const match = await user.testPassword(password)
    if (!match) {
      throw new err.FailError('INVALID_PASSWORD', {
        message: 'Invalid password',
        statusCode: 401
      })
    }
  }

  await GuardianService.validate('password', newPassword)

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
    throw new err.FailError('NO_USER', {
      message: 'User does not exist',
      statusCode: 401
    })
  }

  if (user.recoverPasswordToken) {
    throw new err.FailError('TOKEN_EXIST', {
      message: 'Token already exists'
    })
  }

  const token = await user.generateRecoverPasswordToken()

  const info = await MailService.sendMail(email, 'forgot-password', {
    title: 'Account password recovery',
    displayName: user.displayName,
    link: getResetPasswordURL(token)
  })

  log.debug({info}, 'Reset password email sent')
}

exports.sendVerifyEmailToken = async user => {
  if (user.isEmailVerified) {
    throw new err.FailError('EMAIL_VERIFIED', {
      message: 'Email has been verified'
    })
  }

  if (user.verifyEmailToken) {
    throw new err.FailError('TOKEN_EXIST', {
      message: 'Token already exists'
    })
  }

  const token = await user.generateEmailVerifyToken()

  const info = await MailService.sendMail(user.email, 'verify-email', {
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
      throw new err.FailError('INVALID_TOKEN', {
        message: 'Invalid token'
      })
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
      throw new err.FailError('NO_USER', {
        message: 'User does not exist',
        statusCode: 401
      })
    }

    const userToken = user.emailVerifyToken
    if (!userToken) {
      throw new err.FailError('NO_TOKEN', {
        message: 'Token does not exist or has expired'
      })
    }

    if (token !== userToken) {
      throw new err.FailError('INVALID_TOKEN', {
        message: 'Invalid token'
      })
    }

    await user.clearEmailVerifyToken()
    await user.setEmailVerified(true)
  })
}

exports.register = async (email, password, displayName = null) => {
  await GuardianService.validateMany(
    ['email', email],
    ['password', password],
    ['display-name', displayName]
  )

  // TODO Ini diganti dengan check di awal supaya nggak ngehabisin primary key
  try {
    await User.insert({
      email,
      password,
      displayName
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('user_email_unique')) {
        throw new err.FailError('EMAIL_EXIST', {
          message: 'Email address has been already registered'
        })
      }
    }
  }
}
