const Row = require('../lib/knex-utils/row')
const db = require('../services/database')

const TABLE = 'file'

class File extends Row {
  static async findAll(where, conn = db) {
    return Row.findAll(TABLE, where, row => new File(row, conn), conn)
  }

  static async find(where, conn = db) {
    return Row.find(TABLE, where, row => new File(row, conn), conn)
  }

  static async findById(id, conn = db) {
    return File.find({id}, conn)
  }

  static async insert(data, conn = db) {
    const {
      userId,
      ext
    } = data

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      user_id: userId,
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

  get ext() {
    return this.getColumn('ext')
  }

  get filename() {
    return `${this.id}.${this.ext}`
  }

  async setUserId(userId) {
    await this.setColumn('user_id', userId)
  }

  async setExt(ext) {
    await this.setColumn('ext', ext)
  }

  async touch() {
    await this.setColumn('updated_time', db.fn.now())
  }
}

module.exports = File
