const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const {fileDir, filePublicBaseURL} = require('../config/env')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

async function mkdirpAsync(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, undefined, err => err ? reject(err) : resolve())
  })
}

class FileIO {
  static generateName() {
    const dirs = crypto.randomBytes(2).toString('hex')
    const rand = crypto.randomBytes(14).toString('hex')
    const ts = Date.now().toString(16)

    return [dirs, ts, rand].join('').slice(0, 32)
  }

  constructor(opts = {}) {
    const {
      ext = null,
      name = FileIO.generateName(),
      dir1 = name.slice(0, 2),
      dir2 = name.slice(2, 4)
    } = opts

    this.name = name
    this.ext = ext
    this.dir1 = dir1
    this.dir2 = dir2
  }

  get filename() {
    const {name: id, ext} = this
    return ext ? `${id}.${ext}` : id
  }

  get dirs() {
    return [this.dir1, this.dir2]
  }

  get publicURL() {
    return path.posix.join(filePublicBaseURL, this.dir, this.dir2, this.filename)
  }

  get filepath() {
    return path.join(fileDir, this.dir, this.dir2, this.filename)
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
