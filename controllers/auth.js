const User = require('../models/user')

exports.register = async (name, password, email) => {
  return User.register({name, password, email})
}
