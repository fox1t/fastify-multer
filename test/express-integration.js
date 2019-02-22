/* eslint-env mocha */

var assert = require('assert')

var { multer } = require('../lib')
var util = require('./_util')

var Fastify = require('fastify')
var FormData = require('form-data')
var concat = require('concat-stream')
var onFinished = require('on-finished')

describe('Express Integration', function () {
  function submitForm (form, path, port, cb) {
    var req = form.submit('http://localhost:' + port + path)

    req.on('error', cb)
    req.on('response', function (res) {
      res.on('error', cb)
      res.pipe(
        concat({ encoding: 'buffer' }, function (body) {
          onFinished(req, function () {
            cb(null, res, body)
          })
        })
      )
    })
  }

  it('should work with express error handling', function (done) {
    var limits = { fileSize: 200 }
    var upload = multer({ limits: limits })
    var form = new FormData()

    var routeCalled = 0
    var errorCalled = 0

    form.append('avatar', util.file('large.jpg'))
    const fastify = Fastify()

    fastify.setErrorHandler(function (error, request, reply) {
      assert.equal(error.code, 'LIMIT_FILE_SIZE')

      errorCalled++
      reply.code(500).end('ERROR')
    })

    fastify.route({
      method: 'POST',
      url: '/t1/profile',
      preHandler: upload.single('avatar'),
      handler: function (req, res, next) {
        routeCalled++
        res.code(200).end('SUCCESS')
      }
    })

    fastify.listen(34279, done)

    submitForm(form, '/t1/profile', 34279, function (err, res, body) {
      assert.ifError(err)

      assert.equal(routeCalled, 0)
      assert.equal(errorCalled, 1)
      assert.equal(body.toString(), 'ERROR')
      assert.equal(res.statusCode, 500)

      fastify.close()
      done()
    })
  })

  it('should work when receiving error from fileFilter', function (done) {
    function fileFilter (req, file, cb) {
      cb(new Error('TEST'))
    }

    var upload = multer({ fileFilter: fileFilter })
    const fastify = Fastify()
    var form = new FormData()

    var routeCalled = 0
    var errorCalled = 0

    form.append('avatar', util.file('large.jpg'))

    fastify.setErrorHandler(function (error, request, reply) {
      assert.equal(error.message, 'TEST')

      errorCalled++
      reply.status(500).end('ERROR')
    })

    fastify.route({
      method: 'POST',
      url: '/t2/profile',
      preHandler: upload.single('avatar'),
      handler: function (req, res, next) {
        routeCalled++
        res.code(200).end('SUCCESS')
      }
    })

    fastify.listen(34280, done)

    submitForm(form, '/t2/profile', 34280, function (err, res, body) {
      assert.ifError(err)

      assert.equal(routeCalled, 0)
      assert.equal(errorCalled, 1)
      assert.equal(body.toString(), 'ERROR')
      assert.equal(res.statusCode, 500)
      fastify.close()
      done()
    })
  })
})
