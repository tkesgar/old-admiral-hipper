const {default: ow} = require('ow')
const Chara = require('../models/chara')
const v = require('../utils/validate')

exports.create = async (userId, name, bio) => {
  v.validateName(name)
  v.validate(
    bio,
    ow.any(ow.null, ow.string.minLength(1).maxLength(65535)),
    'Biodata exceeds length',
    'BIO_NOT_ALLOWED'
  )

  await Chara.insert({userId, name, bio})
}

exports.findByKey = async key => {
  const charaById = await Chara.findById(key)
  if (charaById) {
    return charaById
  }

  return Chara.findByName(key)
}

exports.remove = async chara => {
  await chara.delete()
}
