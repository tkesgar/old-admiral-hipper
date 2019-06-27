const sanitizeHtml = require('sanitize-html')

module.exports = {
  fn(value) {
    for (const block of value.blocks) {
      switch (block.type) {
        case 'paragraph':
          block.data.text = sanitizeHtml(block.data.text, {
            allowedTags: ['b', 'i', 'strong', 'em', 'strike', 'code'],
            allowedAttributes: {}
          })
          break
        default:
          break
      }
    }

    return value
  }
}
