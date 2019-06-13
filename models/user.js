const upash = require('upash')
const moment = require('moment')
const Row = require('../lib/knex-utils/row')
const db = require('../services/database')
const generateToken = require('../lib/generate-token')
const {AppError} = require('../utils/error')

const TABLE = 'user'

class User extends Row {
  static getTokenExpireTime(time = new Date()) {
    const amount = Number(process.env.TOKEN_EXPIRE_INC_AMOUNT)
    const unit = process.env.TOKEN_EXPIRE_INC_UNIT
    return moment(time).add(amount, unit).toDate()
  }

  static async findById(id, conn = db) {
    const [row] = await conn(TABLE).where('id', id)
    return row ? new User(row, conn) : null
  }

  static async findByName(name, conn = db) {
    const [row] = await conn(TABLE).where('name', name)
    return row ? new User(row, conn) : null
  }

  static async findByFacebookId(facebookId, conn = db) {
    const [row] = await conn(TABLE).where('facebook_id', facebookId)
    return row ? new User(row, conn) : null
  }

  static async findByGoogleId(facebookId, conn = db) {
    const [row] = await conn(TABLE).where('google_id', facebookId)
    return row ? new User(row, conn) : null
  }

  static async register(data, conn = db) {
    const {
      name,
      password,
      email,
      isEmailVerified = false,
      facebookId = null,
      googleId = null
    } = data

    const passwordHash = await upash.use('pbkdf2').hash(password)
    const emailHash = await upash.use('pbkdf2').hash(email)

    try {
      const [id] = await conn(TABLE).insert({
        /* eslint-disable camelcase */
        name,
        password_hash: passwordHash,
        email_hash: emailHash,
        email_verified: isEmailVerified,
        facebook_id: facebookId,
        google_id: googleId
        /* eslint-enable camelcase */
      })

      return User.findById(id)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError(`User name ${name} is not available`, 'USERNAME_NOT_AVAILABLE', {name})
      }

      throw error
    }
  }

  constructor(row, conn = db) {
    super(TABLE, row, conn)
  }

  get name() {
    return this.getColumn('name')
  }

  get displayName() {
    return this.getColumn('display_name') || this.name
  }

  get isEmailVerified() {
    return Boolean(this.getColumn('email_verified'))
  }

  get hasEmail() {
    return Boolean(this.getColumn('email_hash')) && this.isEmailVerified
  }

  get recoverPasswordToken() {
    const time = this.getColumn('recover_password_time')
    const expireTime = User.getTokenExpireTime(time)
    if (moment().isAfter(expireTime)) {
      return null
    }

    return this.getColumn('recover_password_token')
  }

  get emailVerifyToken() {
    const time = this.getColumn('email_verify_time')
    const expireTime = User.getTokenExpireTime(time)
    if (moment().isAfter(expireTime)) {
      return null
    }

    return this.getColumn('email_verify_token')
  }

  get facebookId() {
    return this.getColumn('facebook_id')
  }

  get googleId() {
    return this.getColumn('google_id')
  }

  getData(scope = null) {
    switch (scope) {
      case 'personal':
        return {
          id: this.id,
          name: this.name,
          displayName: this.displayName,
          hasEmail: this.hasEmail,
          isEmailVerified: this.isEmailVerified,
          hasFacebook: Boolean(this.facebookId),
          hasGoogle: Boolean(this.googleId)
        }
      default:
        return {
          id: this.id,
          name: this.name,
          displayName: this.displayName
        }
    }
  }

  toJSON() {
    return this.getData()
  }

  async setName(name) {
    await this.setColumn('name', name)
  }

  async setDisplayName(displayName) {
    await this.setColumn('display_name', displayName)
  }

  async setPassword(password) {
    const hash = await upash.use('pbkdf2').hash(password)
    await this.setColumn('password_hash', hash)
  }

  async setEmail(email) {
    const hash = await upash.use('pbkdf2').hash(email)
    await this.query.update({
      /* eslint-disable camelcase */
      email_hash: hash,
      email_verified: false
      /* eslint-enable camelcase */
    })
  }

  async setFacebookId(facebookId) {
    await this.setColumn('facebook_id', facebookId)
  }

  async setGoogleId(googleId) {
    await this.setColumn('google_id', googleId)
  }

  async testPassword(password) {
    const hash = this.getColumn('password_hash')
    return upash.verify(hash, password)
  }

  async testEmail(email) {
    if (!this.isEmailVerified) {
      return false
    }

    const hash = this.getColumn('email_hash')
    return upash.verify(hash, email)
  }

  async generateRecoverPasswordToken(time = new Date()) {
    const token = generateToken()

    const data = {
      /* eslint-disable camelcase */
      recover_password_token: token,
      recover_password_time: time
      /* eslint-enable camelcase */
    }

    await this.query.update(data)
    Object.assign(this.row, data)

    return token
  }

  async generateEmailVerifyToken(time = new Date()) {
    const token = generateToken()

    const data = {
      /* eslint-disable camelcase */
      email_verify_token: token,
      email_verify_time: time
      /* eslint-enable camelcase */
    }

    await this.query.update(data)
    Object.assign(this.row, data)

    return token
  }

  async clearRecoverPasswordToken() {
    const data = {
      /* eslint-disable camelcase */
      recover_password_token: null,
      recover_password_time: null
      /* eslint-enable camelcase */
    }

    await this.query.update(data)
    Object.assign(this.row, data)
  }

  async clearEmailVerifyToken() {
    const data = {
      /* eslint-disable camelcase */
      email_verify_token: null,
      email_verify_time: null
      /* eslint-enable camelcase */
    }

    await this.query.update(data)
    Object.assign(this.row, data)
  }

  async setEmailVerified() {
    await this.setColumn('email_verified', true)
  }
}

module.exports = User
