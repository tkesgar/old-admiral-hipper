const Row = require('../lib/knex-utils/row')
const db = require('../services/legacy-database')

const TABLE = 'chara_like'

class CharaLike extends Row {
  // TODO findAll ini direfactor ulang
  static findAll(where, conn = db, rowFn = row => new CharaLike(row, conn)) {
    return Row.findAll(TABLE, where, rowFn, conn)
  }

  static async find(where, conn = db) {
    return Row.find(TABLE, where, row => new CharaLike(row, conn), conn)
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

  static async insert(data, conn = db) {
    const {
      charaId,
      userId
    } = data

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      chara_id: charaId,
      user_id: userId
      /* eslint-enable camelcase */
    })

    return id
  }

  static async countAllByChara(charaId, conn = db) {
    const [{'count(*)': count}] = await conn(TABLE).where('chara_id', charaId).count()
    return count
  }

  constructor(row, conn = db) {
    super(TABLE, row, conn)
  }

  get charaId() {
    return this.getColumn('chara_id')
  }

  get userId() {
    return this.getColumn('chara_id')
  }
}

module.exports = CharaLike
