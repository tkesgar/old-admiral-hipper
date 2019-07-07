const sanitizeHtml = require('sanitize-html')

function sanitize(html) {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'a'],
    allowedAttributes: {
      a: ['href']
    },
    transformTags: {
      a(tagName, attribs) {
        const {href} = attribs

        if (!href) {
          return {tagName: 'span'}
        }

        let cleanHref
        try {
          const url = new URL(href)
          if (!['http:', 'https:'].includes(url.protocol)) {
            return {tagName: 'span'}
          }

          cleanHref = [url.origin, url.pathname, url.search, url.hash].join('')
        } catch {
          return {tagName: 'span'}
        }

        return {
          tagName: 'a',
          attribs: {
            href: cleanHref
          }
        }
      }
    }
  })
}

module.exports = {
  fn(value) {
    for (const block of value.blocks) {
      switch (block.type) {
        case 'paragraph': {
          const firstPassHtml = sanitize(block.data.text)
          block.data.text = sanitize(firstPassHtml)
          break
        }

        default:
          break
      }
    }

    return value
  }
}
