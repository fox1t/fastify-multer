/// <reference types="node" />
import { IncomingMessage } from 'http';
import { FastifyRequest } from 'fastify';
import { File, FilesObject } from '../interfaces';
import { isMultipart } from './content-parser';
declare type FilesInRequest = FilesObject | Partial<File>[];
export declare type Strategy = 'NONE' | 'VALUE' | 'ARRAY' | 'OBJECT';
declare type Placeholder = {
    fieldname: string;
};
export interface ExtendedFastifyRequest<T> extends FastifyRequest<T> {
    isMultipart: typeof isMultipart;
    file: File;
    files: FilesInRequest;
}
declare class FileAppender {
    strategy: Strategy;
    request: ExtendedFastifyRequest<IncomingMessage>;
    constructor(strategy: Strategy, request: ExtendedFastifyRequest<IncomingMessage>);
    insertPlaceholder(file: Pick<File, 'fieldname' | 'originalname' | 'encoding' | 'mimetype'>): {
        fieldname: string;
    };
    removePlaceholder(placeholder: Placeholder): void;
    replacePlaceholder(placeholder: Placeholder, file: File): void;
}
export default FileAppender;
