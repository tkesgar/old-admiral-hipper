const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const {fileDir, filePublicUrl} = require('../config/env')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

async function mkdirpAsync(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, undefined, err => err ? reject(err) : resolve())
  })
}

class FileIO {
  constructor(ext = null, id = _generateRandomId()) {
    this.id = id
    this.ext = ext
    this.dir1 = this.id.slice(0, 2)
    this.dir2 = this.id.slice(2, 4)
  }

  get filename() {
    const {id, ext} = this
    return ext ? `${id}.${ext}` : id
  }

  get publicURL() {
    return path.posix.join(filePublicUrl, this.dir1, this.dir2, this.filename)
  }

  get filepath() {
    return path.join(fileDir, this.dir1, this.dir2, this.filename)
  }

  async read() {
    return readFileAsync(this.filepath)
  }

  async write(buffer) {
    await mkdirpAsync(path.dirname(this.filepath))
    return writeFileAsync(this.filepath, buffer)
  }

  async delete() {
    return unlinkAsync(this.filepath)
  }

  async getReadStream() {
    return fs.createReadStream(this.filepath)
  }

  async getWriteStream() {
    return fs.createWriteStream(this.filepath)
  }
}

module.exports = FileIO

function _generateRandomId() {
  const dirs = crypto.randomBytes(2).toString('hex')
  const rand = crypto.randomBytes(14).toString('hex')
  const ts = Date.now().toString(16)

  return [dirs, ts, rand].join('').slice(0, 32)
}
