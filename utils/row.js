class Row {
  static createQuery(conn, table) {
    return conn(table)
  }

  static async findAll(conn, table, where, map = row => new Row(conn, table, row)) {
    return Row.createQuery(conn, table).where(where).map(map)
  }

  static async find(conn, table, where, map = row => new Row(conn, table, row)) {
    const [result] = await Row.findAll(conn, table, where, map)
    return result || null
  }

  static async insert(conn, table, data) {
    const [id] = await Row.createQuery(conn, table).insert(data)
    return id
  }

  constructor(conn, table, row) {
    this._conn = conn
    this._table = table
    this._row = row

    this._initialConn = conn
  }

  isColumn(key) {
    return typeof this._row[key] !== 'undefined'
  }

  getColumn(key) {
    if (!this.isColumn(key)) {
      throw new TypeError(`Invalid column for table '${this._table}': ${key}`)
    }

    return this._row[key]
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
    return this._conn(this._table).where('id', this.id)
  }

  get connection() {
    return this._conn
  }

  set connection(value = null) {
    this._conn = value || this._initialConn
  }

  async setColumn(key, value) {
    await this.query.update({[key]: value})
    this._row[key] = value
  }

  async setColumns(data) {
    await this.query.update(data)
    Object.assign(this._row, data)
  }

  async delete() {
    await this.query.delete()
  }

  async touch() {
    /* eslint-disable camelcase */
    await this.query.update({updated_time: this._conn.fn.now()})
    this._row.updated_time = new Date()
    /* eslint-enable camelcase */
  }
}

module.exports = Row
