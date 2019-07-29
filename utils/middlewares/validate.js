const {FailError} = require('../error')
const log = require('../log')

module.exports = validateFn => (req, res, next) => {
  try {
    validateFn(req)
    next()
  } catch (error) {
    log.debug({err: error}, 'Validation function throws an error')
    next(new FailError('INVALID_REQUEST', {
      message: 'Invalid request',
      statusCode: 422
    }))
  }
}
