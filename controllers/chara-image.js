const CharaFile = require('../models/chara-file')
const File = require('../models/file')
const FileIO = require('../services/file-io')
const processImage = require('../services/process-image')
const {transaction} = require('../services/database')
const v = require('../utils/validate')

exports.find = async (chara, key) => {
  return CharaFile.findByCharaKey(chara.id, key)
}

exports.findAll = async chara => {
  const charaFiles = await CharaFile.findAllByChara(chara.id)
  const files = await File.findAllByIds(charaFiles.map(charaFile => charaFile.fileId))

  return charaFiles.map(charaFile => {
    const file = files.find(file => file.id === charaFile.fileId)

    return {
      key: charaFile.key,
      url: new FileIO(file.ext, file.name).publicURL
    }
  })
}

exports.insert = async (user, chara, key, buffer) => {
  v.validateCharaFileKey(key)

  return transaction(async trx => {
    const ext = _getExt(key)
    const fileIO = new FileIO(ext)

    const fileId = await File.insert({
      userId: user.id,
      name: fileIO.id,
      ext
    }, trx)

    const charaFileId = await CharaFile.insert({
      charaId: chara.id,
      key,
      fileId
    })

    const imgBuffer = await processImage(buffer, key).toBuffer()
    await fileIO.write(imgBuffer)

    return charaFileId
  })
}

exports.get = async charaFile => {
  const file = await File.findById(charaFile.fileId)
  const fileIO = new FileIO(file.ext, file.name)

  return fileIO.publicURL
}

exports.update = async (charaFile, imgBuffer) => {
  await transaction(async trx => {
    const file = await File.findById(charaFile.fileId, trx)
    const fileIO = new FileIO(file.ext, file.name)

    const newImgBuffer = await processImage(imgBuffer, charaFile.key).toBuffer()

    await file.touch()
    await fileIO.write(newImgBuffer)
  })
}

exports.delete = async charaFile => {
  await transaction(async trx => {
    const file = await File.findById(charaFile.fileId, trx)
    const fileIO = new FileIO(file.ext, file.name)

    await file.delete()
    await fileIO.delete()
  })
}

function _getExt(type) {
  switch (type) {
    case 'avatar':
    case 'portrait':
      return 'jpeg'
    case 'fullbody':
      return 'png'
    default:
      throw new Error(`Unknown image type: ${type}`)
  }
}
