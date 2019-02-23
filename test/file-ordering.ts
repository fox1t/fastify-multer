import assert from 'assert'

import { file, submitForm } from './_util'
import multer, { memoryStorage } from '../src'
import FormData from 'form-data'

describe('File ordering', function() {
  it('should present files in same order as they came', function(done) {
    const storage = memoryStorage()
    const upload = multer({ storage: storage })
    const parser = upload.array('themFiles', 2)

    let i = 0
    const calls: any[] = [{}, {}]
    let pending = 2
    const _handleFile = storage._handleFile
    storage._handleFile = function(req, f, cb) {
      const id = i++

      _handleFile.call(this, req, f, function(err, info) {
        if (err) {
          return cb(err)
        }

        calls[id].cb = cb
        calls[id].info = info

        if (--pending === 0) {
          calls[1].cb(null, calls[1].info)
          calls[0].cb(null, calls[0].info)
        }
      })
    }

    const form = new FormData()

    form.append('themFiles', file('small0.dat'))
    form.append('themFiles', file('small1.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)
      assert.equal(req.files.length, 2)
      assert.equal(req.files[0].originalname, 'small0.dat')
      assert.equal(req.files[1].originalname, 'small1.dat')
      done()
    })
  })
})
