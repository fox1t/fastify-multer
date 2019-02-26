# Multer Storage Engine

Storage engines are classes that expose two functions: `_handleFile` and `_removeFile`.
Follow the template below to get started with your own custom storage engine.

When asking the user for input (such as where to save this file), always give
them the parameters `request, file, cb`, in this order. This makes it easier for
developers to switch between storage engines.

For example, in the template below, the engine saves the files to the disk. The
user tells the engine where to save the file, and this is done by
providing the `destination` parameter:

```javascript
const storage = myCustomStorage({
  destination: function (request, file, cb) {
    cb(null, '/var/www/uploads/' + file.originalname)
  }
})
```

Your engine is responsible for storing the file and returning information on how to
access the file in the future. This is done by the `_handleFile` function.

The file data will be given to you as a stream (`file.stream`). You should pipe
this data somewhere, and when you are done, call `cb` with some information on the
file.

The information you provide in the callback will be merged with multer's file object,
and then presented to the user via `request.files`.

Your engine is also responsible for removing files if an error is encountered
later on. Multer will decide which files to delete and when. Your storage class must
implement the `_removeFile` function. It will receive the same arguments as
`_handleFile`. Invoke the callback once the file has been removed.

## Template

```javascript
const fs = require('fs')

function getDestination (request, file, cb) {
  cb(null, '/dev/null')
}

function MyCustomStorage (opts) {
  this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile (request, file, cb) {
  this.getDestination(request, file, function (err, path) {
    if (err) return cb(err)

    var outStream = fs.createWriteStream(path)

    file.stream.pipe(outStream)
    outStream.on('error', cb)
    outStream.on('finish', function () {
      cb(null, {
        path: path,
        size: outStream.bytesWritten
      })
    })
  })
}

MyCustomStorage.prototype._removeFile = function _removeFile (request, file, cb) {
  fs.unlink(file.path, cb)
}

module.exports = function (opts) {
  return new MyCustomStorage(opts)
}
```
