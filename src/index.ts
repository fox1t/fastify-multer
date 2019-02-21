import express from 'express'
import makeMiddleware from './lib/make-middleware'
import diskStorage from './storage/disk'
import memoryStorage from './storage/memory'
import MulterError from './lib/multer-error'

import {
  Field,
  File,
  Options,
  FileFilter,
  FileFilterCallback,
  Setup,
  StorageEngine,
} from './interfaces'
import { Strategy } from './lib/file-appender'

function allowAll(req: express.Request, file: File, cb: FileFilterCallback) {
  cb(null, true)
}

class Multer {
  storage: StorageEngine
  limits: Options['limits']
  preservePath: Options['preservePath']
  fileFilter: FileFilter

  constructor(options: Options) {
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

  _makeMiddleware(fields: Field[], fileStrategy: Strategy) {
    const setup: Setup = () => {
      const fileFilter = this.fileFilter
      const filesLeft = Object.create(null)

      fields.forEach(function(field) {
        if (typeof field.maxCount === 'number') {
          filesLeft[field.name] = field.maxCount
        } else {
          filesLeft[field.name] = Infinity
        }
      })

      function wrappedFileFilter(req: express.Request, file: File, cb: FileFilterCallback) {
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
        fileStrategy,
      }
    }

    return makeMiddleware(setup)
  }

  single(name: string): express.RequestHandler {
    return this._makeMiddleware([{ name, maxCount: 1 }], 'VALUE')
  }

  array(name: string, maxCount: number): express.RequestHandler {
    return this._makeMiddleware([{ name, maxCount }], 'ARRAY')
  }

  fields(fields: Field[]): express.RequestHandler {
    return this._makeMiddleware(fields, 'OBJECT')
  }

  none(): express.RequestHandler {
    return this._makeMiddleware([], 'NONE')
  }

  any(): express.RequestHandler {
    const setup: Setup = () => ({
      limits: this.limits,
      preservePath: this.preservePath,
      storage: this.storage,
      fileFilter: this.fileFilter,
      fileStrategy: 'ARRAY',
    })

    return makeMiddleware(setup)
  }
}

export function multer(options?: Options) {
  if (options === undefined) {
    return new Multer({})
  }

  if (typeof options === 'object' && options !== null) {
    return new Multer(options)
  }

  throw new TypeError('Expected object for argument options')
}

export default multer
export { default as diskStorage } from './storage/disk'
export { default as memoryStorage } from './storage/memory'
export { default as MulterError } from './lib/multer-error'
