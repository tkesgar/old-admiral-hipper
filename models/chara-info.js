const Row = require('../utils/row')
const db = require('../utils/db')
const {CUSTOM_KEY_PREFIX} = require('../utils/legacy-chara-info')

const TABLE = 'chara_info'
const TYPE_INTEGER = 'i'
const TYPE_STRING = 's'

function getType(value) {
  if (Number.isInteger(value)) {
    return TYPE_INTEGER
  }

  if (typeof value === 'string') {
    return TYPE_STRING
  }

  throw new Error(`Unknown type for value: ${value}`)
}

function getValueColumns(value) {
  const type = getType(value)

  return {
    /* eslint-disable camelcase */
    type,
    value_i: type === TYPE_INTEGER ? value : null,
    value_s: type === TYPE_STRING ? value : null
    /* eslint-enable camelcase */
  }
}

function mapInsert(data) {
  const {
    charaId,
    key,
    value
  } = data

  return {
    /* eslint-disable camelcase */
    chara_id: charaId,
    key,
    ...getValueColumns(value)
    /* eslint-enable camelcase */
  }
}

class CharaInfo extends Row {
  static createQuery(conn = db) {
    return Row.createQuery(conn, TABLE)
  }

  static async findAll(where, conn = db) {
    return Row.findAll(conn, TABLE, where, row => new CharaInfo(row, conn))
  }

  static async find(where, conn = db) {
    return Row.find(conn, TABLE, where, row => new CharaInfo(row, conn))
  }

  static async findById(id, conn = db) {
    return CharaInfo.find({id}, conn)
  }

  static async findByCharaKey(charaId, key, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaInfo.find({chara_id: charaId, key}, conn)
  }

  static async findAllByChara(charaId, keys = null, conn = db) {
    return CharaInfo.findAll(function () {
      this.where('chara_id', charaId)

      if (keys) {
        this.andWhere(function () {
          this.whereIn('key', keys)
        })
      }
    }, conn)
  }

  static async countAllByChara(charaId, conn = db) {
    const [{'count(*)': count}] = await CharaInfo.createQuery(conn)
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

  static async deleteManyFromChara(charaId, keys, conn = db) {
    await CharaInfo.createQuery(conn)
      .where('chara_id', charaId)
      .andWhere(function () {
        this.whereIn('key', keys)
      })
      .delete()
  }

  static async deleteAllFromChara(charaId, conn = db) {
    await CharaInfo.createQuery(conn)
      .where('chara_id', charaId)
      .delete()
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
    return this.getColumn('type')
  }

  get value() {
    return this.getColumn(`value_${this.type}`)
  }

  async setValue(value) {
    const data = getValueColumns(value)
    await this.setColumns(data)
  }

  get isCustom() {
    return this.key.startsWith(CUSTOM_KEY_PREFIX)
  }
}

module.exports = CharaInfo
