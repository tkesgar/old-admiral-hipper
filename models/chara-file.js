const Row = require('../utils/legacy-knex-utils/row')
const db = require('../utils/db')

const TABLE = 'chara_file'

class CharaFile extends Row {
  static async findAll(where, conn = db) {
    return Row.findAll(TABLE, where, row => new CharaFile(row, conn), conn)
  }

  static async find(where, conn = db) {
    return Row.find(TABLE, where, row => new CharaFile(row, conn), conn)
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
      this.where('chara_id', charaId)
        .andWhere('key', 'like', `${type}%`)
    }, conn)
  }

  static async insert(data, conn = db) {
    const {
      charaId,
      key,
      fileId
    } = data

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      chara_id: charaId,
      key,
      file_id: fileId
      /* eslint-enable camelcase */
    })

    return id
  }

  static async insertMany(manyData, conn = db) {
    await conn(TABLE).insert(manyData.map(data => {
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
    }))
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

  get key() {
    return this.getColumn('key')
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

  async setCharaId(charaId) {
    await this.setColumn('chara_id', charaId)
  }

  async setKey(key) {
    await this.setColumn('key', key)
  }

  async setFileId(fileId) {
    await this.setColumn('file_id', fileId)
  }
}

module.exports = CharaFile
