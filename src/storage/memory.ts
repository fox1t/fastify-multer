import express from 'express'
import concat from 'concat-stream'

import { StorageEngine, File } from '../interfaces'

class MemoryStorage implements StorageEngine {
  _handleFile(
    req: express.Request,
    file: File,
    cb: (error: Error | null, info?: Partial<File>) => void,
  ): void {
    file.stream.pipe(
      concat({ encoding: 'buffer' }, function(data) {
        cb(null, {
          buffer: data,
          size: data.length,
        })
      }),
    )
  }

  _removeFile(req: express.Request, file: File, cb: (error?: Error) => void) {
    delete file.buffer
    cb(undefined)
  }
}

export default () => new MemoryStorage()
