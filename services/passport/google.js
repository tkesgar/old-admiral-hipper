const {Strategy} = require('passport-google-oauth20')
const {baseurl} = require('../../config/env')
const User = require('../../models/user')
const log = require('../log')

module.exports = new Strategy(
  {
    clientID: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    callbackURL: `${baseurl}/auth/google/_callback`,
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
      const newUser = await User.insert({
        googleId: userInfo.sub,
        displayName: userInfo.name,
        email: userInfo.email,
        isEmailVerified: userInfo.email_verified
      })

      log.debug({info: userInfo, user: newUser}, 'Created a new user from Google authentication')
      cb(null, newUser)
    })().catch(cb)
  }
)
