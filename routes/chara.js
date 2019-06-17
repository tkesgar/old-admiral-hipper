const {Router: router} = require('express')
const {default: ow} = require('ow')
const Chara = require('../controllers/chara')
const handle = require('../lib/handle')
const checkAuth = require('../middlewares/check-auth')

const route = router()

route.get('/chara', (req, res) => {
  // TODO Implementasi lookup chara
  res.sendStatus(501)
})

route.post('/chara',
  checkAuth(),
  handle(async req => {
    const {user, body: {name, bio}} = req
    ow(name, ow.string)
    ow(name, ow.any(ow.nullOrUndefined, ow.string))

    await Chara.insert(user.id, name, bio)
  })
)

route.use('/chara/:key', handle(async (req, res) => {
  const {key} = req.params

  const chara = await Chara.findByKey(key)
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

// TODO Implementasi CharaInfo.updateManyInfo (update banyak key untuk chara_id tertentu)
// TODO Implementasi CharaInfo.deleteManyInfo (delete banyak key untuk chara_id tertentu)

route.get('/chara/:key/info', handle(async req => {
  const {chara} = req
  return Chara.findAllInfo(chara.id)
}))

route.post('/chara/:key/info',
  _mustBeCharaOwner(),
  handle(async req => {
    const {chara, body: {entries}} = req
    await Chara.insertManyInfo(chara, entries)
  })
)

route.put('/chara/:key/info',
  _mustBeCharaOwner(),
  // Endpoint untuk CharaInfo.updateManyInfo
  (req, res) => res.sendStatus(501)
)

route.delete('/chara/:key/info',
  _mustBeCharaOwner(),
  // Endpoint untuk CharaInfo.deleteAllCharaInfo
  (req, res) => res.sendStatus(501)
)

route.use('/chara/:key/info/:infoKey', handle(async (req, res) => {
  const {chara, params: {infoKey: key}} = req

  const charaInfo = await Chara.findInfoByCharaKey(chara, key)
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

route.put('/chara/:key/info/:infoKey', handle(async req => {
  const {charaInfo, body: {value}} = req

  await Chara.updateInfo(charaInfo, value)
}))

route.delete('/chara/:key/info/:infoKey', handle(async req => {
  const {charaInfo} = req

  await Chara.deleteInfo(charaInfo)
}))

module.exports = route

function _mustBeCharaOwner() {
  return checkAuth((user, req) => req.chara.userId === req.user.id)
}
