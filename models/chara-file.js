const Row = require('../utils/row')
const db = require('../utils/db')

const TABLE = 'chara_file'

function mapInsert(data) {
  const {
    charaId,
    key,
    fileId
  } = data

  return {
    /* eslint-disable camelcase */
    chara_id: charaId,
    key,
    file_id: fileId
    /* eslint-enable camelcase */
  }
}

class CharaFile extends Row {
  static createQuery(conn = db) {
    return Row.createQuery(conn)
  }

  static async findAll(where, conn = db) {
    return Row.findAll(conn, TABLE, where, row => new CharaFile(row, conn))
  }

  static async find(where, conn = db) {
    return Row.find(conn, TABLE, where, row => new CharaFile(row, conn))
  }

  static async findById(id, conn = db) {
    return CharaFile.find({id}, conn)
  }

  static async findByCharaKey(charaId, key, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaFile.find({chara_id: charaId, key}, conn)
  }

  static async findAllByChara(charaId, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaFile.findAll({chara_id: charaId}, conn)
  }

  static async findAllByCharaType(charaId, type, conn = db) {
    return CharaFile.findAll(function () {
      this.where('chara_id', charaId).andWhere('key', 'like', `${type}%`)
    }, conn)
  }

  static async countAllByChara(charaId, conn = db) {
    const [{'count(*)': count}] = await Row.createQuery(conn, TABLE)
      .where('chara_id', charaId)
      .count()

    return count
  }

  static async insert(data, conn = db) {
    return Row.insert(conn, TABLE, mapInsert(data))
  }

  static async insertMany(dataArray, conn = db) {
    await Row.insert(conn, TABLE, dataArray.map(mapInsert))
  }

  constructor(row, conn = db) {
    super(conn, TABLE, row)
  }

  get charaId() {
    return this.getColumn('chara_id')
  }

  get key() {
    return this.getColumn('key')
  }

  async setKey(key) {
    await this.setColumn('key', key)
  }

  get type() {
    return this.key.split('.').shift()
  }

  get variant() {
    return this.key.split('.').slice(1).pop() || null
  }

  get fileId() {
    return this.getColumn('file_id')
  }

  async setFileId(fileId) {
    await this.setColumn('file_id', fileId)
  }
}

module.exports = CharaFile
