import { Busboy, BusboyHeaders } from '@fastify/busboy'
import appendField from 'append-field'
import { FastifyReply, FastifyRequest } from 'fastify'
import onFinished from 'on-finished'
import is from 'type-is'
import extend from 'xtend'

import { File, Setup } from '../interfaces'
import Counter from './counter'
import FileAppender from './file-appender'
import MulterError, { ErrorMessages } from './multer-error'
import removeUploadedFiles, { RemoveUploadedFileError } from './remove-uploaded-files'

type UploadError = { storageErrors?: RemoveUploadedFileError[] } & Error

function drainStream(stream: NodeJS.ReadableStream) {
  stream.on('readable', stream.read.bind(stream))
}

function makePreHandler(setup: Setup) {
  return (request: FastifyRequest, _: FastifyReply, next: (err?: Error) => void) => {
    const rawRequest = request.raw

    if (!is(rawRequest, ['multipart'])) {
      return next()
    }

    const options = setup()

    const limits = options.limits
    const storage = options.storage
    const fileFilter = options.fileFilter
    const fileStrategy = options.fileStrategy
    const preservePath = options.preservePath

    request.body = Object.create(null)

    let busboy: Busboy

    try {
      busboy = new Busboy({
        headers: rawRequest.headers as BusboyHeaders,
        limits,
        preservePath,
      })
    } catch (err) {
      return err instanceof Error ? next(err) : next(new Error())
    }

    const appender = new FileAppender(fileStrategy, request)
    let isDone = false
    let readFinished = false
    let errorOccured = false
    const pendingWrites = new Counter()
    const uploadedFiles: File[] = []

    function done(err?: Error) {
      if (isDone) {
        return
      }
      isDone = true

      rawRequest.unpipe(busboy)
      drainStream(rawRequest)
      busboy.removeAllListeners()

      onFinished(rawRequest, function () {
        next(err)
      })
    }

    function indicateDone() {
      if (readFinished && pendingWrites.isZero() && !errorOccured) {
        done()
      }
    }

    function abortWithError(uploadError: UploadError) {
      if (errorOccured) {
        return
      }
      errorOccured = true

      pendingWrites.onceZero(function () {
        function remove(file: File, cb: (error?: Error | null) => void) {
          storage._removeFile(request, file, cb)
        }

        removeUploadedFiles(
          uploadedFiles,
          remove,
          function (err: Error | null, storageErrors: RemoveUploadedFileError[]) {
            if (err) {
              return done(err)
            }

            uploadError.storageErrors = storageErrors
            done(uploadError)
          },
        )
      })
    }

    function abortWithCode(code: keyof ErrorMessages, optionalField?: string) {
      abortWithError(new MulterError(code, optionalField))
    }

    // handle text field data
    busboy.on('field', function (fieldname, value, fieldnameTruncated, valueTruncated) {
      if (fieldnameTruncated) {
        return abortWithCode('LIMIT_FIELD_KEY')
      }
      if (valueTruncated) {
        return abortWithCode('LIMIT_FIELD_VALUE', fieldname)
      }

      // Work around bug in Busboy (https://github.com/mscdex/busboy/issues/6)
      if (limits && limits.hasOwnProperty('fieldNameSize')) {
        if (fieldname.length > limits.fieldNameSize!) {
          return abortWithCode('LIMIT_FIELD_KEY')
        }
      }

      appendField(request.body, fieldname, value)
    })

    // handle files
    busboy.on('file', function (fieldname, fileStream, filename, encoding, mimetype) {
      // don't attach to the files object, if there is no file
      if (!filename) {
        return fileStream.resume()
      }

      // Work around bug in Busboy (https://github.com/mscdex/busboy/issues/6)
      if (limits && limits.hasOwnProperty('fieldNameSize')) {
        if (fieldname.length > limits.fieldNameSize!) {
          return abortWithCode('LIMIT_FIELD_KEY')
        }
      }

      const file = {
        fieldname: fieldname,
        originalname: filename,
        encoding: encoding,
        mimetype: mimetype,
      }

      const placeholder = appender.insertPlaceholder(file)

      fileFilter(request, file, function (err: UploadError | null, includeFile?: boolean) {
        if (err) {
          appender.removePlaceholder(placeholder)
          return abortWithError(err)
        }

        if (!includeFile) {
          appender.removePlaceholder(placeholder)
          return fileStream.resume()
        }

        let aborting = false
        pendingWrites.increment()

        Object.defineProperty(file, 'stream', {
          configurable: true,
          enumerable: false,
          value: fileStream,
        })

        fileStream.on('error', function (error: Error) {
          pendingWrites.decrement()
          abortWithError(error)
        })

        fileStream.on('limit', function () {
          aborting = true
          abortWithCode('LIMIT_FILE_SIZE', fieldname)
        })

        storage._handleFile(request, file, function (error?: Error | null, info?: Partial<File>) {
          if (aborting) {
            appender.removePlaceholder(placeholder)
            uploadedFiles.push(info ? extend(file, info) : file)
            return pendingWrites.decrement()
          }

          if (error) {
            appender.removePlaceholder(placeholder)
            pendingWrites.decrement()
            return abortWithError(error)
          }

          const fileInfo = info ? extend(file, info) : file

          appender.replacePlaceholder(placeholder, fileInfo)
          uploadedFiles.push(fileInfo)
          pendingWrites.decrement()
          indicateDone()
        })
      })
    })

    busboy.on('error', function (err: Error) {
      abortWithError(err)
    })
    busboy.on('partsLimit', function () {
      abortWithCode('LIMIT_PART_COUNT')
    })
    busboy.on('filesLimit', function () {
      abortWithCode('LIMIT_FILE_COUNT')
    })
    busboy.on('fieldsLimit', function () {
      abortWithCode('LIMIT_FIELD_COUNT')
    })
    busboy.on('finish', function () {
      readFinished = true
      indicateDone()
    })

    rawRequest.pipe(busboy)
  }
}

export default makePreHandler
