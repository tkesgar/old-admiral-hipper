const Row = require('../utils/row')
const db = require('../utils/db')

const TABLE = 'chara'

class Chara extends Row {
  static createQuery(conn = db) {
    return Row.createQuery(conn, TABLE)
  }

  static async findAll(where, conn = db) {
    return Row.findAll(conn, TABLE, where, row => new Chara(row, conn))
  }

  static async find(where, conn = db) {
    return Row.find(conn, TABLE, where, row => new Chara(row, conn))
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
    const [{'count(*)': count}] = await Chara.createQuery(conn)
      .where('user_id', userId)
      .count()

    return count
  }

  static async insert(data, conn = db) {
    const {
      userId,
      name,
      bio = null
    } = data

    return Row.insert(conn, TABLE, {
      /* eslint-disable camelcase */
      user_id: userId,
      name,
      bio: bio ? JSON.stringify(bio) : null
      /* eslint-enable camelcase */
    })
  }

  constructor(row, conn = db) {
    super(conn, TABLE, row)
  }

  get userId() {
    return this.getColumn('user_id')
  }

  get name() {
    return this.getColumn('name')
  }

  async setName(name) {
    await this.setColumn('name', name)
  }

  get bio() {
    const bioJSON = this.getColumn('bio')
    return bioJSON ? JSON.parse(bioJSON) : null
  }

  async setBio(bio) {
    await this.setColumn('bio', bio ? JSON.stringify(bio) : null)
  }
}

module.exports = Chara
