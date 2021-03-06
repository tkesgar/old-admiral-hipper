const sharp = require('sharp')
const Chara = require('../models/chara')
const CharaInfo = require('../models/chara-info')
const CharaFile = require('../models/chara-file')
const File = require('../models/file')
const db = require('../utils/db')
const GuardianService = require('../services/guardian')
const err = require('../utils/error')
const FileIO = require('../services/legacy-file-io')
const {convert} = require('../services/legacy-image')
const {getInfoGroupKeys, getInfoGroupFromKey, GROUPS} = require('../utils/legacy-chara-info')
const LimiterService = require('../services/limiter')

exports.findAllByUser = async user => {
  return (await Chara.findAllByUser(user.id)).map(chara => ({
    id: chara.id,
    name: chara.name,
    bio: chara.bio
  }))
}

exports.insertChara = async (user, name, bio = null, info = null) => {
  await LimiterService.limitMaxCharaPerUser(user.id)

  await GuardianService.validate('name', name)

  const bioSanitized = bio ? await GuardianService.sanitize('bio', bio) : null

  if (info) {
    await GuardianService.validateMany(
      ...Object.entries(info)
        .map(([key, value]) => (['chara-info', {key, value}]))
    )

    await GuardianService.validate('chara-info-entries', info)
  }

  try {
    const charaId = await db.transaction(async trx => {
      const charaId = await Chara.insert({
        userId: user.id,
        name,
        bio: bioSanitized
      }, trx)

      if (info) {
        await CharaInfo.insertMany(
          Object.entries(info)
            .map(([key, value]) => ({charaId, key, value})),
          trx
        )
      }

      return charaId
    })

    return charaId
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('chara_name_unique')) {
        throw new err.FailError('NAME_EXIST', {
          message: 'Chara name is already used',
          data: {name}
        })
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
  await GuardianService.validate('name', newName)

  await chara.setName(newName)
}

exports.updateCharaBio = async (chara, newBio) => {
  const bioSanitized = await GuardianService.sanitize('bio', newBio)

  await chara.setBio(bioSanitized)
}

exports.deleteCharaBio = async chara => {
  await chara.setBio(null)
}

exports.deleteChara = async chara => {
  await db.transaction(async trx => {
    chara.connection = trx

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

    chara.connection = null
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
  await LimiterService.limitMaxInfoPerChara(chara.id)

  await GuardianService.validate('chara-info', {key, value})

  return CharaInfo.insert({charaId: chara.id, key, value})
}

exports.insertManyInfo = async (chara, manyInfo) => {
  await LimiterService.limitMaxInfoPerChara(chara.id, Object.entries(manyInfo).length)

  await GuardianService.validateMany(
    ...Object.entries(manyInfo)
      .map(([key, value]) => ['chara-info', {key, value}])
  )
  await GuardianService.validate('chara-info-entries', manyInfo)

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
  await GuardianService.validate('chara-info', {key: charaInfo.key, value})

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

    await GuardianService.validate('chara-info-entries', subManyGroupInfo)
  }

  await charaInfo.setValue(value)
}

exports.deleteInfo = async charaInfo => {
  const infoGroup = getInfoGroupKeys(charaInfo.key)
  if (infoGroup) {
    throw new err.FailError('INFO_GROUP', {
      message: 'Info must be removed as group',
      data: {group: infoGroup}
    })
  }

  await charaInfo.delete()
}

exports.deleteManyInfo = async (chara, charaInfoKeys) => {
  await GuardianService.validate('chara-info-keys', charaInfoKeys)

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
  await LimiterService.limitMaxFilePerChara(chara.id)

  await GuardianService.validate('chara-image-type', type)

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
      file.connection = trx

      const {type, variant} = charaFile
      const {ext, buffer: imageBuffer} = await convert(sharpInstance, type, variant)

      // Delete old file then get new hash
      await new FileIO(file).delete()

      await file.setRand()
      await file.setExt(ext)

      await new FileIO(file).write(imageBuffer)

      file.connection = null
    }))
  })
}

exports.deleteImage = async image => {
  await db.transaction(async trx => {
    await Promise.all(Object.values(image).map(async ({file}) => {
      file.connection = trx

      await file.delete()
      new FileIO(file).delete()

      file.connection = null
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
