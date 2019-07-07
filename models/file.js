const crypto = require('crypto')
const Row = require('../lib/knex-utils/row')
const db = require('../services/database')

const TABLE = 'file'

function getRandom() {
  const rand = crypto.randomBytes(8).toString('hex')
  const ts = Date.now().toString(16)
  return rand + ts
}

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
      ext,
      rand = getRandom()
    } = data

    const [id] = await conn(TABLE).insert({
      /* eslint-disable camelcase */
      user_id: userId,
      ext,
      rand
      /* eslint-enable camelcase */
    })

    return id
  }

  static async insertMany(manyData, conn = db) {
    await conn(TABLE).insert(manyData.map(data => {
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
    }))
  }

  static async deleteMany(fileIds, conn = db) {
    await conn(TABLE).whereIn('id', fileIds).delete()
  }

  constructor(row, conn = db) {
    super(TABLE, row, conn)
  }

  get userId() {
    return this.getColumn('user_id')
  }

  get rand() {
    return this.getColumn('rand')
  }

  get ext() {
    return this.getColumn('ext')
  }

  get name() {
    return `${this.rand}.${this.ext}`
  }

  async setRand(rand = getRandom()) {
    await this.setColumn('rand', rand)
  }

  async setUserId(userId) {
    await this.setColumn('user_id', userId)
  }

  async setExt(ext) {
    await this.setColumn('ext', ext)
  }
}

module.exports = File
