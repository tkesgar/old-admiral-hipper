const {Router: router} = require('express')
const {default: ow} = require('ow')
const multer = require('multer')
const Chara = require('../controllers/chara')
const CharaInfo = require('../controllers/chara-info')
const CharaImage = require('../controllers/chara-image')
const handle = require('../lib/handle')
const checkAuth = require('../middlewares/check-auth')

const upload = multer({storage: multer.memoryStorage()})

const route = router()

// TODO Implementasi lookup chara
route.get('/chara', (req, res) => res.sendStatus(501))

route.post('/chara',
  checkAuth(),
  handle(async (req, res) => {
    const {user, body: {name, bio, entries}} = req
    ow(name, ow.string)
    ow(bio, ow.optional.string)
    ow(entries, ow.optional.array.ofType(ow.object.exactShape({
      key: ow.string,
      value: ow.any(ow.string, ow.number.integer)
    })))

    // TODO Semua endpoint POST harus me-return 201 dengan header Location
    const charaId = await Chara.insert(user.id, name, bio, entries)
    res.status(201).send(`/chara/${charaId}`)
  })
)

route.use('/chara/:key', handle(async (req, res) => {
  const {key} = req.params

  const chara = await Chara.find(key)
  if (!chara) {
    res.sendStatus(404)
    return
  }

  req.chara = chara
}, true))

route.get('/chara/:key', (req, res) => {
  res.json(req.chara)
})

route.delete('/chara/:key',
  _mustBeCharaOwner(),
  handle(async req => {
    const {chara} = req
    await Chara.delete(chara)
  })
)

// TODO Implementasi update name
route.put('/chara/:key/name', (req, res) => res.sendStatus(501))

// TODO Implementasi update bio
route.put('/chara/:key/bio', (req, res) => res.sendStatus(501))

// TODO Implementasi delete bio
route.delete('/chara/:key/bio', (req, res) => res.sendStatus(501))

route.get('/chara/:key/info', handle(async req => {
  const {chara} = req
  return CharaInfo.findAll(chara)
}))

route.post('/chara/:key/info',
  _mustBeCharaOwner(),
  handle(async req => {
    const {chara, body: {key, value}} = req
    ow(key, ow.string)
    ow(value, ow.any(ow.string, ow.number.integer))

    await CharaInfo.insert(chara, key, value)
  })
)

route.put('/chara/:key/info',
  _mustBeCharaOwner(),
  // TODO Implementasi update banyak chara info
  (req, res) => res.sendStatus(501)
)

route.delete('/chara/:key/info',
  _mustBeCharaOwner(),
  // TODO Implementasi delete semua chara info
  (req, res) => res.sendStatus(501)
)

route.use('/chara/:key/info/:infoKey', handle(async (req, res) => {
  const {chara, params: {infoKey: key}} = req

  const charaInfo = await Chara.findInfo(chara, key)
  if (!charaInfo) {
    res.sendStatus(404)
    return
  }

  req.charaInfo = charaInfo
}, true))

route.get('/chara/:key/info/:infoKey', (req, res) => {
  const {charaInfo} = req
  res.json(charaInfo)
})

route.put('/chara/:key/info/:infoKey',
  _mustBeCharaOwner(),
  handle(async req => {
    const {charaInfo, body: {value}} = req
    ow(value, ow.any(ow.string, ow.number.integer))

    await CharaInfo.update(charaInfo, value)
  })
)

route.delete('/chara/:key/info/:infoKey',
  _mustBeCharaOwner(),
  handle(async req => {
    const {charaInfo} = req
    await CharaInfo.delete(charaInfo)
  })
)

route.get('/chara/:key/image', handle(async req => {
  const {chara} = req
  return CharaImage.findAll(chara)
}))

route.post('/chara/:key/image',
  _mustBeCharaOwner(),
  upload.single('image'),
  async req => {
    const {user, chara, file: {buffer}, body: {key}} = req
    await CharaImage.insert(user, chara, key, buffer)
  }
)

route.use('/chara/:key/image/:fileKey', handle(async (req, res) => {
  const {chara, params: {fileKey: key}} = req

  const charaImage = await CharaImage.find(chara, key)
  if (!charaImage) {
    res.sendStatus(404)
    return
  }

  req.charaImage = charaImage
}, true))

route.get('/chara/:key/image/:fileKey', handle(async (req, res) => {
  const {charaImage} = req

  const url = await CharaImage.get(charaImage)
  res.redirect(url)
}))

route.put('/chara/:key/image/:fileKey',
  _mustBeCharaOwner(),
  upload.single('image'),
  handle(async req => {
    const {charaImage, file: {buffer}} = req
    await CharaImage.update(charaImage, buffer)
  })
)

route.delete('/chara/:key/image/:fileKey',
  _mustBeCharaOwner(),
  handle(async req => {
    const {charaImage} = req
    await CharaImage.delete(charaImage)
  })
)

module.exports = route

function _mustBeCharaOwner() {
  return checkAuth((user, req) => req.chara.userId === req.user.id)
}
