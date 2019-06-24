const upash = require('upash')
const moment = require('moment')
const Row = require('../lib/knex-utils/row')
const db = require('../services/database')
const generateToken = require('../lib/generate-token')
const {AppError} = require('../utils/error')

const TABLE = 'user'

class User extends Row {
  static getTokenExpireTime(time = new Date(), amount = 1, unit = 'hour') {
    return moment(time).add(amount, unit).toDate()
  }

  static async findById(id, conn = db) {
    const [row] = await conn(TABLE).where('id', id)
    return row ? new User(row, conn) : null
  }

  static async findByEmail(email, conn = db) {
    const [row] = await conn(TABLE).where('email', email)
    return row ? new User(row, conn) : null
  }

  static async findByFacebookId(facebookId, conn = db) {
    const [row] = await conn(TABLE).where('facebook_id', facebookId)
    return row ? new User(row, conn) : null
  }

  static async findByGoogleId(googleId, conn = db) {
    const [row] = await conn(TABLE).where('google_id', googleId)
    return row ? new User(row, conn) : null
  }

  static async insert(data, conn = db) {
    const {
      email,
      displayName = null,
      password = null,
      isEmailVerified = false,
      facebookId = null,
      googleId = null
    } = data

    if (await User.findByEmail(email, conn)) {
      throw new AppError('Email is already registered', 'EMAIL_REGISTERED', {email})
    }

    const passwordHash = password ? await upash.use('pbkdf2').hash(password) : null

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      email,
      display_name: displayName,
      password_hash: passwordHash,
      email_verified: isEmailVerified,
      facebook_id: facebookId,
      google_id: googleId
      /* eslint-enable camelcase */
    })

    return id
  }

  constructor(row, conn = db) {
    super(TABLE, row, conn)
  }

  get email() {
    return this.getColumn('email')
  }

  get displayName() {
    return this.getColumn('display_name') || this.name
  }

  get isEmailVerified() {
    return Boolean(this.getColumn('email_verified'))
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

  async setEmail(email, emailVerified = false) {
    const data = {
      /* eslint-disable camelcase */
      email,
      email_verified: emailVerified
      /* eslint-enable camelcase */
    }

    await this.query.update(data)
    Object.assign(this.row, data)
  }

  async setDisplayName(displayName) {
    await this.setColumn('display_name', displayName)
  }

  async setPassword(password) {
    const hash = await upash.use('pbkdf2').hash(password)
    await this.setColumn('password_hash', hash)
  }

  async setEmailVerified(isEmailVerified) {
    await this.setColumn('email_verified', isEmailVerified)
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
}

module.exports = User
