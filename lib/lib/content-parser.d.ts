/// <reference path="../types/fastify.d.ts" />
/// <reference types="node" />
/// <reference types="fastify" />
import { IncomingMessage } from 'http';
import fp from 'fastify-plugin';
export declare function isMultipart(): boolean;
declare const _default: import("fastify").Plugin<import("http").Server, IncomingMessage, import("http").ServerResponse, fp.PluginOptions>;
export default _default;
