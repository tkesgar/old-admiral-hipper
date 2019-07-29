const sanitizeHtml = require('sanitize-html')

const OPTS_TEXT = {
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
}

const OPTS_NOTAGS = {
  allowedTags: []
}

function sanitize(html, opts = {}) {
  return sanitizeHtml(html, opts)
}

function sanitizeDoublePass(html, opts = {}) {
  return sanitize(sanitize(html, opts), opts)
}

module.exports = (value, allowNull = false) => {
  if (allowNull && value === null) {
    return
  }

  for (const block of value.blocks) {
    switch (block.type) {
      case 'paragraph':
        block.data.text = sanitizeDoublePass(block.data.text, OPTS_TEXT)
        break
      case 'header':
      case 'quote':
        block.data.text = sanitize(block.data.text, OPTS_NOTAGS)
        break
      case 'list':
        block.data.items = block.data.items.map(item => sanitize(item, OPTS_NOTAGS))
        break
      default:
        break
    }
  }

  return value
}
