const Row = require('../lib/knex-utils/row')
const db = require('../services/database')
const {AppError} = require('../utils/error')

const TABLE = 'chara'

class Chara extends Row {
  static async findById(id, conn = db) {
    const [row] = await conn(TABLE).where('id', id)
    return row ? new Chara(row, conn) : null
  }

  static async findByName(name, conn = db) {
    const [row] = await conn(TABLE).where('name', name)
    return row ? new Chara(row, conn) : null
  }

  static async findAllByUser(userId, conn = db) {
    return conn(TABLE).where('user_id', userId).map(row => new Chara(row))
  }

  static async insert(data, conn = db) {
    const {
      userId,
      name,
      bio = null
    } = data

    if (await Chara.findByName(name, conn)) {
      throw new AppError('Name is not available', 'NAME_NOT_AVAILABLE', {name})
    }

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      user_id: userId,
      name,
      bio
      /* eslint-enable camelcase */
    })

    return id
  }

  constructor(row, conn = db) {
    super(TABLE, row, conn)
  }

  get userId() {
    return this.getColumn('user_id')
  }

  get name() {
    return this.getColumn('name')
  }

  get bio() {
    return this.getColumn('bio')
  }

  async setUserId(userId) {
    await this.setColumn('user_id', userId)
  }

  async setName(name) {
    await this.setColumn('name', name)
  }

  async setBio(bio) {
    await this.setColumn('bio', bio)
  }

  getData(opts = {}) {
    const {
      bio = true,
      userId = true
    } = opts

    const data = {
      id: this.id,
      name: this.name
    }

    if (bio) {
      Object.assign(data, {bio: this.bio})
    }

    if (userId) {
      Object.assign(data, {userId: this.userId})
    }

    return data
  }
}

module.exports = Chara
