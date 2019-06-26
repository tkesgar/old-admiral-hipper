const {Router: router} = require('express')
const multer = require('multer')
const CharaController = require('../controllers/chara')
const handle = require('../lib/handle')
const checkAuth = require('../middlewares/check-auth')

function checkCharaOwner() {
  return checkAuth((user, req) => req.chara.userId === req.user.id)
}

const upload = multer({storage: multer.memoryStorage()})

const route = router()

// TODO Implementasi lookup chara
route.get('/chara', handle(501))

route.post('/chara',
  checkAuth(),
  handle(async req => {
    const {user, body: {name, bio, info}} = req

    await CharaController.insertChara(user, name, bio, info)
  })
)

route.use('/chara/:charaId', handle(async (req, res) => {
  const {params: {charaId}} = req

  const chara = await CharaController.findCharaById(charaId)
  if (!chara) {
    res.sendStatus(404)
    return
  }

  req.chara = chara
}, true))

route.get('/chara/:charaId', (req, res) => {
  const {chara} = req

  res.json(CharaController.getCharaData(chara))
})

route.delete('/chara/:charaId',
  checkCharaOwner(),
  handle(async req => {
    const {chara} = req

    await CharaController.deleteChara(chara)
  })
)

// TODO Implementasi update name
route.put('/chara/:charaId/name', handle(501))

// TODO Implementasi update bio
route.put('/chara/:charaId/bio', handle(501))

// TODO Implementasi delete bio
route.delete('/chara/:charaId/bio', handle(501))

route.get('/chara/:charaId/info', handle(async req => {
  const {chara} = req

  return CharaController.findAllCharaInfo(chara)
}))

route.post('/chara/:charaId/info',
  checkCharaOwner(),
  handle(async req => {
    const {chara, body: {key, value}} = req

    await CharaController.insertInfo(chara, key, value)
  })
)

route.put('/chara/:charaId/info',
  checkCharaOwner(),
  // TODO Implementasi replace banyak chara info
  handle(501)
)

route.delete('/chara/:charaId/info',
  checkCharaOwner(),
  // TODO Implementasi delete semua chara info
  handle(501)
)

route.use('/chara/:charaId/info/:infoKey', handle(async (req, res) => {
  const {chara, params: {infoKey}} = req

  const charaInfo = await CharaController.findInfo(chara, infoKey)
  if (!charaInfo) {
    res.sendStatus(404)
    return
  }

  req.charaInfo = charaInfo
}, true))

route.get('/chara/:charaId/info/:infoKey', (req, res) => {
  const {charaInfo} = req

  res.json(CharaController.getCharaInfoData(charaInfo))
})

route.put('/chara/:charaId/info/:infoKey',
  checkCharaOwner(),
  handle(async req => {
    const {charaInfo, body: {value}} = req

    await CharaController.updateInfo(charaInfo, value)
  })
)

route.delete('/chara/:charaId/info/:infoKey',
  checkCharaOwner(),
  handle(async req => {
    const {charaInfo} = req

    await CharaController.deleteInfo(charaInfo)
  })
)

route.get('/chara/:charaId/image', handle(async req => {
  const {chara} = req

  return CharaController.findAllCharaImage(chara)
}))

route.post('/chara/:charaId/image',
  checkCharaOwner(),
  upload.single('image'),
  async req => {
    const {chara, file: {buffer}, body: {key}} = req

    await CharaController.insertImage(chara, key, buffer)
  }
)

route.use('/chara/:charaId/image/:imageKey', handle(async (req, res) => {
  const {chara, params: {imageKey}} = req

  const charaImage = await CharaController.findImage(chara, imageKey)
  if (!charaImage) {
    res.sendStatus(404)
    return
  }

  req.charaImage = charaImage
}, true))

route.get('/chara/:charaId/image/:imageKey', (req, res) => {
  const {charaImage} = req

  res.json(CharaController.getImageData(charaImage))
})

route.get('/chara/:charaId/image/:imageKey/url', (req, res) => {
  const {charaImage} = req

  res.redirect(CharaController.getImageURL(charaImage))
})

route.put('/chara/:charaId/image/:fileKey',
  checkCharaOwner(),
  upload.single('image'),
  handle(async req => {
    const {charaImage, file: {buffer}} = req

    await CharaController.updateImage(charaImage, buffer)
  })
)

route.delete('/chara/:charaId/image/:fileKey',
  checkCharaOwner(),
  handle(async req => {
    const {charaImage} = req

    await CharaController.deleteImage(charaImage)
  })
)

module.exports = route
