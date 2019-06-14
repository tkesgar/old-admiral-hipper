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

    await Chara.create(user.id, name, bio)
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
  _checkCharaOwner(),
  handle(async req => {
    const {chara} = req
    await Chara.remove(chara)
  })
)

module.exports = route

function _checkCharaOwner() {
  return checkAuth((user, req) => req.chara.userId === req.user.id)
}
