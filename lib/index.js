"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_beforehandler_1 = __importDefault(require("./lib/make-beforehandler"));
const disk_1 = __importDefault(require("./storage/disk"));
const memory_1 = __importDefault(require("./storage/memory"));
const multer_error_1 = __importDefault(require("./lib/multer-error"));
const fastify_plugin_1 = __importDefault(require("./lib/fastify-plugin"));
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
        this.contentParser = fastify_plugin_1.default;
    }
    _makeBeforeHandler(fields, fileStrategy) {
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
        return make_beforehandler_1.default(setup);
    }
    single(name) {
        return this._makeBeforeHandler([{ name, maxCount: 1 }], 'VALUE');
    }
    array(name, maxCount) {
        return this._makeBeforeHandler([{ name, maxCount }], 'ARRAY');
    }
    fields(fields) {
        return this._makeBeforeHandler(fields, 'OBJECT');
    }
    none() {
        return this._makeBeforeHandler([], 'NONE');
    }
    any() {
        const setup = () => ({
            limits: this.limits,
            preservePath: this.preservePath,
            storage: this.storage,
            fileFilter: this.fileFilter,
            fileStrategy: 'ARRAY',
        });
        return make_beforehandler_1.default(setup);
    }
}
function multer(options) {
    if (options === undefined) {
        return new Multer({});
    }
    if (typeof options === 'object' && options !== null) {
        return new Multer(options);
    }
    throw new TypeError('Expected object for argument options');
}
exports.multer = multer;
exports.default = multer;
var fastify_plugin_2 = require("./lib/fastify-plugin");
exports.contentParser = fastify_plugin_2.default;
var disk_2 = require("./storage/disk");
exports.diskStorage = disk_2.default;
var memory_2 = require("./storage/memory");
exports.memoryStorage = memory_2.default;
var multer_error_2 = require("./lib/multer-error");
exports.MulterError = multer_error_2.default;
//# sourceMappingURL=index.js.map