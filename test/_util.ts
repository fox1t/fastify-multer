import fs from 'fs'
import path from 'path'
import stream from 'stream'
import onFinished from 'on-finished'

export function file(name: string) {
  return fs.createReadStream(path.join(__dirname, 'files', name))
}

export function fileSize(p: string) {
  return fs.statSync(p).size
}

export function submitForm(multer: any, form: any, cb: any) {
  form.getLength(function(err: Error, length: number) {
    if (err) {
      return cb(err)
    }

    const req = new stream.PassThrough() as stream.PassThrough & { complete: boolean; headers: any }

    req.complete = false
    form.once('end', function() {
      req.complete = true
    })

    form.pipe(req)
    req.headers = {
      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      'content-length': length,
    }

    const request = { req }
    multer(request, null, function(error: Error) {
      onFinished(req as any, function() {
        cb(error, request)
      })
    })
  })
}
