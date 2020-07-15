import { FastifyRequest, preHandlerHookHandler } from 'fastify'
import makePreHandler from './lib/make-prehandler'
import diskStorage from './storage/disk'
import memoryStorage from './storage/memory'
import MulterError from './lib/multer-error'
import contentParser from './lib/content-parser'

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

function allowAll(_req: FastifyRequest, _file: File, cb: FileFilterCallback) {
  cb(null, true)
}

class Multer {
  storage: StorageEngine
  limits: Options['limits']
  preservePath: Options['preservePath']
  fileFilter: FileFilter
  contentParser: typeof contentParser

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
    this.contentParser = contentParser
  }

  private _makePreHandler(fields: Field[], fileStrategy: Strategy) {
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

      function wrappedFileFilter(req: FastifyRequest, file: File, cb: FileFilterCallback) {
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

    return makePreHandler(setup)
  }

  single(name: string): preHandlerHookHandler {
    return this._makePreHandler([{ name, maxCount: 1 }], 'VALUE')
  }

  array(name: string, maxCount?: number): preHandlerHookHandler {
    return this._makePreHandler([{ name, maxCount }], 'ARRAY')
  }

  fields(fields: Field[]): preHandlerHookHandler {
    return this._makePreHandler(fields, 'OBJECT')
  }

  none(): preHandlerHookHandler {
    return this._makePreHandler([], 'NONE')
  }

  any(): preHandlerHookHandler {
    const setup: Setup = () => ({
      limits: this.limits,
      preservePath: this.preservePath,
      storage: this.storage,
      fileFilter: this.fileFilter,
      fileStrategy: 'ARRAY',
    })

    return makePreHandler(setup)
  }
}

interface MulterFactory {
  (options?: Options | undefined): Multer
  contentParser: typeof contentParser
  diskStorage: typeof diskStorage
  memoryStorage: typeof memoryStorage
  MulterError: typeof MulterError
  default: MulterFactory
}

const multer: any = function(options?: Options) {
  if (options === undefined) {
    return new Multer({})
  }

  if (typeof options === 'object' && options !== null) {
    return new Multer(options)
  }

  throw new TypeError('Expected object for argument options')
}

multer.contentParser = contentParser
multer.diskStorage = diskStorage
multer.memoryStorage = memoryStorage
multer.MulterError = MulterError
multer.default = multer

export = multer as MulterFactory
