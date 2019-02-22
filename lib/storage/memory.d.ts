/// <reference types="node" />
import { IncomingMessage } from 'http';
import { FastifyRequest } from 'fastify';
import { StorageEngine, File } from '../interfaces';
declare class MemoryStorage implements StorageEngine {
    _handleFile(req: FastifyRequest<IncomingMessage>, file: File, cb: (error: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: FastifyRequest<IncomingMessage>, file: File, cb: (error?: Error) => void): void;
}
declare const _default: () => MemoryStorage;
export default _default;
