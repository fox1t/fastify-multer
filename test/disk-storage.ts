import assert from 'assert'

import fs from 'fs'
import path from 'path'
import { file, fileSize, submitForm } from './_util'
import multer from '../lib'
import temp from 'fs-temp'
import rimraf from 'rimraf'
import FormData from 'form-data'

describe('Disk Storage', function() {
  let uploadDir, upload

  beforeEach(function(done) {
    temp.mkdir(function(err, p) {
      if (err) {
        return done(err)
      }

      uploadDir = p
      upload = multer({ dest: p })
      done()
    })
  })

  afterEach(function(done) {
    rimraf(uploadDir, done)
  })

  it('should process parser/form-data POST request', function(done) {
    const form = new FormData()
    const parser = upload.single('small0')

    form.append('name', 'Multer')
    form.append('small0', file('small0.dat'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)

      assert.equal(req.body.name, 'Multer')

      assert.equal(req.file.fieldname, 'small0')
      assert.equal(req.file.originalname, 'small0.dat')
      assert.equal(req.file.size, fileSize(req.file.path))
      done()
    })
  })

  it('should process empty fields and an empty file', function(done) {
    const form = new FormData()
    const parser = upload.single('empty')

    form.append('empty', file('empty.dat'))
    form.append('name', 'Multer')
    form.append('version', '')
    form.append('year', '')
    form.append('checkboxfull', 'cb1')
    form.append('checkboxfull', 'cb2')
    form.append('checkboxhalfempty', 'cb1')
    form.append('checkboxhalfempty', '')
    form.append('checkboxempty', '')
    form.append('checkboxempty', '')

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)

      assert.equal(req.body.name, 'Multer')
      assert.equal(req.body.version, '')
      assert.equal(req.body.year, '')

      assert.deepEqual(req.body.checkboxfull, ['cb1', 'cb2'])
      assert.deepEqual(req.body.checkboxhalfempty, ['cb1', ''])
      assert.deepEqual(req.body.checkboxempty, ['', ''])

      assert.equal(req.file.fieldname, 'empty')
      assert.equal(req.file.originalname, 'empty.dat')
      assert.equal(req.file.size, 0)
      assert.equal(fileSize(req.file.path), 0)

      done()
    })
  })

  it('should process multiple files', function(done) {
    const form = new FormData()
    const parser = upload.fields([
      { name: 'empty', maxCount: 1 },
      { name: 'tiny0', maxCount: 1 },
      { name: 'tiny1', maxCount: 1 },
      { name: 'small0', maxCount: 1 },
      { name: 'small1', maxCount: 1 },
      { name: 'medium', maxCount: 1 },
      { name: 'large', maxCount: 1 },
    ])

    form.append('empty', file('empty.dat'))
    form.append('tiny0', file('tiny0.dat'))
    form.append('tiny1', file('tiny1.dat'))
    form.append('small0', file('small0.dat'))
    form.append('small1', file('small1.dat'))
    form.append('medium', file('medium.dat'))
    form.append('large', file('large.jpg'))

    submitForm(parser, form, function(err, req) {
      assert.ifError(err)

      assert.deepEqual(req.body, {})

      assert.equal(req.files['empty'][0].fieldname, 'empty')
      assert.equal(req.files['empty'][0].originalname, 'empty.dat')
      assert.equal(req.files['empty'][0].size, 0)
      assert.equal(fileSize(req.files['empty'][0].path), 0)

      assert.equal(req.files['tiny0'][0].fieldname, 'tiny0')
      assert.equal(req.files['tiny0'][0].originalname, 'tiny0.dat')
      assert.equal(req.files['tiny0'][0].size, fileSize(req.files['tiny0'][0].path))

      assert.equal(req.files['tiny1'][0].fieldname, 'tiny1')
      assert.equal(req.files['tiny1'][0].originalname, 'tiny1.dat')
      assert.equal(req.files['tiny1'][0].size, 7)
      assert.equal(fileSize(req.files['tiny1'][0].path), 7)

      assert.equal(req.files['small0'][0].fieldname, 'small0')
      assert.equal(req.files['small0'][0].originalname, 'small0.dat')
      assert.equal(req.files['small0'][0].size, fileSize(req.files['small0'][0].path))

      assert.equal(req.files['small1'][0].fieldname, 'small1')
      assert.equal(req.files['small1'][0].originalname, 'small1.dat')
      assert.equal(req.files['small1'][0].size, fileSize(req.files['small1'][0].path))

      assert.equal(req.files['medium'][0].fieldname, 'medium')
      assert.equal(req.files['medium'][0].originalname, 'medium.dat')
      assert.equal(req.files['medium'][0].size, fileSize(req.files['medium'][0].path))

      assert.equal(req.files['large'][0].fieldname, 'large')
      assert.equal(req.files['large'][0].originalname, 'large.jpg')
      assert.equal(req.files['large'][0].size, 2413677)
      assert.equal(fileSize(req.files['large'][0].path), 2413677)

      done()
    })
  })

  it('should remove uploaded files on error', function(done) {
    const form = new FormData()
    const parser = upload.single('tiny0')

    form.append('tiny0', file('tiny0.dat'))
    form.append('small0', file('small0.dat'))

    submitForm(parser, form, function(err, _req) {
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(err.field, 'small0')
      assert.deepEqual(err.storageErrors, [])

      const files = fs.readdirSync(uploadDir)
      assert.deepEqual(files, [])

      done()
    })
  })

  it("should report error when directory doesn't exist", function(done) {
    const directory = path.join(temp.mkdirSync(), 'ghost')
    function dest(_$0, _$1, cb) {
      cb(null, directory)
    }

    const storage = multer.diskStorage({ destination: dest })
    const localUpload = multer({ storage: storage })
    const parser = localUpload.single('tiny0')
    const form = new FormData()

    form.append('tiny0', file('tiny0.dat'))

    submitForm(parser, form, function(err, _req) {
      assert.equal(err.code, 'ENOENT')
      assert.equal(path.dirname(err.path), directory)

      done()
    })
  })
})
