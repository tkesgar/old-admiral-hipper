const Row = require('../lib/knex-utils/row')
const db = require('../services/database')

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

class CharaInfo extends Row {
  static async findAll(where, conn = db) {
    return Row.findAll(TABLE, where, row => new CharaInfo(row, conn), conn)
  }

  static async find(where, conn = db) {
    return Row.find(TABLE, where, row => new CharaInfo(row, conn), conn)
  }

  static async findById(id, conn = db) {
    return CharaInfo.find({id}, conn)
  }

  static async findByCharaKey(charaId, key, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaInfo.find({chara_id: charaId, key}, conn)
  }

  static async findAllByChara(charaId, conn = db) {
    // eslint-disable-next-line camelcase
    return CharaInfo.findAll({chara_id: charaId}, conn)
  }

  static async insert(data, conn = db) {
    const {
      charaId,
      key,
      value
    } = data

    // TODO Handle error kalau chara info sudah ada

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      chara_id: charaId,
      key,
      ...getValueColumns(value)
      /* eslint-enable camelcase */
    })

    return id
  }

  static async insertMany(manyData, conn = db) {
    // TODO Handle error kalau ada chara info yang sudah ada

    await conn(TABLE).insert(manyData.map(data => {
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
    }))
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

  get isCustom() {
    return this.key.startsWith('x_')
  }

  get type() {
    return this.getColumn('type')
  }

  get value() {
    return this.getColumn(`value_${this.type}`)
  }

  async setKey(key) {
    await this.setColumn('key', key)
  }

  async setValue(value) {
    const data = getValueColumns(value)

    await this.query.update(data)
    Object.assign(this.row, data)
  }
}

module.exports = CharaInfo
