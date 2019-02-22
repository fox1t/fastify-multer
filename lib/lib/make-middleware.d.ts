/// <reference path="../types/fastify.d.ts" />
/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Setup } from '../interfaces';
declare function makeBeforeHandler(setup: Setup): (request: FastifyRequest<IncomingMessage, import("fastify").DefaultQuery, import("fastify").DefaultParams, import("fastify").DefaultHeaders, any>, reply: FastifyReply<ServerResponse>, next: (err?: Error | undefined) => void) => void;
export default makeBeforeHandler;
