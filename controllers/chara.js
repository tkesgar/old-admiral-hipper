const {default: ow} = require('ow')
const Chara = require('../models/chara')
const CharaInfo = require('../models/chara-info')
const log = require('../services/log')
const v = require('../utils/validate')
const db = require('../services/database')

exports.find = async key => {
  return (await Chara.findById(key)) || (await Chara.findByName(key)) || null
}

exports.insert = async (userId, name, bio, entries = null) => {
  v.validateName(name)
  v.validateBio(bio)

  if (entries) {
    entries.forEach(entry => v.validateCharaInfo(entry.key, entry.value))
  }

  const charaId = await db.transaction(async trx => {
    const [id] = await Chara.insert({userId, name, bio}, trx)

    if (entries) {
      await CharaInfo.insertMany({
        entries: entries.map(({key, value}) => ({key, value})),
        charaId: id
      }, trx)
    }

    return id
  })

  return Chara.findById(charaId)
}

exports.delete = async chara => {
  await chara.delete()
  log.debug({chara}, 'Chara deleted')
}

exports.findAllInfo = async chara => {
  return CharaInfo.findAllByChara(chara.id)
}

exports.findInfoById = async id => {
  return CharaInfo.findById(id)
}

exports.findInfoByCharaKey = async (chara, key) => {
  return CharaInfo.findByCharaKey(chara.id, key)
}

exports.insertInfo = async (chara, key, value) => {
  v.validateCharaInfo(key, value)

  const charaInfoId = await CharaInfo.insert({charaId: chara.id, key, value})

  return CharaInfo.findById(charaInfoId)
}

exports.insertManyInfo = async (chara, entries) => {
  ow(entries, ow.array.nonEmpty)

  entries.forEach(entry => v.validateCharaInfo(entry.key, entry.value))

  await CharaInfo.insertMany({
    entries: entries.map(({key, value}) => ({key, value})),
    charaId: chara.id
  })
}

exports.updateInfo = async (charaInfo, value) => {
  v.validateCharaInfo(charaInfo.key, value)

  await charaInfo.setValue(value)
}

exports.deleteInfo = async charaInfo => {
  await charaInfo.delete()
}
