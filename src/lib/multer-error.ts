export interface ErrorMessages {
  LIMIT_PART_COUNT: 'Too many parts'
  LIMIT_FILE_SIZE: 'File too large'
  LIMIT_FILE_COUNT: 'Too many files'
  LIMIT_FIELD_KEY: 'Field name too long'
  LIMIT_FIELD_VALUE: 'Field value too long'
  LIMIT_FIELD_COUNT: 'Too many fields'
  LIMIT_UNEXPECTED_FILE: 'Unexpected field'
}

const errorMessages: ErrorMessages = {
  LIMIT_PART_COUNT: 'Too many parts',
  LIMIT_FILE_SIZE: 'File too large',
  LIMIT_FILE_COUNT: 'Too many files',
  LIMIT_FIELD_KEY: 'Field name too long',
  LIMIT_FIELD_VALUE: 'Field value too long',
  LIMIT_FIELD_COUNT: 'Too many fields',
  LIMIT_UNEXPECTED_FILE: 'Unexpected field',
}

class MulterError extends Error {
  code: string
  field: string | undefined = undefined

  constructor(code: keyof ErrorMessages, field?: string) {
    super()
    this.name = this.constructor.name
    this.message = errorMessages[code]
    this.code = code
    if (field) {
      this.field = field
    }
    Error.captureStackTrace(this, this.constructor)
  }
}

export default MulterError
