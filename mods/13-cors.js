const cors = require('cors')

module.exports = app => {
  app.use(cors({
    origin: process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true
  }))
}
