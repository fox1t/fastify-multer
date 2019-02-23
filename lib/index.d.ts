/// <reference types="node" />
import { IncomingMessage, Server, ServerResponse } from 'http';
import { FastifyMiddleware } from 'fastify';
import fastifyPlugin from './lib/fastify-plugin';
import { Field, Options, FileFilter, StorageEngine } from './interfaces';
declare class Multer {
    storage: StorageEngine;
    limits: Options['limits'];
    preservePath: Options['preservePath'];
    fileFilter: FileFilter;
    contentParser: typeof fastifyPlugin;
    constructor(options: Options);
    private _makeBeforeHandler;
    single(name: string): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    array(name: string, maxCount?: number): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    fields(fields: Field[]): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    none(): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    any(): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
}
export declare function multer(options?: Options): Multer;
export default multer;
export { default as contentParser } from './lib/fastify-plugin';
export { default as diskStorage } from './storage/disk';
export { default as memoryStorage } from './storage/memory';
export { default as MulterError } from './lib/multer-error';
