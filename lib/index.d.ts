/// <reference path="types/fastify.d.ts" />
/// <reference types="node" />
import { IncomingMessage, Server, ServerResponse } from 'http';
import { FastifyRequest, FastifyMiddleware } from 'fastify';
import { Field, Options, FileFilter, StorageEngine } from './interfaces';
import { Strategy } from './lib/file-appender';
declare class Multer {
    storage: StorageEngine;
    limits: Options['limits'];
    preservePath: Options['preservePath'];
    fileFilter: FileFilter;
    constructor(options: Options);
    _makeMiddleware(fields: Field[], fileStrategy: Strategy): (request: FastifyRequest<IncomingMessage, import("fastify").DefaultQuery, import("fastify").DefaultParams, import("fastify").DefaultHeaders, any>, reply: import("fastify").FastifyReply<ServerResponse>, next: (err?: Error | undefined) => void) => void;
    single(name: string): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    array(name: string, maxCount: number): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    fields(fields: Field[]): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    none(): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    any(): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
}
export declare function multer(options?: Options): Multer;
export default multer;
export { default as diskStorage } from './storage/disk';
export { default as memoryStorage } from './storage/memory';
export { default as MulterError } from './lib/multer-error';
