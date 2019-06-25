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

function getFilePath(name) {
  const dir1 = name.slice(0, 2)
  const dir2 = name.slice(2, 4)
  return path.join(fileDir, dir1, dir2, name)
}

exports.getFilePath = getFilePath

function getPublicURL(name) {
  const dir1 = name.slice(0, 2)
  const dir2 = name.slice(2, 4)
  return path.posix.join(filePublicBaseURL, dir1, dir2, name)
}

exports.getPublicURL = getPublicURL

async function readFile(name) {
  const filepath = getFilePath(name)
  return fsReadFileAsync(filepath)
}

exports.readFile = readFile

async function writeFile(name, data) {
  const filepath = getFilePath(name)
  await mkdirpAsync(path.dirname(filepath))
  await fsWriteFileAsync(filepath, data)
}

exports.writeFile = writeFile

async function deleteFile(name) {
  const filepath = getFilePath(name)
  await fsUnlinkAsync(filepath)
}

exports.deleteFile = deleteFile

async function getFileReadStream(name) {
  const filepath = getFilePath(name)
  return fs.createReadStream(filepath)
}

exports.getFileReadStream = getFileReadStream

async function getFileWriteStream(name) {
  const filepath = getFilePath(name)
  await mkdirpAsync(path.dirname(filepath))
  return fs.createWriteStream(filepath)
}

exports.getFileWriteStream = getFileWriteStream
