class Row {
  static async findAll(table, where, rowFn, conn) {
    return conn(table).where(where).map(rowFn)
  }

  static async find(table, where, rowFn, conn) {
    const [result] = await conn(table).where(where).map(rowFn)
    return result || null
  }

  constructor(table, row, conn) {
    this.table = table
    this.row = row
    this.conn = conn
    this._conn = conn
  }

  isColumn(key) {
    return typeof this.row[key] !== 'undefined'
  }

  getColumn(key) {
    if (!this.isColumn(key)) {
      throw new Error(`Column does not exist: ${key}`)
    }

    return this.row[key]
  }

  get id() {
    return this.getColumn('id')
  }

  get createdTime() {
    return this.getColumn('created_time')
  }

  get updatedTime() {
    return this.getColumn('updated_time')
  }

  get query() {
    return this.conn(this.table).where('id', this.id)
  }

  setConnection(conn = null) {
    this.conn = conn || this._conn
  }

  async setColumn(key, value) {
    if (!this.isColumn(key)) {
      throw new Error(`Column does not exist: ${key}`)
    }

    await this.conn(this.table).where('id', this.id).update({[key]: value})

    this.row[key] = value
  }

  async delete() {
    await this.query.delete()
  }

  async touch() {
    await this.setColumn('updated_time', this.conn.fn.now())
  }
}

module.exports = Row
