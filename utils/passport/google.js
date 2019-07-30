const {Strategy} = require('passport-google-oauth20')
const UserService = require('../../services/user')
const {getValue, getBaseURL} = require('../env')

const config = {
  clientID: getValue('AUTH_GOOGLE_ID'),
  clientSecret: getValue('AUTH_GOOGLE_SECRET'),
  callbackURL: `${getBaseURL()}/auth/google/_callback`,
  scope: ['email', 'profile']
}

function verify(accessToken, refreshToken, profile, cb) {
  (async () => {
    const user = await UserService.authenticateUserFromGoogle(profile)
    cb(null, user)
  })().catch(cb)
}

exports.verify = verify

exports.strategy = new Strategy(config, verify)
