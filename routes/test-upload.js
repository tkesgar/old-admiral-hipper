const {Router: router} = require('express')
const multer = require('multer')
const {FileIOStorage} = require('../services/file')
const checkAuth = require('../middlewares/check-auth')

const upload = multer({
  storage: new FileIOStorage()
})

const route = router()

route.use('/test-upload', checkAuth())

route.post('/test-upload',
  upload.single('image'),
  (req, res) => {
    console.log(req.file)
    res.sendStatus(200)
  }
)

module.exports = route
