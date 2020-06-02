import { IncomingMessage } from 'http'
import fp = require('fastify-plugin')
import { PluginOptions, nextCallback } from 'fastify-plugin'
import { FastifyInstance, FastifyRequest } from 'fastify'

const kMultipart = Symbol('multipart')

function setMultipart(req: IncomingMessage, done: (err: Error | null) => void) {
  // nothing to do, it will be done by multer in beforeHandler method
  ;(req as any)[kMultipart] = true
  done(null)
}

export function isMultipart(this: FastifyRequest<IncomingMessage>): boolean {
  return (this.req as any)[kMultipart] || false
}

function fastifyMulter(fastify: FastifyInstance, _options: PluginOptions, next: nextCallback) {
  fastify.addContentTypeParser('multipart', setMultipart)
  fastify.decorateRequest('isMultipart', isMultipart)

  next()
}

const multer = fp(fastifyMulter, {
  fastify: '>= 2.0.0',
  name: 'fastify-multer',
})

export default multer
