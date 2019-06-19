const sharp = require('sharp')

function processAvatar(buffer) {
  return sharp(buffer)
    .resize(200, 200)
    .jpg()
}

function processPortrait(buffer) {
  return sharp(buffer)
    .resize(400, 600)
    .jpg()
}

function processFullbody(buffer) {
  return sharp(buffer)
    .resize(400, 800, {fit: 'contain'})
    .png()
}

function processImage(buffer, type) {
  switch (type) {
    case 'avatar':
      return processAvatar(buffer)
    case 'portrait':
      return processPortrait(buffer)
    case 'fullbody':
      return processFullbody(buffer)
    default:
      throw new Error(`Unknown image type: ${type}`)
  }
}

module.exports = processImage
