import assert from 'assert'

import path from 'path'
import { file, fileSize, submitForm } from './_util'
import multer from '../lib'
import temp from 'fs-temp'
import rimraf from 'rimraf'
import FormData from 'form-data'
import os from 'os'

describe('Unicode', function() {
  let uploadDir, upload

  beforeEach(function(done) {
    temp.mkdir(function(err, p) {
      if (err) {
        return done(err)
      }

      const storage = multer.diskStorage({
        destination: p,
        filename: function(req, f, cb) {
          cb(null, f.originalname)
        },
      })

      uploadDir = p
      upload = multer({ storage: storage })
      done()
    })
  })

  afterEach(function(done) {
    rimraf(uploadDir, done)
  })

  it('should handle unicode filenames', function(done) {
    const form = new FormData()
    const parser = upload.single('small0')
    const filename = '\ud83d\udca9.dat'

    form.append('small0', file('small0.dat'), { filename: filename })

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)

      assert.equal(path.basename(req.file.path), filename)
      assert.equal(req.file.originalname, filename)

      assert.equal(req.file.fieldname, 'small0')
      assert.equal(req.file.size, os.platform() === 'win32' ? 1803 : 1778)
      assert.equal(fileSize(req.file.path), os.platform() === 'win32' ? 1803 : 1778)

      done()
    })
  })
})
