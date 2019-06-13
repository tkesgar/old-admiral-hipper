const nodemailer = require('nodemailer')
const log = require('../log')
const render = require('./render')

class Mail {
  static getSMTPTransporter() {
    if (process.env.SMTP_CONFIG) {
      return JSON.parse(process.env.SMTP_CONFIG)
    }

    return {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      secure: JSON.parse(process.env.SMTP_SECURE)
    }
  }

  static getDefaults() {
    return {}
  }

  static createTransport(transporter = Mail.getSMTPTransporter(), defaults = Mail.getDefaults()) {
    return nodemailer.createTransport(transporter, defaults)
  }

  constructor(transport = Mail.createTransport()) {
    this.transport = transport
  }

  async send(opts = {}) {
    const {
      text,
      html
    } = opts

    if (typeof text === 'object') {
      opts.text = await render(text.template, text.data, text.opts)
    }

    if (typeof html === 'object') {
      opts.html = await render(html.template, html.data, html.opts)
    }

    return this.transport.sendMail(opts)
  }

  async sendTemplate(to, template, data = {}) {
    const info = await this.send({
      to,
      subject: data.title,
      html: {
        template,
        data,
        opts: {
          rmWhitespace: true
        }
      }
    })

    log.debug({info}, 'Email sent')
  }
}

module.exports = Mail
