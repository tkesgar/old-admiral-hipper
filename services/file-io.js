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
  constructor(file) {
    this.file = file
    this._writeReady = false
  }

  get dirs() {
    return this.file.rand.match(/.{1,3}/g).slice(0, 2)
  }

  get filePath() {
    const [dir1, dir2] = this.dirs
    return path.join(fileDir, dir1, dir2, this.file.name)
  }

  get publicURL() {
    const [dir1, dir2] = this.dirs
    return path.posix.join(filePublicBaseURL, dir1, dir2, this.file.name)
  }

  async read() {
    return fsReadFileAsync(this.filePath)
  }

  async write(data) {
    await this.prepareWrite()
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
      throw new Error('Not ready to write; call prepareWrite() first')
    }

    return fs.createWriteStream(this.filePath)
  }
}

module.exports = FileIO
