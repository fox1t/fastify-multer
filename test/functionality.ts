import assert from 'assert'

import { file, submitForm, fileSize } from './_util'
import multer from '../lib'
import temp from 'fs-temp'
import rimraf from 'rimraf'
import FormData from 'form-data'
import path from 'path'

function generateFilename(req, f, cb) {
  cb(null, f.fieldname + f.originalname)
}

function startsWith(str, start) {
  return str.substring(0, start.length) === start
}

describe('Functionality', function() {
  const cleanup: any = []

  function makeStandardEnv(cb) {
    temp.mkdir(function(err, uploadDir) {
      if (err) {
        return cb(err)
      }

      cleanup.push(uploadDir)

      const storage = multer.diskStorage({
        destination: uploadDir,
        filename: generateFilename,
      })

      cb(null, {
        upload: multer({ storage: storage }),
        uploadDir: uploadDir,
        form: new FormData(),
      })
    })
  }

  after(function() {
    while (cleanup.length) {
      rimraf.sync(cleanup.pop())
    }
  })

  it('should upload the file to the `dest` dir', function(done) {
    makeStandardEnv(function(err, env) {
      if (err) {
        return done(err)
      }

      const parser = env.upload.single('small0')
      env.form.append('small0', file('small0.dat'))

      submitForm(parser, env.form, function(error, req) {
        assert.ifError(error)
        assert.ok(startsWith(req.file.path, env.uploadDir))
        assert.equal(req.file.size, fileSize(req.file.path))
        done()
      })
    })
  })

  it('should rename the uploaded file', function(done) {
    makeStandardEnv(function(err, env) {
      if (err) {
        return done(err)
      }

      const parser = env.upload.single('small0')
      env.form.append('small0', file('small0.dat'))

      submitForm(parser, env.form, function(error, req) {
        assert.ifError(error)
        assert.equal(req.file.filename, 'small0small0.dat')
        done()
      })
    })
  })

  it('should ensure all req.files values (single-file per field) point to an array', function(done) {
    makeStandardEnv(function(err, env) {
      if (err) {
        return done(err)
      }

      const parser = env.upload.single('tiny0')
      env.form.append('tiny0', file('tiny0.dat'))

      submitForm(parser, env.form, function(error, req) {
        assert.ifError(error)
        assert.equal(req.file.filename, 'tiny0tiny0.dat')
        done()
      })
    })
  })

  it('should ensure all req.files values (multi-files per field) point to an array', function(done) {
    makeStandardEnv(function(err, env) {
      if (err) {
        return done(err)
      }

      const parser = env.upload.array('themFiles', 2)
      env.form.append('themFiles', file('small0.dat'))
      env.form.append('themFiles', file('small1.dat'))

      submitForm(parser, env.form, function(error, req) {
        assert.ifError(error)
        assert.equal(req.files.length, 2)
        assert.equal(req.files[0].filename, 'themFilessmall0.dat')
        assert.equal(req.files[1].filename, 'themFilessmall1.dat')
        done()
      })
    })
  })

  it('should rename the destination directory to a different directory', function(done) {
    const storage = multer.diskStorage({
      destination: function(req, f, cb) {
        temp.template('testforme-%s').mkdir(function(err, uploadDir) {
          if (err) {
            return cb(err, '')
          }

          cleanup.push(uploadDir)
          cb(null, uploadDir)
        })
      },
      filename: generateFilename,
    })

    const form = new FormData()
    const upload = multer({ storage: storage })
    const parser = upload.array('themFiles', 2)

    form.append('themFiles', file('small0.dat'))
    form.append('themFiles', file('small1.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)
      assert.equal(req.files.length, 2)
      assert.ok(req.files[0].path.indexOf(path.sep + 'testforme-') >= 0)
      assert.ok(req.files[0].path.indexOf(path.sep + 'testforme-') >= 0)
      done()
    })
  })
})
