import express from 'express';
import { GetFileName, GetDestination, DiskStorageOptions, File, StorageEngine } from '../interfaces';
declare class DiskStorage implements StorageEngine {
    getFilename: GetFileName;
    getDestination: GetDestination;
    constructor(opts: DiskStorageOptions);
    _handleFile(req: express.Request, file: File, cb: (error: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: express.Request, file: File, cb: (error?: Error) => void): void;
}
declare const _default: (opts: DiskStorageOptions) => DiskStorage;
export default _default;
