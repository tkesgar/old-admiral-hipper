const log = require('../services/log')
const {AppError} = require('../utils/error')
const {sendMailFromTemplate} = require('../services/mail')
const {baseurl} = require('../config/env')
const v = require('../utils/validate')

exports.deleteUser = async user => {
  await user.delete()
  log.debug({user}, 'User deleted')
}

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
