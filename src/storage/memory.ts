import { IncomingMessage } from 'http'
import { FastifyRequest } from 'fastify'
import concat = require('concat-stream')

import { StorageEngine, File } from '../interfaces'

class MemoryStorage implements StorageEngine {
  _handleFile(
    req: FastifyRequest<IncomingMessage>,
    file: File,
    cb: (error: Error | null, info?: Partial<File>) => void,
  ): void {
    file.stream!.pipe(
      concat({ encoding: 'buffer' }, function(data) {
        cb(null, {
          buffer: data,
          size: data.length,
        })
      }),
    )
  }

  _removeFile(req: FastifyRequest<IncomingMessage>, file: File, cb: (error?: Error) => void) {
    delete file.buffer
    cb(undefined)
  }
}

export default () => new MemoryStorage()
