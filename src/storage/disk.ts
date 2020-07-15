import { FastifyRequest } from 'fastify'
import { createWriteStream, unlink } from 'fs'
import os from 'os'
import { join } from 'path'
import crypto from 'crypto'
import mkdirp from 'mkdirp'

import { GetFileName, GetDestination, DiskStorageOptions, File, StorageEngine } from '../interfaces'

const getFilename: GetFileName = (_req, _file, cb) => {
  crypto.randomBytes(16, function(err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

const getDestination: GetDestination = (_req, _file, cb) => {
  cb(null, os.tmpdir())
}

class DiskStorage implements StorageEngine {
  getFilename: GetFileName
  getDestination: GetDestination

  constructor(opts: DiskStorageOptions) {
    this.getFilename = opts.filename || getFilename

    if (typeof opts.destination === 'string') {
      mkdirp.sync(opts.destination)
      this.getDestination = function(_$0, _$1, cb) {
        cb(null, opts.destination as string)
      }
    } else {
      this.getDestination = opts.destination || getDestination
    }
  }

  _handleFile(
    req: FastifyRequest,
    file: File,
    cb: (error: Error | null, info?: Partial<File>) => void,
  ): void {
    this.getDestination(req, file, (err, destination) => {
      if (err) {
        return cb(err)
      }

      this.getFilename(req, file, (error, filename) => {
        if (error) {
          return cb(error)
        }

        const finalPath = join(destination, filename!)
        const outStream = createWriteStream(finalPath)

        file.stream!.pipe(outStream)
        outStream.on('error', cb)
        outStream.on('finish', () => {
          cb(null, {
            destination,
            filename,
            path: finalPath,
            size: outStream.bytesWritten,
          })
        })
      })
    })
  }

  _removeFile(_req: FastifyRequest, file: File, cb: (error?: Error | null) => void): void {
    const path = file.path!

    delete file.destination
    delete file.filename
    delete file.path

    unlink(path, cb)
  }
}

export default (opts: DiskStorageOptions) => new DiskStorage(opts)
