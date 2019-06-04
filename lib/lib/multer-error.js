"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMessages = {
    LIMIT_PART_COUNT: 'Too many parts',
    LIMIT_FILE_SIZE: 'File too large',
    LIMIT_FILE_COUNT: 'Too many files',
    LIMIT_FIELD_KEY: 'Field name too long',
    LIMIT_FIELD_VALUE: 'Field value too long',
    LIMIT_FIELD_COUNT: 'Too many fields',
    LIMIT_UNEXPECTED_FILE: 'Unexpected field',
};
class MulterError extends Error {
    constructor(code, field) {
        super();
        this.field = undefined;
        this.name = this.constructor.name;
        this.message = errorMessages[code];
        this.code = code;
        if (field) {
            this.field = field;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = MulterError;
//# sourceMappingURL=multer-error.js.map