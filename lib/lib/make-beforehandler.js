"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_is_1 = __importDefault(require("type-is"));
const busboy_1 = __importDefault(require("busboy"));
const xtend_1 = __importDefault(require("xtend"));
const on_finished_1 = __importDefault(require("on-finished"));
const append_field_1 = __importDefault(require("append-field"));
const counter_1 = __importDefault(require("./counter"));
const multer_error_1 = __importDefault(require("./multer-error"));
const file_appender_1 = __importDefault(require("./file-appender"));
const remove_uploaded_files_1 = __importDefault(require("./remove-uploaded-files"));
function drainStream(stream) {
    stream.on('readable', stream.read.bind(stream));
}
function makeBeforeHandler(setup) {
    return function multerBeforeHandler(request, reply, next) {
        if (!type_is_1.default(request.req, ['multipart'])) {
            return next();
        }
        const options = setup();
        const limits = options.limits;
        const storage = options.storage;
        const fileFilter = options.fileFilter;
        const fileStrategy = options.fileStrategy;
        const preservePath = options.preservePath;
        request.body = Object.create(null);
        let busboy;
        try {
            busboy = new busboy_1.default({
                headers: request.req.headers,
                limits: limits,
                preservePath: preservePath,
            });
        }
        catch (err) {
            return next(err);
        }
        const appender = new file_appender_1.default(fileStrategy, request);
        let isDone = false;
        let readFinished = false;
        let errorOccured = false;
        const pendingWrites = new counter_1.default();
        const uploadedFiles = [];
        function done(err) {
            if (isDone) {
                return;
            }
            isDone = true;
            request.req.unpipe(busboy);
            drainStream(request.req);
            busboy.removeAllListeners();
            on_finished_1.default(request.req, function () {
                next(err);
            });
        }
        function indicateDone() {
            if (readFinished && pendingWrites.isZero() && !errorOccured) {
                done();
            }
        }
        function abortWithError(uploadError) {
            if (errorOccured) {
                return;
            }
            errorOccured = true;
            pendingWrites.onceZero(function () {
                function remove(file, cb) {
                    storage._removeFile(request, file, cb);
                }
                remove_uploaded_files_1.default(uploadedFiles, remove, function (err, storageErrors) {
                    if (err) {
                        return done(err);
                    }
                    uploadError.storageErrors = storageErrors;
                    done(uploadError);
                });
            });
        }
        function abortWithCode(code, optionalField) {
            abortWithError(new multer_error_1.default(code, optionalField));
        }
        busboy.on('field', function (fieldname, value, fieldnameTruncated, valueTruncated) {
            if (fieldnameTruncated) {
                return abortWithCode('LIMIT_FIELD_KEY');
            }
            if (valueTruncated) {
                return abortWithCode('LIMIT_FIELD_VALUE', fieldname);
            }
            if (limits && limits.hasOwnProperty('fieldNameSize')) {
                if (fieldname.length > limits.fieldNameSize) {
                    return abortWithCode('LIMIT_FIELD_KEY');
                }
            }
            append_field_1.default(request.body, fieldname, value);
        });
        busboy.on('file', function (fieldname, fileStream, filename, encoding, mimetype) {
            if (!filename) {
                return fileStream.resume();
            }
            if (limits && limits.hasOwnProperty('fieldNameSize')) {
                if (fieldname.length > limits.fieldNameSize) {
                    return abortWithCode('LIMIT_FIELD_KEY');
                }
            }
            const file = {
                fieldname: fieldname,
                originalname: filename,
                encoding: encoding,
                mimetype: mimetype,
            };
            const placeholder = appender.insertPlaceholder(file);
            fileFilter(request, file, function (err, includeFile) {
                if (err) {
                    appender.removePlaceholder(placeholder);
                    return abortWithError(err);
                }
                if (!includeFile) {
                    appender.removePlaceholder(placeholder);
                    return fileStream.resume();
                }
                let aborting = false;
                pendingWrites.increment();
                Object.defineProperty(file, 'stream', {
                    configurable: true,
                    enumerable: false,
                    value: fileStream,
                });
                fileStream.on('error', function (error) {
                    pendingWrites.decrement();
                    abortWithError(error);
                });
                fileStream.on('limit', function () {
                    aborting = true;
                    abortWithCode('LIMIT_FILE_SIZE', fieldname);
                });
                storage._handleFile(request, file, function (error, info) {
                    if (aborting) {
                        appender.removePlaceholder(placeholder);
                        uploadedFiles.push(xtend_1.default(file, info));
                        return pendingWrites.decrement();
                    }
                    if (error) {
                        appender.removePlaceholder(placeholder);
                        pendingWrites.decrement();
                        return abortWithError(error);
                    }
                    const fileInfo = xtend_1.default(file, info);
                    appender.replacePlaceholder(placeholder, fileInfo);
                    uploadedFiles.push(fileInfo);
                    pendingWrites.decrement();
                    indicateDone();
                });
            });
        });
        busboy.on('error', function (err) {
            abortWithError(err);
        });
        busboy.on('partsLimit', function () {
            abortWithCode('LIMIT_PART_COUNT');
        });
        busboy.on('filesLimit', function () {
            abortWithCode('LIMIT_FILE_COUNT');
        });
        busboy.on('fieldsLimit', function () {
            abortWithCode('LIMIT_FIELD_COUNT');
        });
        busboy.on('finish', function () {
            readFinished = true;
            indicateDone();
        });
        request.req.pipe(busboy);
    };
}
exports.default = makeBeforeHandler;
//# sourceMappingURL=make-beforehandler.js.map