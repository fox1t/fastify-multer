import assert from 'assert'

import { file, submitForm } from './_util'
import multer from '../src'
import FormData from 'form-data'

describe('None', function() {
  let parser

  before(function() {
    parser = multer().none()
  })

  it('should not allow file uploads', function(done) {
    const form = new FormData()

    form.append('key1', 'val1')
    form.append('key2', 'val2')
    form.append('file', file('small0.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ok(err)
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(req.files, undefined)
      assert.equal(req.body['key1'], 'val1')
      assert.equal(req.body['key2'], 'val2')
      done()
    })
  })

  it('should handle text fields', function(done) {
    const form = new FormData()

    form.append('key1', 'val1')
    form.append('key2', 'val2')

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)
      assert.equal(req.files, undefined)
      assert.equal(req.body['key1'], 'val1')
      assert.equal(req.body['key2'], 'val2')
      done()
    })
  })
})
