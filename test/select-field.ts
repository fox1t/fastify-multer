import assert from 'assert'

import { file, submitForm } from './_util'
import multer from '../src'
import FormData from 'form-data'

function generateForm() {
  const form = new FormData()

  form.append('CA$|-|', file('empty.dat'))
  form.append('set-1', file('tiny0.dat'))
  form.append('set-1', file('empty.dat'))
  form.append('set-1', file('tiny1.dat'))
  form.append('set-2', file('tiny1.dat'))
  form.append('set-2', file('tiny0.dat'))
  form.append('set-2', file('empty.dat'))

  return form
}

function assertSet(files, setName, fileNames) {
  const len = fileNames.length

  assert.equal(files.length, len)

  for (let i = 0; i < len; i++) {
    assert.equal(files[i].fieldname, setName)
    assert.equal(files[i].originalname, fileNames[i])
  }
}

describe('Select Field', function() {
  let parser

  before(function() {
    parser = multer().fields([
      { name: 'CA$|-|', maxCount: 1 },
      { name: 'set-1', maxCount: 3 },
      { name: 'set-2', maxCount: 3 },
    ])
  })

  it('should select the first file with fieldname', function(done) {
    submitForm(parser, generateForm(), function(err, req) {
      assert.ifError(err)

      let f

      f = req.files['CA$|-|'][0]
      assert.equal(f.fieldname, 'CA$|-|')
      assert.equal(f.originalname, 'empty.dat')

      f = req.files['set-1'][0]
      assert.equal(f.fieldname, 'set-1')
      assert.equal(f.originalname, 'tiny0.dat')

      f = req.files['set-2'][0]
      assert.equal(f.fieldname, 'set-2')
      assert.equal(f.originalname, 'tiny1.dat')

      done()
    })
  })

  it('should select all files with fieldname', function(done) {
    submitForm(parser, generateForm(), function(err, req) {
      assert.ifError(err)

      assertSet(req.files['CA$|-|'], 'CA$|-|', ['empty.dat'])
      assertSet(req.files['set-1'], 'set-1', ['tiny0.dat', 'empty.dat', 'tiny1.dat'])
      assertSet(req.files['set-2'], 'set-2', ['tiny1.dat', 'tiny0.dat', 'empty.dat'])

      done()
    })
  })
})
