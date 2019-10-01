import assert from 'assert'

import { file, submitForm } from './_util'
import multer from '../lib'
import FormData from 'form-data'

describe('Expected files', function() {
  let upload

  before(function(done) {
    upload = multer()
    done()
  })

  it('should reject single unexpected file', function(done) {
    const form = new FormData()
    const parser = upload.single('butme')

    form.append('notme', file('small0.dat'))

    submitForm(parser, form, function(err, req) {
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(err.field, 'notme')
      done()
    })
  })

  it('should reject array of multiple files', function(done) {
    const form = new FormData()
    const parser = upload.array('butme', 4)

    form.append('notme', file('small0.dat'))
    form.append('notme', file('small1.dat'))

    submitForm(parser, form, function(err, req) {
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(err.field, 'notme')
      done()
    })
  })

  it('should reject overflowing arrays', function(done) {
    const form = new FormData()
    const parser = upload.array('butme', 1)

    form.append('butme', file('small0.dat'))
    form.append('butme', file('small1.dat'))

    submitForm(parser, form, function(err, req) {
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(err.field, 'butme')
      done()
    })
  })

  it('should accept files with expected fieldname', function(done) {
    const form = new FormData()
    const parser = upload.fields([{ name: 'butme', maxCount: 2 }, { name: 'andme', maxCount: 2 }])

    form.append('butme', file('small0.dat'))
    form.append('butme', file('small1.dat'))
    form.append('andme', file('empty.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)

      assert.equal(req.files['butme'].length, 2)
      assert.equal(req.files['andme'].length, 1)

      done()
    })
  })

  it('should reject files with unexpected fieldname', function(done) {
    const form = new FormData()
    const parser = upload.fields([{ name: 'butme', maxCount: 2 }, { name: 'andme', maxCount: 2 }])

    form.append('butme', file('small0.dat'))
    form.append('butme', file('small1.dat'))
    form.append('andme', file('empty.dat'))
    form.append('notme', file('empty.dat'))

    submitForm(parser, form, function(err, req) {
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(err.field, 'notme')
      done()
    })
  })

  it('should allow any file to come thru', function(done) {
    const form = new FormData()
    const parser = upload.any()

    form.append('butme', file('small0.dat'))
    form.append('butme', file('small1.dat'))
    form.append('andme', file('empty.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)
      assert.equal(req.files.length, 3)
      assert.equal(req.files[0].fieldname, 'butme')
      assert.equal(req.files[1].fieldname, 'butme')
      assert.equal(req.files[2].fieldname, 'andme')
      done()
    })
  })
})
