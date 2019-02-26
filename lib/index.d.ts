/// <reference types="node" />
import { IncomingMessage, Server, ServerResponse } from 'http';
import { FastifyMiddleware } from 'fastify';
import diskStorage from './storage/disk';
import memoryStorage from './storage/memory';
import MulterError from './lib/multer-error';
import contentParser from './lib/content-parser';
import { Field, Options, FileFilter, StorageEngine } from './interfaces';
declare class Multer {
    storage: StorageEngine;
    limits: Options['limits'];
    preservePath: Options['preservePath'];
    fileFilter: FileFilter;
    contentParser: typeof contentParser;
    constructor(options: Options);
    private _makePreHandler;
    single(name: string): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    array(name: string, maxCount?: number): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    fields(fields: Field[]): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    none(): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
    any(): FastifyMiddleware<Server, IncomingMessage, ServerResponse>;
}
interface MulterFactory {
    (options?: Options | undefined): Multer;
    contentParser: typeof contentParser;
    diskStorage: typeof diskStorage;
    memoryStorage: typeof memoryStorage;
    MulterError: typeof MulterError;
    default: MulterFactory;
}
declare const _default: MulterFactory;
export = _default;
