const Row = require('../utils/row')
const db = require('../utils/db')

const TABLE = 'chara_like'

class CharaLike extends Row {
  static createQuery(conn = db) {
    return Row.createQuery(conn, TABLE)
  }

  static async findAll(where, conn = db) {
    return Row.findAll(conn, TABLE, where, row => new CharaLike(row, conn))
  }

  static async find(where, conn = db) {
    return Row.find(conn, TABLE, where, row => new CharaLike(row, conn))
  }

  static async findById(id, conn = db) {
    return CharaLike.find({id}, conn)
  }

  static async findByCharaUser(charaId, userId, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaLike.find({chara_id: charaId, user_id: userId}, conn)
  }

  static async findAllByChara(charaId, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaLike.findAll({chara_id: charaId}, conn)
  }

  static async findAllByUser(userId, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaLike.findAll({user_id: userId}, conn)
  }

  static async countAllByChara(charaId, conn = db) {
    const [{'count(*)': count}] = await CharaLike.createQuery(conn)
      .where('chara_id', charaId)
      .count()

    return count
  }

  static async countAllByUser(userId, conn = db) {
    const [{'count(*)': count}] = await CharaLike.createQuery(conn)
      .where('user_id', userId)
      .count()

    return count
  }

  static async insert(data, conn = db) {
    const {
      charaId,
      userId
    } = data

    return Row.insert(conn, TABLE, {
      /* eslint-disable camelcase */
      chara_id: charaId,
      user_id: userId
      /* eslint-enable camelcase */
    })
  }

  constructor(row, conn = db) {
    super(conn, TABLE, row)
  }

  get charaId() {
    return this.getColumn('chara_id')
  }

  get userId() {
    return this.getColumn('chara_id')
  }
}

module.exports = CharaLike
