import assert from 'assert'

import { file, submitForm } from './_util'
import multer from '../lib'
import temp from 'fs-temp'
import rimraf from 'rimraf'
import FormData from 'form-data'

describe('Issue #232', function() {
  let uploadDir, upload

  before(function(done) {
    temp.mkdir(function(err, path) {
      if (err) {
        return done(err)
      }

      uploadDir = path
      upload = multer({ dest: path, limits: { fileSize: 100 } })
      done()
    })
  })

  after(function(done) {
    rimraf(uploadDir, done)
  })

  it('should report limit errors', function(done) {
    const form = new FormData()
    const parser = upload.single('file')

    form.append('file', file('large.jpg'))

    submitForm(parser, form, function(err, req) {
      assert.ok(err, 'an error was given')

      assert.equal(err.code, 'LIMIT_FILE_SIZE')
      assert.equal(err.field, 'file')

      done()
    })
  })
})
