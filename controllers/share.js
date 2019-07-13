const Chara = require('../models/chara')
const CharaFile = require('../models/chara-file')
const File = require('../models/file')
const CharaInfo = require('../models/chara-info')
const FileIO = require('../services/file-io')

const PLACEHOLDER_PROFILE_URL = `${process.env.ASSETS_BASE_URL}/placeholder-portrait.jpg`

exports.getViewLocals = async charaId => {
  const chara = await Chara.findById(charaId)
  const charaInfoSet = await CharaInfo.findAllByChara(charaId)
  const profileImage = await CharaFile.findByCharaKey(charaId, 'profile')

  const charaInfoFullName = charaInfoSet.find(charaInfo => charaInfo.key === 'full_name')
  const charaInfoNickName = charaInfoSet.find(charaInfo => charaInfo.key === 'nick_name')
  const charaInfoJpName = charaInfoSet.find(charaInfo => charaInfo.key === 'jp_name')
  const displayName = charaInfoFullName ? charaInfoFullName.value : (
    charaInfoNickName ? charaInfoNickName.value : (
      charaInfoJpName ? charaInfoJpName.value : chara.name
    )
  )

  const title = displayName + (charaInfoJpName ? ` (${charaInfoJpName.value})` : '')

  const description = `Biodata dan profil untuk ${displayName}`

  const url = `${process.env.APP_BASE_URL}/chara/${charaId}`

  let imageUrl = PLACEHOLDER_PROFILE_URL
  if (profileImage) {
    const file = await File.findById(profileImage.fileId)
    imageUrl = new FileIO(file).publicURL
  }

  return {title, description, url, imageUrl}
}
