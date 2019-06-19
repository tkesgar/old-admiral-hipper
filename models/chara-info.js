const Row = require('../lib/knex-utils/row')
const db = require('../services/database')
const {AppError} = require('../utils/error')

const TABLE = 'chara_info'

class CharaInfo extends Row {
  static async findById(id, conn = db) {
    const [row] = await conn(TABLE).where('id', id)
    return row ? new CharaInfo(row, conn) : null
  }

  static async findByCharaKey(charaId, key, conn = db) {
    const [row] = await conn(TABLE).where('chara_id', charaId).andWhere('key', key)
    return row ? new CharaInfo(row, conn) : null
  }

  static async findAllByChara(charaId, conn = db) {
    return conn(TABLE).where('chara_id', charaId)
      .map(row => new CharaInfo(row, conn))
  }

  static async insert(data, conn = db) {
    const {
      charaId,
      key,
      value,
      type: insertType = null
    } = data

    if (CharaInfo.findByCharaKey(charaId, key, conn)) {
      throw new AppError('Info for chara already exists', 'INFO_EXIST', {charaId, key})
    }

    const type = _getType(insertType, value)

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      chara_id: charaId,
      key,
      type,
      ..._getColumnValues(type, value)
      /* eslint-enable camelcase */
    })

    return id
  }

  static async insertMany(entries, conn = db) {
    const count = await conn(TABLE)
      .whereIn(['chara_id', 'key'], entries.map(entry => [entry.charaId, entry.key]))
      .count()

    if (count > 0) {
      throw new AppError('Info for chara already exists', 'INFO_EXIST')
    }

    await conn(TABLE).insert(entries.map(entry => {
      const {
        charaId,
        key,
        value,
        type: insertType = null
      } = entry

      const type = _getType(insertType, value)

      return {
        /* eslint-disable camelcase */
        chara_id: charaId,
        key,
        type,
        ..._getColumnValues(type, value)
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

  async setValue(value, insertType = null) {
    const type = _getType(insertType, value)

    const data = {type, ..._getColumnValues(type, value)}

    await this.query.update(data)
    Object.assign(this.row, data)
  }

  getData() {
    return {
      key: this.key,
      value: this.value
    }
  }
}

module.exports = CharaInfo

function _getType(type, value) {
  if (!type) {
    if (Number.isInteger(value)) {
      return 'i'
    }

    if (typeof value === 'string') {
      return 's'
    }
  }

  switch (type) {
    case 'i':
    case 's':
      return type
    default:
      throw new Error(`Unknown chara info type: ${type}`)
  }
}

function _getColumnValues(type, value) {
  return {
    /* eslint-disable camelcase */
    value_i: type === 'i' ? value : null,
    value_s: type === 's' ? value : null
    /* eslint-enable camelcase */
  }
}
