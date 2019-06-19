const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const mime = require('mime-types')
const {fileDir, filePublicUrl} = require('../config/env')
const db = require('../services/database')
const File = require('../models/file')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

async function mkdirpAsync(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, undefined, err => err ? reject(err) : resolve())
  })
}

class FileIO {
  constructor(ext = null) {
    this.id = _generateRandomId()
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

  async remove() {
    return unlinkAsync(this.filepath)
  }
}

exports.FileIO = FileIO

class FileIOStorage {
  _handleFile(req, file, cb) {
    db.transaction(async trx => {
      const ext = mime.extension(file.mimetype)
      const fileIO = new FileIO(ext)

      await File.insertTransaction({
        userId: req.user.id,
        name: fileIO.id,
        ext
      }, trx)

      await mkdirpAsync(path.dirname(fileIO.filepath))
      await new Promise((resolve, reject) => {
        const ostream = fs.createWriteStream(fileIO.filepath)
        file.stream.pipe(ostream)
        ostream.on('error', reject)
        ostream.on('finish', resolve)
      })

      cb(null, {fileIO})
    }).catch(cb)
  }

  _removeFile(req, file, cb) {
    (async () => {
      const {fileIO} = file

      await fileIO.remove()

      delete file.fileIO
    })().catch(cb)
  }
}

exports.FileIOStorage = FileIOStorage

function _generateRandomId() {
  const dirs = crypto.randomBytes(2).toString('hex')
  const rand = crypto.randomBytes(14).toString('hex')
  const ts = Date.now().toString(16)

  return [dirs, ts, rand].join('').slice(0, 32)
}
