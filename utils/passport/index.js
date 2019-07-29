const {Passport} = require('passport')
const UserService = require('../../services/user')
const {strategy: googleStrategy} = require('./google')

const passport = new Passport()

function serializeUser(user, done) {
  (async () => {
    const data = await UserService.serialize(user)
    done(null, data)
  })().catch(done)
}

exports.serializeUser = serializeUser

function deserializeUser(data, done) {
  (async () => {
    const user = await UserService.deserialize(data)
    done(null, user)
  })().catch(done)
}

exports.deserializeUser = deserializeUser

passport.serializeUser(serializeUser)
passport.deserializeUser(deserializeUser)
passport.use('google', googleStrategy)

exports.passport = passport
