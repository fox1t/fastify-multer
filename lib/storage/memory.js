"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const concat_stream_1 = __importDefault(require("concat-stream"));
class MemoryStorage {
    _handleFile(req, file, cb) {
        file.stream.pipe(concat_stream_1.default({ encoding: 'buffer' }, function (data) {
            cb(null, {
                buffer: data,
                size: data.length,
            });
        }));
    }
    _removeFile(req, file, cb) {
        delete file.buffer;
        cb(undefined);
    }
}
exports.default = () => new MemoryStorage();
//# sourceMappingURL=memory.js.map