const createApp = require('./lib/create-app')
const log = require('./services/log')

const app = createApp()

const port = process.env.PORT
app.listen(port, () => log.info(`Server listening on port ${port}`))
