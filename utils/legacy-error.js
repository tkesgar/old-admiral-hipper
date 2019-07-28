exports.AppError = class AppError extends Error {
  constructor(message, code, data, origin = 'user') {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.data = data
    this.origin = origin
  }
}
