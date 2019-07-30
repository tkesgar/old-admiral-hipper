const MailService = require('../mail')
const GuardianService = require('../guardian')
const UserModel = require('../../models/user')
const log = require('../../utils/log')
const {FailError} = require('../../utils/error')

class AuthPasswordError extends FailError {
  constructor() {
    super('AUTH_FAILED', {
      message: 'Invalid email or password',
      statusCode: 401
    })
  }
}

class TokenExistError extends FailError {
  constructor() {
    super('LINK_EXIST', {message: 'Link has not expired yet'})
  }
}

class DuplicateEmailError extends FailError {
  constructor() {
    super('DUP_EMAIL', {message: 'Email has been registered'})
  }
}

class EmailNotExistError extends FailError {
  constructor() {
    super('EMAIL_NOT_EXIST', {message: 'Email does not exist'})
  }
}

class InvalidTokenError extends FailError {
  constructor() {
    super('INVALID_TOKEN', {message: 'Invalid token'})
  }
}

class UserService {
  static async authenticateUserFromGoogle(profile) {
    const user = await UserModel.findByGoogleId(profile.id)
    if (user) {
      log.debug({user}, 'Authenticate using exisiting user')
      return user
    }

    const rawProfile = profile._json
    const newUserId = await UserModel.insert({
      email: rawProfile.email,
      displayName: rawProfile.name,
      emailVerified: rawProfile.email_verified,
      googleId: rawProfile.sub
    })
    const newUser = await UserModel.findById(newUserId)

    log.debug({user: newUser}, 'Authenticate by inserting a new user')
    return newUser
  }

  static async authenticateUserFromPassword(email, password) {
    const user = await UserModel.findByEmail(email)
    if (!user) {
      log.debug(`Email does not exist: ${email}`)
      throw new AuthPasswordError()
    }

    const passwordMatch = await user.testPassword(password)
    if (!passwordMatch) {
      log.debug(`Incorrect password: ${email}`)
      throw new AuthPasswordError()
    }

    log.debug({user, email, password}, 'Authenticate user using password')
    return user
  }

  static async register(email, password) {
    await GuardianService.validateMany(
      ['email', email],
      ['password', password]
    )

    const user = await UserModel.findByEmail(email)
    if (user) {
      throw new DuplicateEmailError()
    }

    const newUserId = await UserModel.insert({email, password})
    log.debug({user, email, password}, 'Registered a new user')

    return UserModel.findById(newUserId)
  }

  static async sendResetPassword(user) {
    if (!user.emailVerified) {
      throw new EmailNotExistError()
    }

    if (user.resetPasswordToken) {
      throw new TokenExistError()
    }

    const token = await user.generateResetPasswordToken()
    const url = `${process.env.APP_BASE_URL}/reset-password?token=${token}`

    await MailService.sendMail(user.email, 'reset-password', {
      title: '[CharaDB] Pemasangan Ulang Kata Sandi',
      displayName: user.displayName,
      link: url
    })
  }

  static async resetPassword(token, newPassword) {
    await GuardianService.validate('password', newPassword)

    if (!token) {
      throw new InvalidTokenError()
    }

    const user = await UserModel.findByResetPasswordToken(token)
    if (!user) {
      throw new InvalidTokenError()
    }

    await user.setPassword(newPassword)
    await user.clearResetPasswordToken()
  }

  static async sendVerifyEmail(user) {
    if (user.verifyEmailToken) {
      throw new TokenExistError()
    }

    const token = await user.generateEmailVerifyToken()
    const url = `${process.env.BASE_URL}/auth/verify-email?token=${token}`

    await MailService.sendMail(user.email, 'verify-email', {
      title: '[CharaDB] Verifikasi Email',
      displayName: user.displayName,
      link: url
    })
  }

  static async verifyEmail(token) {
    if (!token) {
      throw new InvalidTokenError()
    }

    const user = await UserModel.findByVerifyEmailToken(token)
    if (!user) {
      throw new InvalidTokenError()
    }

    await user.setEmailVerified(true)
    await user.clearEmailVerifyToken()
  }

  static async changeEmail(user, newEmail) {
    await GuardianService.validate('email', newEmail)

    await user.setEmail(newEmail)
  }

  static async changePassword(user, newPassword) {
    await GuardianService.validate('password', newPassword)

    await user.setPassword(newPassword)
  }

  static async changeDisplayName(user, newDisplayName) {
    await GuardianService.validate('display-name', newDisplayName)

    await user.setDisplayName(newDisplayName)
  }

  static async serialize(user) {
    if (!user.id) {
      throw new TypeError('Invalid user object for serialization')
    }

    return user.id
  }

  static async deserialize(id) {
    return (await UserModel.findById(id)) || false
  }
}

module.exports = UserService
