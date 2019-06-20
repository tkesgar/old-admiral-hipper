const Chara = require('../models/chara')
const CharaInfo = require('../models/chara-info')
const log = require('../services/log')
const v = require('../utils/validate')
const {transaction} = require('../services/database')

exports.find = async key => {
  return (await Chara.findById(key)) || (await Chara.findByName(key)) || null
}

exports.findAllByUser = async user => {
  return Chara.findAllByUser(user.id)
}

exports.insert = async (userId, name, bio = null, entries = null) => {
  v.validateName(name)
  v.validateBio(bio)

  if (entries) {
    v.validateCharaInfoEntries(entries)
  }

  await transaction(async trx => {
    const charaId = await Chara.insert({userId, name, bio}, trx)

    if (entries) {
      await CharaInfo.insertMany(entries.map(entry => {
        const {key, value} = entry
        return {
          charaId,
          key,
          value
        }
      }))
    }
  })
}

exports.delete = async chara => {
  await chara.delete()
  log.debug({chara}, 'Chara deleted')
}
