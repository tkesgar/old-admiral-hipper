const Chara = require('../models/chara')
const CharaInfo = require('../models/chara-info')
const CharaFile = require('../models/chara-file')
const File = require('../models/file')
const db = require('../services/database')
const {purify} = require('../services/purify')
const {AppError} = require('../utils/error')
const FileIO = require('../services/file-io')
const {getFileExt, processImage} = require('../services/image')
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

exports.findAllCharaImage = async chara => {
  const charaFiles = await CharaFile.findAllByChara(chara.id)

  const filesDict = (await File.findAll(function () {
    this.whereIn('id', charaFiles.map(charaFile => charaFile.fileId))
  })).reduce((dict, file) => {
    dict[file.id] = file
    return dict
  }, {})

  return charaFiles.reduce((dict, charaFile) => {
    const file = filesDict[charaFile.fileId]

    dict[charaFile.key] = {
      url: new FileIO(String(file.id), file.ext).publicURL
    }

    return dict
  }, {})
}

exports.insertImage = async (chara, key, buffer) => {
  await purify(key, 'chara-image-key')

  return db.transaction(async trx => {
    const {data, ext} = await processImage(buffer, key)

    const fileId = await File.insert({
      userId: chara.userId,
      ext
    })

    await CharaFile.insert({
      charaId: chara.id,
      key,
      fileId
    }, trx)

    await new FileIO(String(fileId), ext).write(data)
  })
}

exports.findImage = async (chara, fileKey) => {
  return CharaFile.findByCharaKey(chara.id, fileKey)
}

exports.getImageData = charaFile => {
  const ext = getFileExt(charaFile.key)
  const fileIO = new FileIO(String(charaFile.fileId), ext)

  return {
    url: fileIO.publicURL
  }
}

exports.getImageURL = charaFile => {
  const ext = getFileExt(charaFile.key)
  return new FileIO(String(charaFile.fileId), ext).publicURL
}

exports.updateImage = async (charaFile, buffer) => {
  const {data, ext} = await processImage(buffer, charaFile.key)

  const fileIO = new FileIO(String(charaFile.fileId), ext)
  await fileIO.write(data)
}

exports.deleteImage = async charaFile => {
  await db.transaction(async trx => {
    const file = await File.findById(charaFile.fileId, trx)
    await file.delete()

    const fileIO = new FileIO(String(charaFile.fileId), file.ext)
    await fileIO.delete()
  })
}

/* =
exports.find = async key => {
  return (await Chara.findById(key)) || (await Chara.findByName(key)) || null
}

exports.findAllByUser = async user => {
  return (await Chara.findAllByUser(user.id)).map(chara => chara.getData({bio: false}))
}

exports.insert = async (userId, name, bio = null, entries = null) => {
  v.validateName(name)
  v.validateBio(bio)
  if (entries) {
    v.validateCharaInfoEntries(entries)
  }

  return db.transaction(async trx => {
    const charaId = await Chara.insert({userId, name, bio}, trx)

    if (entries) {
      await CharaInfo.insertMany(entries.map(entry => {
        const {key, value} = entry
        return {
          charaId,
          key,
          value
        }
      }), trx)
    }

    return charaId
  })
}

exports.delete = async chara => {
  await chara.delete()
  log.debug({chara}, 'Chara deleted')
}
*/
