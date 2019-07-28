const upash = require('upash')
const moment = require('moment')
const Row = require('../lib/knex-utils/row')
const db = require('../services/legacy-database')
const generateToken = require('../lib/token')

const TABLE = 'user'

class User extends Row {
  static getTokenExpireTime(time = new Date(), amount = 1, unit = 'hour') {
    return moment(time).add(amount, unit).toDate()
  }

  static async findAll(where, conn = db) {
    return Row.findAll(TABLE, where, row => new User(row, conn), conn)
  }

  static async find(where, conn = db) {
    return Row.find(TABLE, where, row => new User(row, conn), conn)
  }

  static async findById(id, conn = db) {
    return User.find({id}, conn)
  }

  static async findByEmail(email, conn = db) {
    return User.find({email}, conn)
  }

  static async findByFacebookId(facebookId, conn = db) {
    // eslint-disable-next-line camelcase
    return User.find({facebook_id: facebookId}, conn)
  }

  static async findByGoogleId(googleId, conn = db) {
    // eslint-disable-next-line camelcase
    return User.find({google_id: googleId}, conn)
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

    // TODO Handle error kalau email user sudah teregistrasi

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
    const displayName = this.getColumn('display_name')
    if (displayName) {
      return displayName
    }

    const nameFromEmail = this.email.split('@').shift().slice(0, 32)
    return nameFromEmail
  }

  get hasPassword() {
    return Boolean(this.getColumn('password_hash'))
  }

  get isEmailVerified() {
    return Boolean(this.getColumn('email_verified'))
  }

  get recoverPasswordToken() {
    const time = this.getColumn('reset_password_time')
    const expireTime = User.getTokenExpireTime(time)
    if (moment().isAfter(expireTime)) {
      return null
    }

    return this.getColumn('reset_password_token')
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
      reset_password_token: token,
      reset_password_time: time
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
      reset_password_token: null,
      reset_password_time: null
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
