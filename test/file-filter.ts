import assert from 'assert'

import { submitForm, file } from './_util'
import multer from '../lib'
import FormData from 'form-data'

function withFilter(fileFilter) {
  return multer({ fileFilter: fileFilter })
}

function skipSpecificFile(req, f, cb) {
  cb(null, f.fieldname !== 'notme')
}

function reportFakeError(req, _, cb) {
  cb(new Error('Fake error'))
}

describe('File Filter', function() {
  it('should skip some files', function(done) {
    const form = new FormData()
    const upload = withFilter(skipSpecificFile)
    const parser = upload.fields([{ name: 'notme', maxCount: 1 }, { name: 'butme', maxCount: 1 }])

    form.append('notme', file('tiny0.dat'))
    form.append('butme', file('tiny1.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)
      assert.equal(req.files['notme'], undefined)
      assert.equal(req.files['butme'][0].fieldname, 'butme')
      assert.equal(req.files['butme'][0].originalname, 'tiny1.dat')
      assert.equal(req.files['butme'][0].size, 7)
      assert.equal(req.files['butme'][0].buffer.length, 7)
      done()
    })
  })

  it('should report errors from fileFilter', function(done) {
    const form = new FormData()
    const upload = withFilter(reportFakeError)
    const parser = upload.single('test')

    form.append('test', file('tiny0.dat'))

    submitForm(parser, form, function(err, req) {
      assert.equal(err.message, 'Fake error')
      done()
    })
  })
})
