const path = require('path')
const nodemailer = require('nodemailer')
const pug = require('pug')
const env = require('../../utils/env')

const TEMPLATE_DIR = './views/mail'
const DEFAULT_SUBJECT = '[CharaDB] Email dari CharaDB'

function getSMTPConfig() {
  if (process.env.SMTP_CONFIG) {
    return JSON.parse(process.env.SMTP_CONFIG)
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    secure: JSON.parse(process.env.SMTP_SECURE)
  }
}

function getTemplatePath(name, dir = TEMPLATE_DIR) {
  return path.join(dir, `${name}.pug`)
}

const transporter = nodemailer.createTransport(getSMTPConfig())

exports.transporter = transporter

function render(templateName, templateData = {}) {
  const templatePath = getTemplatePath(templateName)

  return pug.renderFile(templatePath, {
    compileDebug: !env.isProduction(),
    cache: env.isProduction(),
    ...templateData
  })
}

exports.render = render

async function sendMail(to, templateName, templateData = {}) {
  const html = render(templateName, templateData)
  const subject = templateData.title || DEFAULT_SUBJECT

  return transporter.sendMail({to, subject, html})
}

exports.sendMail = sendMail
