import { File } from '../interfaces';
export declare type RemoveUploadedFileError = {
    file?: File;
    field?: string;
} & Error;
declare function removeUploadedFiles(uploadedFiles: File[], remove: (file: File, cb: (error?: Error | null) => void) => void, cb: (err: Error | null, storageErrors: RemoveUploadedFileError[]) => void): void;
export default removeUploadedFiles;
