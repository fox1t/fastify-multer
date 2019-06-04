/// <reference types="node" />
import { IncomingMessage } from 'http';
import { FastifyRequest } from 'fastify';
import { GetFileName, GetDestination, DiskStorageOptions, File, StorageEngine } from '../interfaces';
declare class DiskStorage implements StorageEngine {
    getFilename: GetFileName;
    getDestination: GetDestination;
    constructor(opts: DiskStorageOptions);
    _handleFile(req: FastifyRequest<IncomingMessage>, file: File, cb: (error: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: FastifyRequest<IncomingMessage>, file: File, cb: (error?: Error | null) => void): void;
}
declare const _default: (opts: DiskStorageOptions) => DiskStorage;
export default _default;
