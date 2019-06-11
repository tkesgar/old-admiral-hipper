const {Strategy} = require('passport-local')
const User = require('../../models/user')

module.exports = new Strategy((name, password, done) => {
  (async () => {
    const user = await User.findByName(name)
    if (!user) {
      done(null, false)
      return
    }

    const match = await user.testPassword(password)
    if (!match) {
      done(null, false)
      return
    }

    done(null, user)
  })().catch(done)
})
