const {Router: router} = require('express')
const {default: ow} = require('ow')
const handle = require('../middlewares/handle')
const ShareController = require('../controllers/share')

const route = router()

route.get('/share/chara/:charaId', handle(async (req, res) => {
  const {charaId} = req.params
  ow(charaId, ow.string.numeric)

  const locals = await ShareController.getViewLocals(Number(charaId))
  Object.assign(res.locals, locals)

  res.render('share/main')
}))

module.exports = route
