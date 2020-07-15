import { IncomingMessage } from 'http'
import fp from 'fastify-plugin'
import { PluginOptions } from 'fastify-plugin'
import { FastifyInstance, FastifyRequest } from 'fastify'

const kMultipart = Symbol('multipart')

function setMultipart(
  req: FastifyRequest,
  _payload: IncomingMessage,
  done: (err: Error | null) => void,
) {
  // nothing to do, it will be done by multer in beforeHandler method
  ;(req as any)[kMultipart] = true
  done(null)
}

export function isMultipart(this: FastifyRequest): boolean {
  return (this.raw as any)[kMultipart] || false
}

function fastifyMulter(
  fastify: FastifyInstance,
  _options: PluginOptions,
  next: (err?: Error) => void,
) {
  fastify.addContentTypeParser('multipart', setMultipart)
  fastify.decorateRequest('isMultipart', isMultipart)

  next()
}

const multer = fp(fastifyMulter, {
  fastify: '>= 3.0.0',
  name: 'fastify-multer',
})

export default multer
