const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')

function getFilename (req, file, cb) {
  crypto.randomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function getDestination (req, file, cb) {
  cb(null, os.tmpdir())
}
class DiskStorage {
  constructor (opts) {
    this.getFilename = (opts.filename || getFilename)

    if (typeof opts.destination === 'string') {
      mkdirp.sync(opts.destination)
      this.getDestination = function ($0, $1, cb) { cb(null, opts.destination) }
    } else {
      this.getDestination = (opts.destination || getDestination)
    }
  }
  _handleFile (req, file, cb) {
    this.getDestination(req, file, (err, destination) => {
      if (err) return cb(err)

      this.getFilename(req, file, function (err, filename) {
        if (err) return cb(err)

        const finalPath = path.join(destination, filename)
        const outStream = fs.createWriteStream(finalPath)

        file.stream.pipe(outStream)
        outStream.on('error', cb)
        outStream.on('finish', function () {
          cb(null, {
            destination: destination,
            filename: filename,
            path: finalPath,
            size: outStream.bytesWritten
          })
        })
      })
    })
  }

  _removeFile (req, file, cb) {
    const path = file.path

    delete file.destination
    delete file.filename
    delete file.path

    fs.unlink(path, cb)
  }
}

module.exports = function (opts) {
  return new DiskStorage(opts)
}
