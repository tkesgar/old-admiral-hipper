const crypto = require('crypto')
const Row = require('../utils/row')
const db = require('../utils/db')

const TABLE = 'file'

function getRandom() {
  const rand = crypto.randomBytes(8).toString('hex')
  const ts = Date.now().toString(16)
  return rand + ts
}

function mapInsert(data) {
  const {
    userId,
    ext,
    rand = getRandom()
  } = data

  return {
    /* eslint-disable camelcase */
    user_id: userId,
    ext,
    rand
    /* eslint-enable camelcase */
  }
}

class File extends Row {
  static createQuery(conn = db) {
    return Row.createQuery(conn, TABLE)
  }

  static async findAll(where, conn = db) {
    return Row.findAll(conn, TABLE, where, row => new File(row, conn))
  }

  static async find(where, conn = db) {
    return Row.find(conn, TABLE, where, row => new File(row, conn))
  }

  static async findById(id, conn = db) {
    return File.find({id}, conn)
  }

  static async insert(data, conn = db) {
    return Row.insert(conn, TABLE, mapInsert(data))
  }

  static async insertMany(dataArray, conn = db) {
    await Row.insert(conn, TABLE, dataArray.map(File.mapInsert))
  }

  static async deleteMany(ids, conn = db) {
    await File.createQuery(conn)
      .whereIn('id', ids)
      .delete()
  }

  constructor(row, conn = db) {
    super(conn, TABLE, row)
  }

  get rand() {
    return this.getColumn('rand')
  }

  async setRand(rand = getRandom()) {
    await this.setColumn('rand', rand)
  }

  get ext() {
    return this.getColumn('ext')
  }

  async setExt(ext) {
    await this.setColumn('ext', ext)
  }

  get name() {
    return `${this.rand}.${this.ext}`
  }
}

module.exports = File
