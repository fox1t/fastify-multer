import { IncomingMessage } from 'http'
import * as fp from 'fastify-plugin'
import { PluginOptions, nextCallback } from 'fastify-plugin'
import { FastifyInstance, FastifyRequest } from 'fastify'

const kMultipart = Symbol('multipart')

function setMultipart(req: IncomingMessage, done: (err: Error | null) => void) {
  // nothing to do, it will be done by multer in beforeHandler method
  ;(req as any)[kMultipart] = true
  done(null)
}

export function isMultipart(this: FastifyRequest<IncomingMessage>): boolean {
  return this.req[kMultipart] || false
}

function fastifyMulter(fastify: FastifyInstance, options: PluginOptions, next: nextCallback) {
  fastify.addContentTypeParser('multipart', setMultipart)
  fastify.decorateRequest('isMultipart', isMultipart)

  next()
}

export default fp(fastifyMulter, {
  fastify: '>= 2.0.0',
  name: 'fastify-multer',
})
