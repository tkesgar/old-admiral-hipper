const nodemailer = require('nodemailer')
const render = require('./render')

const defaultTransporter = nodemailer.createTransport(
  (() => {
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
  })()
)

exports.defaultTransporter = defaultTransporter

async function sendMail(mailOpts = {}, transporter = defaultTransporter) {
  const {
    text,
    html
  } = mailOpts

  return transporter.sendMail({
    ...mailOpts,
    ...(typeof text === 'object' ? {
      text: await render(text.template, text.data, text.opts)
    } : {}),
    ...(typeof html === 'object' ? {
      html: await render(html.template, html.data, html.opts)
    } : {})
  })
}

exports.sendMail = sendMail

async function sendMailFromTemplate(to, template, data = {}) {
  return sendMail({
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
}

exports.sendMailFromTemplate = sendMailFromTemplate
