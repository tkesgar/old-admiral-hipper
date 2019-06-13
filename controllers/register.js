const User = require('../models/user')
const log = require('../services/log')
const {validateUserName} = require('../utils/validate')

exports.register = async (name, password, email) => {
  validateUserName(name)

  const user = await User.register({name, password, email})

  log.debug({user}, 'New user registered')
  return user
}
