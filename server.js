const createApp = require('./lib/create-app')
const log = require('./utils/log')

const app = createApp()

const port = process.env.PORT
app.listen(port, () => log.info(`Server listening on port ${port}`))
