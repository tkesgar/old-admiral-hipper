const {default: ow} = require('ow')

module.exports = {
  fn(value) {
    ow(value, ow.object.exactShape({
      version: ow.string,
      time: ow.number.positive.integer,
      blocks: ow.array.ofType(ow.any(
        ow.object.exactShape({
          type: ow.string.equals('paragraph'),
          data: ow.object.exactShape({
            text: ow.string
          })
        })
      ))
    }))
  }
}
