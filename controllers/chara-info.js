const CharaInfo = require('../models/chara-info')
const v = require('../utils/validate')

exports.find = async (chara, key) => {
  return CharaInfo.findByCharaKey(chara.id, key)
}

exports.findAll = async chara => {
  return CharaInfo.findAllByChara(chara.id)
}

exports.insert = async (chara, key, value) => {
  v.validateCharaInfo(key, value)

  await CharaInfo.insert({
    charaId: chara.id,
    key,
    value
  })
}

exports.update = async (charaInfo, value) => {
  v.validateCharaInfo(charaInfo.key, value)

  await charaInfo.setValue(value)
}

exports.delete = async charaInfo => {
  await charaInfo.delete()
}
