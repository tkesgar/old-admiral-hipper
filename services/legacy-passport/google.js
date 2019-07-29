const {Strategy} = require('passport-google-oauth20')
const {getBaseURL} = require('../../utils/env')
const User = require('../../models/user')
const log = require('../../utils/log')

module.exports = new Strategy(
  {
    clientID: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    callbackURL: `${getBaseURL()}/auth/google/_callback`,
    scope: ['email', 'profile'],
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, cb) => { // eslint-disable-line max-params
    (async () => {
      const user = await User.findByGoogleId(profile.id)
      if (user) {
        log.debug({user}, 'Login using existing user')
        cb(null, user)
        return
      }

      const userInfo = profile._json
      const userId = await User.insert({
        email: userInfo.email,
        displayName: userInfo.name,
        isEmailVerified: userInfo.email_verified,
        googleId: userInfo.sub
      })

      log.debug({info: userInfo, userId}, 'Created a new user from Google authentication')
      cb(null, {id: userId})
    })().catch(cb)
  }
)
