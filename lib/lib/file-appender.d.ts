import express from 'express';
import { File } from '../interfaces';
export declare type Strategy = 'NONE' | 'VALUE' | 'ARRAY' | 'OBJECT';
declare type Placeholder = {
    fieldname: string;
};
declare class FileAppender {
    strategy: Strategy;
    req: express.Request;
    constructor(strategy: Strategy, req: express.Request);
    insertPlaceholder(file: Pick<File, 'fieldname' | 'originalname' | 'encoding' | 'mimetype'>): {
        fieldname: string;
    };
    removePlaceholder(placeholder: Placeholder): void;
    replacePlaceholder(placeholder: Placeholder, file: File): void;
}
export default FileAppender;
