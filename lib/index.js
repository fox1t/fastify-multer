"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const make_prehandler_1 = __importDefault(require("./lib/make-prehandler"));
const disk_1 = __importDefault(require("./storage/disk"));
const memory_1 = __importDefault(require("./storage/memory"));
const multer_error_1 = __importDefault(require("./lib/multer-error"));
const content_parser_1 = __importDefault(require("./lib/content-parser"));
function allowAll(req, file, cb) {
    cb(null, true);
}
class Multer {
    constructor(options) {
        if (options.storage) {
            this.storage = options.storage;
        }
        else if (options.dest) {
            this.storage = disk_1.default({ destination: options.dest });
        }
        else {
            this.storage = memory_1.default();
        }
        this.limits = options.limits;
        this.preservePath = options.preservePath;
        this.fileFilter = options.fileFilter || allowAll;
        this.contentParser = content_parser_1.default;
    }
    _makePreHandler(fields, fileStrategy) {
        const setup = () => {
            const fileFilter = this.fileFilter;
            const filesLeft = Object.create(null);
            fields.forEach(function (field) {
                if (typeof field.maxCount === 'number') {
                    filesLeft[field.name] = field.maxCount;
                }
                else {
                    filesLeft[field.name] = Infinity;
                }
            });
            function wrappedFileFilter(req, file, cb) {
                if ((filesLeft[file.fieldname] || 0) <= 0) {
                    return cb(new multer_error_1.default('LIMIT_UNEXPECTED_FILE', file.fieldname));
                }
                filesLeft[file.fieldname] -= 1;
                fileFilter(req, file, cb);
            }
            return {
                limits: this.limits,
                preservePath: this.preservePath,
                storage: this.storage,
                fileFilter: wrappedFileFilter,
                fileStrategy,
            };
        };
        return make_prehandler_1.default(setup);
    }
    single(name) {
        return this._makePreHandler([{ name, maxCount: 1 }], 'VALUE');
    }
    array(name, maxCount) {
        return this._makePreHandler([{ name, maxCount }], 'ARRAY');
    }
    fields(fields) {
        return this._makePreHandler(fields, 'OBJECT');
    }
    none() {
        return this._makePreHandler([], 'NONE');
    }
    any() {
        const setup = () => ({
            limits: this.limits,
            preservePath: this.preservePath,
            storage: this.storage,
            fileFilter: this.fileFilter,
            fileStrategy: 'ARRAY',
        });
        return make_prehandler_1.default(setup);
    }
}
const multer = function (options) {
    if (options === undefined) {
        return new Multer({});
    }
    if (typeof options === 'object' && options !== null) {
        return new Multer(options);
    }
    throw new TypeError('Expected object for argument options');
};
multer.contentParser = content_parser_1.default;
multer.diskStorage = disk_1.default;
multer.memoryStorage = memory_1.default;
multer.MulterError = multer_error_1.default;
multer.default = multer;
module.exports = multer;
//# sourceMappingURL=index.js.map