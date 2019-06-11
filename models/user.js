const upash = require('upash')
const moment = require('moment')
const Row = require('../lib/knex-utils/row')
const db = require('../utils/database')
const generateToken = require('../lib/generate-token')

const TABLE = 'user'

class User extends Row {
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

    const passwordHash = upash.use('pbkdf2').hash(password)
    const emailHash = upash.use('pbkdf2').hash(email)

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
    if (moment().isAfter(time)) {
      return null
    }

    return this.getColumn('recover_password_token')
  }

  get emailVerifyToken() {
    const time = this.getColumn('email_verify_time')
    if (moment().isAfter(time)) {
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

  async generateRecoverPasswordToken() {
    const token = generateToken()
    const expire = moment().add(1, 'h').toDate()

    await this.query.update({
      /* eslint-disable camelcase */
      recover_password_token: token,
      recover_password_time: expire
      /* eslint-enable camelcase */
    })

    return {token, expire}
  }

  async generateEmailVerifyToken() {
    const token = generateToken()
    const expire = moment().add(1, 'h').toDate()

    await this.query.update({
      /* eslint-disable camelcase */
      email_verify_token: token,
      email_verify_time: expire
      /* eslint-enable camelcase */
    })

    return {token, expire}
  }

  async clearRecoverPasswordToken() {
    await this.query.update({
      /* eslint-disable camelcase */
      recover_password_token: null,
      recover_password_time: null
      /* eslint-enable camelcase */
    })
  }

  async clearEmailVerifyToken() {
    await this.query.update({
      /* eslint-disable camelcase */
      email_verify_token: null,
      email_verify_time: null
      /* eslint-enable camelcase */
    })
  }
}

module.exports = User
