const {default: ow} = require('ow')

const BLOCK_TYPES = ['header', 'list', 'quote', 'simple-image', 'delimiter', 'paragraph']

module.exports = value => {
  ow(value, ow.object.exactShape({
    version: ow.string,
    time: ow.number.positive.integer,
    // TODO Block ini divalidasi
    blocks: ow.array.ofType(ow.object.partialShape({
      type: ow.string.oneOf(BLOCK_TYPES)
    }))
  }))
}
