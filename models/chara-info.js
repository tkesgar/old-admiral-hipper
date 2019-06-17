const Row = require('../lib/knex-utils/row')
const db = require('../services/database')
const {CUSTOM_KEY_PREFIX} = require('../utils/validate/chara-info')

const TABLE = 'chara_info'

class CharaInfo extends Row {
  static get CUSTOM_KEY_PREFIX() {
    return CUSTOM_KEY_PREFIX
  }

  static async findById(id, conn = db) {
    const [row] = await conn(TABLE).where('id', id)
    return row ? new CharaInfo(row, conn) : null
  }

  static async findByCharaKey(charaId, key, conn = db) {
    const [row] = await conn(TABLE).where('chara_id', charaId).andWhere('key', key)
    return row ? new CharaInfo(row, conn) : null
  }

  static async findAllByChara(charaId, conn = db) {
    return conn(TABLE).where('chara_id', charaId).map(row => new CharaInfo(row, conn))
  }

  static async insert(data, conn = db) {
    const {
      charaId,
      key,
      value,
      type: insertType = null
    } = data

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

  static async insertMany(data, conn = db) {
    const {
      entries,
      charaId: insertCharaId = null
    } = data

    await conn(TABLE).insert(entries.map(entry => {
      const {
        key,
        insertType = null,
        value
      } = entry

      const charaId = insertCharaId || entry.charaId
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
    return this.key.startsWith(CharaInfo.CUSTOM_KEY_PREFIX)
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
      id: this.id,
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
