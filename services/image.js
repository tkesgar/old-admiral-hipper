const sharp = require('sharp')

const PROCESSORS = {
  avatar: {
    ext: 'jpg',
    process(buffer) {
      return sharp(buffer)
        .resize(200, 200)
    }
  },
  portrait: {
    ext: 'png',
    process(buffer) {
      return sharp(buffer)
        .resize(400, 600)
    }
  },
  fullbody: {
    ext: 'png',
    process(buffer) {
      return sharp(buffer)
        .resize(400, 800, {fit: 'contain'})
    }
  }
}

function getFileExt(type) {
  return PROCESSORS[type].ext || 'jpg'
}

exports.getFileExt = getFileExt

async function processImage(buffer, type) {
  const {ext = 'jpg', process} = PROCESSORS[type]

  const image = process(buffer)

  switch (ext) {
    case 'png':
      image.png()
      break
    default:
      image.jpg()
  }

  return {
    data: await image.toBuffer(),
    ext
  }
}

exports.processImage = processImage
