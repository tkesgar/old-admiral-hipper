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
const {getInfoGroupKeys, getInfoGroupFromKey, GROUPS} = require('../utils/chara-info')
const {
  MAX_CHARA_INFO_PER_CHARA,
  MAX_CHARA_FILE_PER_CHARA,
  MAX_CHARA_PER_USER
} = require('../config/limits')

exports.findAllByUser = async user => {
  return (await Chara.findAllByUser(user.id)).map(chara => ({
    id: chara.id,
    name: chara.name,
    bio: chara.bio
  }))
}

exports.insertChara = async (user, name, bio = null, info = null) => {
  const countChara = await Chara.countAllByUser(user.id)
  if (countChara === MAX_CHARA_PER_USER) {
    throw new AppError('Limit reached', 'LIMIT')
  }

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

exports.updateCharaName = async (chara, newName) => {
  await purify(newName, 'name')

  await chara.setName(newName)
}

exports.updateCharaBio = async (chara, newBio) => {
  await purify(newBio, 'bio')

  await chara.setBio(newBio)
}

exports.deleteCharaBio = async chara => {
  await chara.setBio(null)
}

exports.deleteChara = async chara => {
  await db.transaction(async trx => {
    chara.setConnection(trx)

    const files = await File.findAll(function () {
      this.whereIn('id', function () {
        this.select('file_id')
          .from('chara_file')
          .where('chara_id', chara.id)
      })
    }, trx)

    await File.deleteMany(files.map(file => file.id), trx)

    await chara.delete()

    await Promise.all(files.map(file => new FileIO(file).delete()))

    chara.setConnection(null)
  })
}

exports.findAllCharaInfo = async (chara, keys = null) => {
  return (await CharaInfo.findAllByChara(chara.id, keys))
    .reduce((manyCharaInfo, {key, value}) => {
      manyCharaInfo[key] = value
      return manyCharaInfo
    }, {})
}

exports.insertInfo = async (chara, key, value) => {
  // TODO Insert info yang sudah ada seharusnya tidak 500 (catch error pas insert)
  const countCharaInfo = await CharaInfo.countAllByChara(chara.id)
  if (countCharaInfo === MAX_CHARA_INFO_PER_CHARA) {
    throw new AppError('Limit reached', 'LIMIT')
  }

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

  const infoGroupName = getInfoGroupFromKey(charaInfo.key)
  if (infoGroupName) {
    const manyInfo = await CharaInfo.findAllByChara(charaInfo.charaId)
    const subManyGroupInfo = {}

    for (const key of GROUPS[infoGroupName].keys) {
      const findCharaInfo = manyInfo.find(info => info.key === key)
      if (!findCharaInfo) {
        throw new Error(`Chara does not have info ${key} for group ${infoGroupName}`)
      }

      subManyGroupInfo[findCharaInfo.key] = findCharaInfo.value
    }

    await purify(subManyGroupInfo, 'chara-info-entries')
  }

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
  const countCharaFile = await CharaFile.countAllByChara(chara.id)
  if (countCharaFile === MAX_CHARA_FILE_PER_CHARA) {
    throw new AppError('Limit reached', 'LIMIT')
  }

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

      // Delete old file then get new hash
      await new FileIO(file).delete()

      await file.setRand()
      await file.setExt(ext)

      await new FileIO(file).write(imageBuffer)

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

exports.findAllLikedByUser = async user => {
  return (await Chara.findAll(function () {
    this.whereIn('id', function () {
      this.from('chara_like')
        .where('user_id', user.id)
        .select('chara_id')
    })
  }))
    .map(chara => ({
      id: chara.id,
      name: chara.name
    }))
}

const CharaLike = require('../models/chara-like')

exports.getCharaLikeData = async (chara, user = null) => {
  const data = {}

  data.count = await CharaLike.countAllByChara(chara.id)

  if (user) {
    data.isUserLike = Boolean(await CharaLike.findByCharaUser(chara.id, user.id))
  }

  // TODO Tambahin users: daftar user yang nge-like siapa aja.

  return data
}

exports.setCharaLike = async (chara, user) => {
  try {
    await CharaLike.insert({
      charaId: chara.id,
      userId: user.id
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('chara_like_chara_id_user_id_unique')) {
      return
    }

    throw error
  }
}

exports.setCharaUnlike = async (chara, user) => {
  const charaLike = await CharaLike.findByCharaUser(chara.id, user.id)
  if (!charaLike) {
    return
  }

  await charaLike.delete()
}
