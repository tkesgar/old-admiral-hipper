const log = require('../services/log')
const {AppError} = require('../utils/error')
const {sendMailFromTemplate} = require('../services/mail')
const {baseurl} = require('../config/env')

exports.deleteUser = async (user, password) => {
  const passwordMatch = await user.testPassword(password)
  if (!passwordMatch) {
    throw new AppError('Invalid password', 'INVALID_PASSWORD')
  }

  await user.delete()
}

exports.sendVerifyEmail = async (user, email) => {
  if (user.hasEmail) {
    throw new AppError('User email has been verified', 'USER_EMAIL_VERIFIED')
  }

  if (user.emailVerifyToken) {
    throw new AppError('Current email verification token has not been expired', 'TOKEN_NOT_EXPIRED')
  }

  const emailMatch = await user.testEmail(email, false)
  if (!emailMatch) {
    throw new AppError('Incorrect user email', 'USER_INCORRECT_EMAIL')
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

  log.debug({info}, 'Email sent')
}

function _getEmailVerifyLink(name, token) {
  return `${baseurl}/auth/verify-email?name=${name}&token=${token}`
}
