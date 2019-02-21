import express from 'express';
import { StorageEngine, File } from '../interfaces';
declare class MemoryStorage implements StorageEngine {
    _handleFile(req: express.Request, file: File, cb: (error: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: express.Request, file: File, cb: (error?: Error) => void): void;
}
declare const _default: () => MemoryStorage;
export default _default;
