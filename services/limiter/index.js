const {limits} = require('../../utils/config')
const CharaModel = require('../../models/chara')
const CharaInfoModel = require('../../models/chara-info')
const CharaFileModel = require('../../models/chara-file')
const {FailError} = require('../../utils/error')

class LimitError extends FailError {
  constructor(name, current, limit) {
    super('LIMIT', {
      message: `Limit reached for: ${name}`,
      data: {current, limit}
    })
  }
}

class LimiterService {
  static async limitMaxCharaPerUser(userId, increment = 1) {
    const count = await CharaModel.countAllByUser(userId)
    const limit = limits.maxCharaPerUser
    if (count + increment > limit) {
      throw new LimitError('Maximum chara per user', count, limit)
    }
  }

  static async limitMaxInfoPerChara(charaId, increment = 1) {
    const count = await CharaInfoModel.countAllByChara(charaId)
    const limit = limits.maxInfoPerChara
    if (count + increment > limit) {
      throw new LimitError('Maximum info per chara', count, limit)
    }
  }

  static async limitMaxFilePerChara(charaId, increment = 1) {
    const count = await CharaFileModel.countAllByChara(charaId)
    const limit = limits.maxInfoPerChara
    if (count + increment > limit) {
      throw new LimitError('Maximum file per chara', count, limit)
    }
  }
}

module.exports = LimiterService
