import { FastifyRequest } from 'fastify'
import { Strategy } from './lib/file-appender'

export type FilesObject = {
  [fieldname: string]: Partial<File>[]
}

export interface Field {
  /** The field name. */
  name: string
  /** Optional maximum number of files per field to accept. */
  maxCount?: number
}

export interface File {
  /** Field name specified in the form */
  fieldname: string
  /** Name of the file on the user's computer */
  originalname: string
  /** Encoding type of the file */
  encoding: string
  /** Mime type of the file */
  mimetype: string
  /** Size of the file in bytes */
  size?: number
  /** The folder to which the file has been saved (DiskStorage) */
  destination?: string
  /** The name of the file within the destination (DiskStorage) */
  filename?: string
  /** Location of the uploaded file (DiskStorage) */
  path?: string
  /** A Buffer of the entire file (MemoryStorage) */
  buffer?: Buffer
  stream?: NodeJS.ReadableStream
}

export type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void

export type FileFilter = (req: FastifyRequest, file: File, callback: FileFilterCallback) => void

export interface Options {
  /** The destination directory for the uploaded files. */
  dest?: string
  /** The storage engine to use for uploaded files. */
  storage?: StorageEngine
  /**
   * An object specifying the size limits of the following optional properties. This object is passed to busboy
   * directly, and the details of properties can be found on https://github.com/mscdex/busboy#busboy-methods
   */
  limits?: {
    /** Max field name size (Default: 100 bytes) */
    fieldNameSize?: number
    /** Max field value size (Default: 1MB) */
    fieldSize?: number
    /** Max number of non- file fields (Default: Infinity) */
    fields?: number
    /** For multipart forms, the max file size (in bytes)(Default: Infinity) */
    fileSize?: number
    /** For multipart forms, the max number of file fields (Default: Infinity) */
    files?: number
    /** For multipart forms, the max number of parts (fields + files)(Default: Infinity) */
    parts?: number
    /** For multipart forms, the max number of header key=> value pairs to parse Default: 2000(same as node's http). */
    headerPairs?: number
  }
  /** Keep the full path of files instead of just the base name (Default: false) */
  preservePath?: boolean
  /** A function to control which files to upload and which to skip. */
  fileFilter?: FileFilter
}

export interface StorageEngine {
  _handleFile(
    req: FastifyRequest,
    file: File,
    callback: (error?: Error | null, info?: Partial<File>) => void,
  ): void
  _removeFile(req: FastifyRequest, file: File, callback: (error?: Error | null) => void): void
}

export type GetFileName = (
  req: FastifyRequest,
  file: File,
  callback: (error: Error | null, filename?: string) => void,
) => void

export type GetDestination = (
  req: FastifyRequest,
  file: File,
  callback: (error: Error | null, destination: string) => void,
) => void

export interface DiskStorageOptions {
  /** A function used to determine within which folder the uploaded files should be stored. Defaults to the system's default temporary directory. */
  destination?: string | GetDestination
  /** A function used to determine what the file should be named inside the folder. Defaults to a random name with no file extension. */
  filename?: GetFileName
}

export type Setup = () => {
  storage: StorageEngine
  limits: Options['limits']
  preservePath: Options['preservePath']
  fileFilter: FileFilter
  fileStrategy: Strategy
}
