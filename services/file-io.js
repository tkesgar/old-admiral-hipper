const fs = require('fs')
const path = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const {fileDir, filePublicBaseURL} = require('../config/env')

const fsReadFileAsync = util.promisify(fs.readFile)
const fsWriteFileAsync = util.promisify(fs.writeFile)
const fsUnlinkAsync = util.promisify(fs.unlink)

async function mkdirpAsync(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, undefined, err => err ? reject(err) : resolve())
  })
}

class FileIO {
  constructor(id, ext = null) {
    this.id = id
    this.ext = ext
    this._writeReady = false
  }

  get fileName() {
    return this.ext ? `${this.name}.${this.ext}` : this.name
  }

  get filePath() {
    const dir1 = this.name.slice(0, 2)
    const dir2 = this.name.slice(2, 4)
    return path.join(fileDir, dir1, dir2, this.fileName)
  }

  get publicURL() {
    const dir1 = this.name.slice(0, 2)
    const dir2 = this.name.slice(2, 4)
    return path.posix.join(filePublicBaseURL, dir1, dir2, this.fileName)
  }

  async read() {
    return fsReadFileAsync(this.filePath)
  }

  async write(data) {
    if (!this._writeReady) {
      await this.prepareWrite()
    }

    return fsWriteFileAsync(this.filePath, data)
  }

  async delete() {
    await fsUnlinkAsync(this.filePath)
  }

  async prepareWrite() {
    await mkdirpAsync(path.dirname(this.filePath))
    this._writeReady = true
  }

  get readStream() {
    return fs.createReadStream(this.filePath)
  }

  get writeStream() {
    if (!this._writeReady) {
      throw new Error('File stream is not ready; call prepareWrite() first')
    }

    return fs.createWriteStream(this.filePath)
  }
}

module.exports = FileIO
