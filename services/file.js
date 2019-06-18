const fs = require('fs')
const path = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const {fileDir, filePublicUrl} = require('../config/env')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

async function mkdirpAsync(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, undefined, err => err ? reject(err) : resolve())
  })
}

class FileIO {
  constructor(filename) {
    this.filename = filename
  }

  get dirSegments() {
    const [dir1, dir2, dir3] = this.filename.match(/.{3}/g)
    return [dir1, dir2, dir3]
  }

  get publicURL() {
    return path.posix.join(filePublicUrl, ...this.dirSegments, this.filename)
  }

  get filepath() {
    return path.join(fileDir, ...this.dirSegments, this.filename)
  }

  async createDirs() {
    await mkdirpAsync(path.join(fileDir, ...this.dirSegments))
  }

  async read() {
    return readFileAsync(this.filepath)
  }

  async write(buffer) {
    await this.createDirs()
    return writeFileAsync(this.filepath, buffer)
  }
}

module.exports = FileIO
