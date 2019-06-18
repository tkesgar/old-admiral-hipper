const {Router: router} = require('express')
const {default: ow} = require('ow')
const Chara = require('../controllers/chara')
const CharaInfo = require('../controllers/chara-info')
const handle = require('../lib/handle')
const checkAuth = require('../middlewares/check-auth')

const route = router()

// TODO Implementasi lookup chara
route.get('/chara', (req, res) => res.sendStatus(501))

route.post('/chara',
  checkAuth(),
  handle(async req => {
    const {user, body: {name, bio, entries}} = req
    ow(name, ow.string)
    ow(bio, ow.optional.string)
    ow(entries, ow.optional.array.ofType(ow.object.exactShape({
      key: ow.string,
      value: ow.any(ow.string, ow.number.integer)
    })))

    await Chara.insert(user.id, name, bio, entries)
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
  return CharaInfo.findAll(chara.id)
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

module.exports = route

function _mustBeCharaOwner() {
  return checkAuth((user, req) => req.chara.userId === req.user.id)
}
