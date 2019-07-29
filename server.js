require('./utils/env').loadEnv()

const createApp = require('./utils/app')
const log = require('./services/legacy-log')

const app = createApp()

const port = process.env.PORT
app.listen(port, () => log.info(`Server listening on port ${port}`))
