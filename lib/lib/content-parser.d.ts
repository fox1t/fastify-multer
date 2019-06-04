/// <reference path="../../typings/fastify/index.d.ts" />
/// <reference types="node" />
import { IncomingMessage } from 'http';
import fp from 'fastify-plugin';
import { FastifyRequest } from 'fastify';
export declare function isMultipart(this: FastifyRequest<IncomingMessage>): boolean;
declare const _default: import("fastify").Plugin<import("http").Server, IncomingMessage, import("http").ServerResponse, fp.PluginOptions>;
export default _default;
