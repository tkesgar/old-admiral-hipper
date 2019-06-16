const {Passport} = require('passport')
const User = require('../../models/user')
const googleStrategy = require('./google')

const passport = new Passport()

passport.serializeUser((user, done) => {
  if (!user.id) {
    done(new Error('Invalid user object for serialization'))
    return
  }

  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  (async () => {
    const user = await User.findById(id)
    if (!user) {
      throw new Error('Invalid user id for deserialization')
    }

    done(null, user)
  })().catch(done)
})

passport.use('google', googleStrategy)

module.exports = passport
