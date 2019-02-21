const makeMiddleware = require('./lib/make-middleware')

const diskStorage = require('./storage/disk')
const memoryStorage = require('./storage/memory')
const MulterError = require('./lib/multer-error')

function allowAll (req, file, cb) {
  cb(null, true)
}

class Multer {
  constructor (options) {
    if (options.storage) {
      this.storage = options.storage
    } else if (options.dest) {
      this.storage = diskStorage({ destination: options.dest })
    } else {
      this.storage = memoryStorage()
    }

    this.limits = options.limits
    this.preservePath = options.preservePath
    this.fileFilter = options.fileFilter || allowAll
  }
  _makeMiddleware (fields, fileStrategy) {
    const setup = () => {
      const fileFilter = this.fileFilter
      const filesLeft = Object.create(null)

      fields.forEach(function (field) {
        if (typeof field.maxCount === 'number') {
          filesLeft[field.name] = field.maxCount
        } else {
          filesLeft[field.name] = Infinity
        }
      })

      function wrappedFileFilter (req, file, cb) {
        if ((filesLeft[file.fieldname] || 0) <= 0) {
          return cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
        }

        filesLeft[file.fieldname] -= 1
        fileFilter(req, file, cb)
      }

      return {
        limits: this.limits,
        preservePath: this.preservePath,
        storage: this.storage,
        fileFilter: wrappedFileFilter,
        fileStrategy: fileStrategy
      }
    }

    return makeMiddleware(setup)
  }
  single (name) {
    return this._makeMiddleware([{ name: name, maxCount: 1 }], 'VALUE')
  }
  array (name, maxCount) {
    return this._makeMiddleware([{ name: name, maxCount: maxCount }], 'ARRAY')
  }
  fields (fields) {
    return this._makeMiddleware(fields, 'OBJECT')
  }
  none () {
    return this._makeMiddleware([], 'NONE')
  }
  any () {
    function setup () {
      return {
        limits: this.limits,
        preservePath: this.preservePath,
        storage: this.storage,
        fileFilter: this.fileFilter,
        fileStrategy: 'ARRAY'
      }
    }

    return makeMiddleware(setup.bind(this))
  }
}

function multer (options) {
  if (options === undefined) {
    return new Multer({})
  }

  if (typeof options === 'object' && options !== null) {
    return new Multer(options)
  }

  throw new TypeError('Expected object for argument options')
}

module.exports = multer
module.exports.diskStorage = diskStorage
module.exports.memoryStorage = memoryStorage
module.exports.MulterError = MulterError
