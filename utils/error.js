class AppError extends Error {
  constructor(message, code, data) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.data = data
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      data: this.data
    }
  }
}

exports.AppError = AppError
