/// <reference types="node" />
import { IncomingMessage } from 'http';
import { FastifyRequest } from 'fastify';
import { File } from '../interfaces';
export declare type Strategy = 'NONE' | 'VALUE' | 'ARRAY' | 'OBJECT';
declare type Placeholder = {
    fieldname: string;
};
declare class FileAppender {
    strategy: Strategy;
    request: FastifyRequest<IncomingMessage>;
    constructor(strategy: Strategy, request: FastifyRequest<IncomingMessage>);
    insertPlaceholder(file: Pick<File, 'fieldname' | 'originalname' | 'encoding' | 'mimetype'>): {
        fieldname: string;
    };
    removePlaceholder(placeholder: Placeholder): void;
    replacePlaceholder(placeholder: Placeholder, file: File): void;
}
export default FileAppender;
