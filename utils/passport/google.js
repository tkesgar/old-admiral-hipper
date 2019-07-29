const {Strategy} = require('passport-google-oauth20')
const UserService = require('../../services/user')

const {
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  BASE_URL
} = process.env

const config = {
  clientID: AUTH_GOOGLE_ID,
  clientSecret: AUTH_GOOGLE_SECRET,
  callbackURL: `${BASE_URL}/auth/google/_callback`,
  scope: ['email', 'profile'],
  passReqToCallback: true
}

function verify(accessToken, refreshToken, profile, cb) {
  (async () => {
    const user = await UserService.authenticateUserFromGoogle(profile)
    cb(null, user)
  })().catch(cb)
}

exports.verify = verify

exports.strategy = new Strategy(config, verify)
