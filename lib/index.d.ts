import express from 'express';
import { Field, Options, FileFilter, StorageEngine } from './interfaces';
import { Strategy } from './lib/file-appender';
declare class Multer {
    storage: StorageEngine;
    limits: Options['limits'];
    preservePath: Options['preservePath'];
    fileFilter: FileFilter;
    constructor(options: Options);
    _makeMiddleware(fields: Field[], fileStrategy: Strategy): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
    single(name: string): express.RequestHandler;
    array(name: string, maxCount: number): express.RequestHandler;
    fields(fields: Field[]): express.RequestHandler;
    none(): express.RequestHandler;
    any(): express.RequestHandler;
}
export declare function multer(options?: Options): Multer;
export default multer;
export { default as diskStorage } from './storage/disk';
export { default as memoryStorage } from './storage/memory';
export { default as MulterError } from './lib/multer-error';
