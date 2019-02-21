"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const crypto_1 = __importDefault(require("crypto"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const getFilename = (req, file, cb) => {
    crypto_1.default.randomBytes(16, function (err, raw) {
        cb(err, err ? undefined : raw.toString('hex'));
    });
};
const getDestination = (req, file, cb) => {
    cb(null, os_1.default.tmpdir());
};
class DiskStorage {
    constructor(opts) {
        this.getFilename = opts.filename || getFilename;
        if (typeof opts.destination === 'string') {
            mkdirp_1.default.sync(opts.destination);
            this.getDestination = function ($0, $1, cb) {
                cb(null, opts.destination);
            };
        }
        else {
            this.getDestination = opts.destination || getDestination;
        }
    }
    _handleFile(req, file, cb) {
        this.getDestination(req, file, (err, destination) => {
            if (err) {
                return cb(err);
            }
            this.getFilename(req, file, function (error, filename) {
                if (error) {
                    return cb(error);
                }
                const finalPath = path_1.join(destination, filename);
                const outStream = fs_1.createWriteStream(finalPath);
                file.stream.pipe(outStream);
                outStream.on('error', cb);
                outStream.on('finish', function () {
                    cb(null, {
                        destination: destination,
                        filename: filename,
                        path: finalPath,
                        size: outStream.bytesWritten,
                    });
                });
            });
        });
    }
    _removeFile(req, file, cb) {
        const path = file.path;
        delete file.destination;
        delete file.filename;
        delete file.path;
        fs_1.unlink(path, cb);
    }
}
exports.default = (opts) => new DiskStorage(opts);
//# sourceMappingURL=disk.js.map