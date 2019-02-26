/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { FastifyReply } from 'fastify';
import { ExtendedFastifyRequest } from './file-appender';
import { Setup } from '../interfaces';
declare function makePreHandler(setup: Setup): (request: ExtendedFastifyRequest<IncomingMessage>, reply: FastifyReply<ServerResponse>, next: (err?: Error | undefined) => void) => void;
export default makePreHandler;
