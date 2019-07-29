const {ServerError} = require('../error')
const {toggle} = require('../config')

function toggleRoute(name) {
  return (req, res, next) => {
    if (!toggle[name]) {
      next(new ServerError('TOGGLE', {
        message: 'This feature is currently disabled'
      }))
      return
    }

    next()
  }
}

module.exports = toggleRoute
