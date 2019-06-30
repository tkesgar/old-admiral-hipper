const sharp = require('sharp')
const Chara = require('../models/chara')
const CharaInfo = require('../models/chara-info')
const CharaFile = require('../models/chara-file')
const File = require('../models/file')
const db = require('../services/database')
const {purify} = require('../services/purify')
const {AppError} = require('../utils/error')
const FileIO = require('../services/file-io')
const {convert} = require('../services/image')
const {getInfoGroupKeys} = require('../utils/chara-info')

exports.findAllByUser = async user => {
  return (await Chara.findAllByUser(user.id)).map(chara => ({
    id: chara.id,
    name: chara.name,
    bio: chara.bio
  }))
}

exports.insertChara = async (user, name, bio = null, info = null) => {
  await purify(name, 'name')

  if (bio) {
    await purify(bio, 'bio')
  }

  if (info) {
    await Promise.all(Object.entries(info).map(([key, value]) => purify({key, value}, 'chara-info')))
    await purify(info, 'chara-info-entries')
  }

  try {
    const charaId = await db.transaction(async trx => {
      const charaId = await Chara.insert({userId: user.id, name, bio}, trx)

      if (info) {
        const manyData = Object.entries(info)
          .map(([key, value]) => ({charaId, key, value}))

        await CharaInfo.insertMany(manyData, trx)
      }

      return charaId
    })

    return charaId
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('chara_name_unique')) {
        throw new AppError('Chara name is already used', 'NAME_EXIST', {name})
      }
    }
  }
}

exports.findCharaById = async charaId => {
  return Chara.findById(charaId)
}

exports.getCharaData = chara => {
  return {
    id: chara.id,
    userId: chara.userId,
    name: chara.name,
    bio: chara.bio
  }
}

exports.deleteChara = async chara => {
  await chara.delete()
}

exports.findAllCharaInfo = async (chara, keys = null) => {
  return (await CharaInfo.findAllByChara(chara.id, keys))
    .reduce((manyCharaInfo, {key, value}) => {
      manyCharaInfo[key] = value
      return manyCharaInfo
    }, {})
}

exports.insertInfo = async (chara, key, value) => {
  await purify({key, value}, 'chara-info')

  return CharaInfo.insert({charaId: chara.id, key, value})
}

exports.insertManyInfo = async (chara, manyInfo) => {
  await Promise.all(Object.entries(manyInfo).map(([key, value]) => purify({key, value}, 'chara-info')))
  await purify(manyInfo, 'chara-info-entries')

  const manyData = Object.entries(manyInfo)
    .map(([key, value]) => ({charaId: chara.id, key, value}))

  await CharaInfo.insertMany(manyData)
}

exports.findInfo = async (chara, infoKey) => {
  return CharaInfo.findByCharaKey(chara.id, infoKey)
}

exports.getCharaInfoData = charaInfo => {
  return {
    key: charaInfo.key,
    value: charaInfo.value
  }
}

exports.updateInfo = async (charaInfo, value) => {
  await purify({key: charaInfo.key, value}, 'chara-info')

  await charaInfo.setValue(value)
}

exports.deleteInfo = async charaInfo => {
  const infoGroup = getInfoGroupKeys(charaInfo.key)
  if (infoGroup) {
    throw new AppError('Info must be removed as group', 'INFO_GROUP', {group: infoGroup})
  }

  await charaInfo.delete()
}

exports.deleteManyInfo = async (chara, charaInfoKeys) => {
  await purify(charaInfoKeys, 'chara-info-keys')

  await CharaInfo.deleteManyFromChara(chara.id, charaInfoKeys)
}

exports.deleteAllInfo = async chara => {
  await CharaInfo.deleteAllFromChara(chara.id)
}

exports.findAllImage = async chara => {
  const charaFiles = await CharaFile.findAllByChara(chara.id)

  const files = await File.findAll(function () {
    this.whereIn('id', charaFiles.map(charaFile => charaFile.fileId))
  })

  const data = {}

  for (const charaFile of charaFiles) {
    const {key, fileId} = charaFile
    const file = files.find(file => file.id === fileId)

    data[key] = {
      url: new FileIO(file).publicURL
    }
  }

  return data
}

exports.insertImage = async (chara, type, buffer) => {
  await purify(type, 'chara-image-type')

  return db.transaction(async trx => {
    const baseSharpInstance = sharp(buffer)
    const convertInfoSet = [
      [type, null],
      [type, 'sm']
    ]

    // TODO Tampilkan error jika gambar sudah ada (sekarang masih SERVER_OOPS)
    await Promise.all(convertInfoSet.map(async convertInfo => {
      const [type, variant] = convertInfo
      const {ext, buffer: imageBuffer} = await convert(baseSharpInstance, type, variant)

      const fileId = await File.insert({userId: chara.userId, ext}, trx)
      const file = await File.findById(fileId, trx)

      const key = variant ? `${type}.${variant}` : type

      await CharaFile.insert({
        charaId: chara.id,
        key,
        fileId
      }, trx)

      await new FileIO(file).write(imageBuffer)
    }))
  })
}

exports.findImage = async (chara, type) => {
  const charaFiles = await CharaFile.findAllByCharaType(chara.id, type)
  if (charaFiles.length === 0) {
    return null
  }

  const files = await File.findAll(function () {
    this.whereIn('id', charaFiles.map(charaFile => charaFile.fileId))
  })

  const image = {}

  for (const charaFile of charaFiles) {
    const file = files.find(file => file.id === charaFile.fileId)

    image[charaFile.key] = {charaFile, file}
  }

  return image
}

exports.getImageData = image => {
  const data = {}

  for (const [key, {file}] of Object.entries(image)) {
    data[key] = {url: new FileIO(file).publicURL}
  }

  return data
}

exports.updateImage = async (image, buffer) => {
  const sharpInstance = sharp(buffer)

  await db.transaction(async trx => {
    await Promise.all(Object.values(image).map(async ({charaFile, file}) => {
      file.setConnection(trx)

      const {type, variant} = charaFile
      const {ext, buffer: imageBuffer} = await convert(sharpInstance, type, variant)

      await file.setExt(ext)
      new FileIO(file).write(imageBuffer)
      console.log(file.name)

      file.setConnection(null)
    }))
  })
}

exports.deleteImage = async image => {
  await db.transaction(async trx => {
    await Promise.all(Object.values(image).map(async ({file}) => {
      file.setConnection(trx)

      await file.delete()
      new FileIO(file).delete()

      file.setConnection(null)
    }))
  })
}
