const path = require('path')
const ejs = require('ejs')

async function render(template, data, opts = {}) {
  return new Promise((resolve, reject) => {
    const filename = path.join('./assets/mail-templates', `${template}.ejs`)
    ejs.renderFile(filename, data, opts, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      resolve(result)
    })
  })
}

module.exports = render
