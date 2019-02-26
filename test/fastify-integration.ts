import assert from 'assert'

import multer from '../src'
import { file } from './_util'
import { AddressInfo } from 'net'

import Fastify from 'fastify'
import FormData from 'form-data'
import concat from 'concat-stream'
import onFinished from 'on-finished'

describe('Fastify Integration', function() {
  function submitForm(form, path, port, cb) {
    const req = form.submit('http://localhost:' + port + path)

    req.on('error', cb)
    req.on('response', function(res) {
      res.on('error', cb)
      res.pipe(
        concat({ encoding: 'buffer' }, function(body) {
          onFinished(req, function() {
            cb(null, res, body)
          })
        }),
      )
    })
  }

  it('should work with fastify error handling', function(done) {
    const limits = { fileSize: 200 }
    const upload = multer({ limits: limits })
    const form = new FormData()

    let routeCalled = 0
    let errorCalled = 0

    form.append('avatar', file('large.jpg'))
    const fastify = Fastify()

    fastify.register(multer.contentParser)

    fastify.setErrorHandler(function(error: any, request, reply) {
      assert.equal(error.code, 'LIMIT_FILE_SIZE')

      errorCalled++
      reply.code(500).send('ERROR')
    })

    fastify.route({
      method: 'POST',
      url: '/t1/profile',
      preHandler: upload.single('avatar'),
      handler: function(request, reply) {
        routeCalled++
        reply.code(200).send('SUCCESS')
      },
    })

    fastify.listen(0, () => {
      submitForm(form, '/t1/profile', (fastify.server.address() as AddressInfo).port, function(
        err,
        res,
        body,
      ) {
        assert.ifError(err)

        assert.equal(routeCalled, 0)
        assert.equal(errorCalled, 1)
        assert.equal(body.toString(), 'ERROR')
        assert.equal(res.statusCode, 500)

        fastify.close(done)
      })
    })
  })

  it('should work when receiving error from fileFilter', function(done) {
    function fileFilter(req, _, cb) {
      cb(new Error('TEST'))
    }

    const upload = multer({ fileFilter: fileFilter })
    const fastify = Fastify()
    const form = new FormData()

    let routeCalled = 0
    let errorCalled = 0

    form.append('avatar', file('large.jpg'))

    fastify.register(multer.contentParser)

    fastify.setErrorHandler(function(error, request, reply) {
      assert.equal(error.message, 'TEST')

      errorCalled++
      reply.status(500).send('ERROR')
    })

    fastify.route({
      method: 'POST',
      url: '/t2/profile',
      preHandler: upload.single('avatar'),
      handler: function(request, reply) {
        routeCalled++
        reply.code(200).send('SUCCESS')
      },
    })

    fastify.listen(0, () => {
      submitForm(form, '/t2/profile', (fastify.server.address() as AddressInfo).port, function(
        err,
        res,
        body,
      ) {
        assert.ifError(err)

        assert.equal(routeCalled, 0)
        assert.equal(errorCalled, 1)
        assert.equal(body.toString(), 'ERROR')
        assert.equal(res.statusCode, 500)

        fastify.close(done)
      })
    })
  })
})
