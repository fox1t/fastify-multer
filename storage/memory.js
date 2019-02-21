const concat = require('concat-stream')

class MemoryStorage {
  _handleFile (req, file, cb) {
    file.stream.pipe(concat({ encoding: 'buffer' }, function (data) {
      cb(null, {
        buffer: data,
        size: data.length
      })
    }))
  }
  _removeFile (req, file, cb) {
    delete file.buffer
    cb(null)
  }
}

module.exports = function (opts) {
  return new MemoryStorage(opts)
}
