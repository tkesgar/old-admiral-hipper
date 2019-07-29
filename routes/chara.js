const {default: ow} = require('ow')
const multer = require('multer')
const {Router: router} = require('express')
const CharaController = require('../controllers/chara')
const checkUser = require('../utils/middlewares/check-user')
const handle = require('../utils/middlewares/handle')

function checkCharaOwner() {
  return checkUser((user, req) => req.chara.userId === req.user.id)
}

function checkNotCharaOwner() {
  return checkUser((user, req) => req.chara.userId !== req.user.id)
}

const upload = multer({storage: multer.memoryStorage()})

const route = router()

// TODO Implementasi lookup chara
route.get('/chara', handle(501))

route.post('/chara',
  checkUser(),
  handle(async (req, res) => {
    const {user, body: {name, bio, info}} = req

    const charaId = await CharaController.insertChara(user, name, bio, info)

    res.status(201)
      .location(`/chara/${charaId}`)
      .json({id: charaId})
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
route.put('/chara/:charaId/name',
  checkCharaOwner(),
  handle(async req => {
    const {chara, body} = req
    ow(body, ow.object.partialShape({
      name: ow.string
    }))

    await CharaController.updateCharaName(chara, body.name)
  })
)

// TODO Implementasi update bio
route.put('/chara/:charaId/bio',
  checkCharaOwner(),
  handle(async req => {
    const {chara, body} = req
    ow(body, ow.object.partialShape({
      bio: ow.object
    }))

    await CharaController.updateCharaBio(chara, body.bio)
  })
)

route.delete('/chara/:charaId/bio',
  checkCharaOwner(),
  handle(async req => {
    const {chara} = req

    await CharaController.deleteCharaBio(chara)
  })
)

// TODO Implementasi delete bio
route.delete('/chara/:charaId/bio', handle(501))

route.get('/chara/:charaId/info', handle(async req => {
  const {chara, query: {key}} = req

  const keys = key ? (Array.isArray(key) ? key : [key]) : null
  return CharaController.findAllCharaInfo(chara, keys)
}))

route.post('/chara/:charaId/info',
  checkCharaOwner(),
  handle(async req => {
    const {chara, body: {info}} = req

    await CharaController.insertManyInfo(chara, info)
  })
)

route.delete('/chara/:charaId/info',
  checkCharaOwner(),
  handle(async req => {
    const {chara, body: {keys}} = req

    if (!keys) {
      await CharaController.deleteAllInfo(chara)
      return
    }

    await CharaController.deleteManyInfo(chara, keys)
  })
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

  return CharaController.findAllImage(chara)
}))

route.post('/chara/:charaId/image',
  checkCharaOwner(),
  upload.single('image'),
  handle(async req => {
    const {chara, file: {buffer}, body: {type}} = req

    await CharaController.insertImage(chara, type, buffer)
  })
)

route.use('/chara/:charaId/image/:imageType', handle(async (req, res) => {
  const {chara, params: {imageType}} = req

  const image = await CharaController.findImage(chara, imageType)
  if (!image) {
    res.sendStatus(404)
    return
  }

  req.image = image
}, true))

// Belum tahu mau diisi apa
route.get('/chara/:charaId/image/:imageType', (req, res) => {
  const {image} = req

  res.json(CharaController.getImageData(image))
})

route.put('/chara/:charaId/image/:imageType',
  checkCharaOwner(),
  upload.single('image'),
  handle(async req => {
    // TODO Destructuring file begini yang lain dicheck dulu biar nggak server oops
    const {image, file} = req
    ow(file, ow.object.partialShape({
      buffer: ow.object.instanceOf(Buffer)
    }))

    await CharaController.updateImage(image, file.buffer)
  })
)

route.delete('/chara/:charaId/image/:imageType',
  checkCharaOwner(),
  handle(async req => {
    const {image} = req

    await CharaController.deleteImage(image)
  })
)

route.get('/chara/:charaId/like',
  handle(async req => {
    const {chara, user} = req

    return CharaController.getCharaLikeData(chara, user)
  })
)

route.post('/chara/:charaId/like',
  checkNotCharaOwner(),
  handle(async req => {
    const {user, chara} = req

    return CharaController.setCharaLike(chara, user)
  })
)

route.delete('/chara/:charaId/like',
  checkNotCharaOwner(),
  handle(async req => {
    const {user, chara} = req

    return CharaController.setCharaUnlike(chara, user)
  })
)

module.exports = route
