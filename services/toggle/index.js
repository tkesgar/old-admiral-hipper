const {ServerError} = require('../../utils/error')
const {toggle} = require('../../utils/config')

class ToggleService {
  static checkToggle(name) {
    if (!toggle[name]) {
      throw new ServerError('TOGGLE', {
        message: 'This feature is currently disabled'
      })
    }
  }
}

module.exports = ToggleService
