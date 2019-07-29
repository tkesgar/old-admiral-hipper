const handle = require('./handle')

function send(handler) {
  return handle(async (req, res) => {
    let data = await handler(req, res)

    switch (typeof data) {
      case 'symbol':
      case 'undefined':
        data = null
        break
      default:
        break
    }

    return {status: 'success', data}
  })
}

module.exports = send
