const Row = require('../utils/legacy-knex-utils/row')
const db = require('../utils/db')

const TABLE = 'chara'

class Chara extends Row {
  static async findAll(where, conn = db) {
    return Row.findAll(TABLE, where, row => new Chara(row, conn), conn)
  }

  static async find(where, conn = db) {
    return Row.find(TABLE, where, row => new Chara(row, conn), conn)
  }

  static async findById(id, conn = db) {
    return Chara.find({id}, conn)
  }

  static async findByName(name, conn = db) {
    return Chara.find({name}, conn)
  }

  static async findAllByUser(userId, conn = db) {
    // eslint-disable-next-line camelcase
    return Chara.findAll({user_id: userId}, conn)
  }

  static async countAllByUser(userId, conn = db) {
    const [{'count(*)': count}] = await conn(TABLE).where('user_id', userId).count()
    return count
  }

  static async insert(data, conn = db) {
    const {
      userId,
      name,
      bio = null
    } = data

    // TODO Handle error kalau nama chara sudah dipakai

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      user_id: userId,
      name,
      bio: bio ? JSON.stringify(bio) : null
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
    const bioJSON = this.getColumn('bio')
    return bioJSON ? JSON.parse(bioJSON) : null
  }

  async setUserId(userId) {
    await this.setColumn('user_id', userId)
  }

  async setName(name) {
    await this.setColumn('name', name)
  }

  async setBio(bio) {
    await this.setColumn('bio', bio ? JSON.stringify(bio) : null)
  }
}

module.exports = Chara
