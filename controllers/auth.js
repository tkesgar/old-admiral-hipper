const User = require('../models/user')
const log = require('../services/log')

exports.authByPassword = async (name, password) => {
  const user = await User.findByName(name)
  if (!user) {
    log.debug({name}, 'User not found in database')
    return null
  }

  const passwordMatch = await user.testPassword(password)
  if (!passwordMatch) {
    log.debug({name}, 'Password for user does not match')
    return null
  }

  log.debug({user}, 'User logged in')
  return user
}
