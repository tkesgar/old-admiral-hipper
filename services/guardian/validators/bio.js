const {default: ow} = require('ow')
const {ValidationError} = require('../utils')

const BLOCK_TYPES = ['header', 'list', 'quote', 'simple-image', 'delimiter', 'paragraph']

module.exports = (value, allowNull = false) => {
  if (allowNull && value === null) {
    return
  }

  try {
    ow(value, ow.object.exactShape({
      version: ow.string,
      time: ow.number.positive.integer,
      // TODO Block ini divalidasi per tipenya
      blocks: ow.array.ofType(ow.object.partialShape({
        type: ow.string.oneOf(BLOCK_TYPES)
      }))
    }))
  } catch {
    throw new ValidationError('Invalid display name')
  }
}
