const sharp = require('sharp')

const IMAGE_INFO = {
  avatar: {
    ext: 'jpeg',
    convert(sharpInstance) {
      return sharpInstance
        .resize(200, 200)
        .jpeg()
    },
    variant: {
      sm: {
        convert(sharpInstance) {
          return sharpInstance
            .resize(10, 10)
            .jpeg()
        }
      }
    }
  },
  portrait: {
    ext: 'jpeg',
    convert(sharpInstance) {
      return sharpInstance
        .resize(800, 1200)
        .jpeg()
    },
    variant: {
      sm: {
        convert(sharpInstance) {
          return sharpInstance
            .resize(40, 60)
            .jpeg()
        }
      }
    }
  },
  fullbody: {
    ext: 'png',
    convert(sharpInstance) {
      return sharpInstance
        .resize(1000, 1000, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
        .png()
    },
    variant: {
      sm: {
        convert(sharpInstance) {
          return sharpInstance
            .resize(50, 50, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
            .png()
        }
      }
    }
  }
}

exports.IMAGE_TYPES = Object.keys(IMAGE_INFO)

function getImageVariants(type) {
  if (!type) {
    throw new Error(`Unknown image type: ${type}`)
  }

  const {variant} = IMAGE_INFO[type]
  return variant ? Object.keys(IMAGE_INFO[type].variant) : []
}

exports.getImageVariants = getImageVariants

async function convert(sharpInstance, type, variant = null) {
  const imageInfo = {...IMAGE_INFO[type]}
  if (variant) {
    Object.assign(imageInfo, IMAGE_INFO[type].variant[variant])
  }

  const {ext, convert} = imageInfo
  const buffer = await convert(sharpInstance.clone()).toBuffer()

  return {buffer, ext}
}

exports.convert = convert

async function convertImage(buffer, type, variant = null) {
  return convert(sharp(buffer), type, variant)
}

exports.convertImage = convertImage
