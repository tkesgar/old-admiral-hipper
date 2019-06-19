const Row = require('../lib/knex-utils/row')
const db = require('../services/database')
const {AppError} = require('../utils/error')

const TABLE = 'file'

class File extends Row {
  static async findById(id, conn = db) {
    const [row] = await conn(TABLE).where('id', id)
    return row ? new File(row, conn) : null
  }

  static async findAllByIds(ids, conn = db) {
    return conn(TABLE).whereIn('id', ids).map(row => new File(row, conn))
  }

  static async findByName(name, conn = db) {
    const [row] = await conn(TABLE).where('name', name)
    return row ? new File(row, conn) : null
  }

  static async insert(data, conn = db) {
    const {
      userId,
      name,
      ext
    } = data

    if (await File.findByName(name, conn)) {
      throw new AppError('Name is not available', 'NAME_NOT_AVAILABLE', {name})
    }

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      user_id: userId,
      name,
      ext
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

  get ext() {
    return this.getColumn('ext')
  }

  get filename() {
    return `${this.name}.${this.ext}`
  }

  async setUserId(userId) {
    await this.setColumn('user_id', userId)
  }

  async setName(name) {
    await this.setColumn('name', name)
  }

  async setExt(ext) {
    await this.setColumn('ext', ext)
  }

  async touch() {
    await this.setColumn('updated_time', db.fn.now())
  }
}

module.exports = File
