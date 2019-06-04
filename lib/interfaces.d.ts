/// <reference types="node" />
import { IncomingMessage } from 'http';
import { FastifyRequest } from 'fastify';
import { Strategy } from './lib/file-appender';
export declare type FilesObject = {
    [fieldname: string]: Partial<File>[];
};
export interface Field {
    name: string;
    maxCount?: number;
}
export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size?: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
    stream?: NodeJS.ReadableStream;
}
export declare type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;
export declare type FileFilter = (req: FastifyRequest<IncomingMessage>, file: File, callback: FileFilterCallback) => void;
export interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?: FileFilter;
}
export interface StorageEngine {
    _handleFile(req: FastifyRequest<IncomingMessage>, file: File, callback: (error?: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: FastifyRequest<IncomingMessage>, file: File, callback: (error?: Error | null) => void): void;
}
export declare type GetFileName = (req: FastifyRequest<IncomingMessage>, file: File, callback: (error: Error | null, filename?: string) => void) => void;
export declare type GetDestination = (req: FastifyRequest<IncomingMessage>, file: File, callback: (error: Error | null, destination: string) => void) => void;
export interface DiskStorageOptions {
    destination?: string | GetDestination;
    filename?: GetFileName;
}
export declare type Setup = () => {
    storage: StorageEngine;
    limits: Options['limits'];
    preservePath: Options['preservePath'];
    fileFilter: FileFilter;
    fileStrategy: Strategy;
};
