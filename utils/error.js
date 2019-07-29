class AppError extends Error {
  constructor(status, code, opts = {}) {
    const {
      message = 'Application error',
      data = undefined,
      statusCode = 400,
      level = 'debug'
    } = opts

    super(message)

    this.status = status
    this.code = code
    this.data = data
    this.statusCode = statusCode
    this.level = level
  }

  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      data: this.data
    }
  }
}

exports.AppError = AppError

class FailError extends AppError {
  constructor(code, opts = {}) {
    const {message = 'Request failed'} = opts

    super('fail', code, {
      ...opts,
      message
    })
  }
}

exports.FailError = FailError

class ServerError extends AppError {
  constructor(code, opts = {}) {
    const {
      message = 'Server error occured',
      statusCode = 500
    } = opts

    super('error', code, {
      ...opts,
      message,
      statusCode,
      level: 'error'
    })
  }
}

exports.ServerError = ServerError

class NotFoundError extends FailError {
  constructor() {
    super('NOT_FOUND', {
      message: 'Resource not found',
      statusCode: 404,
      level: 'debug'
    })
  }
}

exports.NotFoundError = NotFoundError
