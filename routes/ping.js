const {Router: router} = require('express')

const route = router()

route.get('/ping', (req, res) => res.sendStatus(200))

module.exports = route
