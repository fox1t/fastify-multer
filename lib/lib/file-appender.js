"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function arrayRemove(arr, item) {
    const idx = arr.indexOf(item);
    if (~idx) {
        arr.splice(idx, 1);
    }
}
class FileAppender {
    constructor(strategy, request) {
        this.strategy = strategy;
        this.request = request;
        switch (strategy) {
            case 'NONE':
                break;
            case 'VALUE':
                break;
            case 'ARRAY':
                request.files = [];
                break;
            case 'OBJECT':
                request.files = Object.create(null);
                break;
            default:
                throw new Error('Unknown file strategy: ' + strategy);
        }
    }
    insertPlaceholder(file) {
        const placeholder = {
            fieldname: file.fieldname,
        };
        switch (this.strategy) {
            case 'NONE':
                break;
            case 'VALUE':
                break;
            case 'ARRAY':
                ;
                this.request.files.push(placeholder);
                break;
            case 'OBJECT':
                if (this.request.files[file.fieldname]) {
                    ;
                    this.request.files[file.fieldname].push(placeholder);
                }
                else {
                    ;
                    this.request.files[file.fieldname] = [placeholder];
                }
                break;
        }
        return placeholder;
    }
    removePlaceholder(placeholder) {
        switch (this.strategy) {
            case 'NONE':
                break;
            case 'VALUE':
                break;
            case 'ARRAY':
                arrayRemove(this.request.files, placeholder);
                break;
            case 'OBJECT':
                if (this.request.files[placeholder.fieldname].length === 1) {
                    delete this.request.files[placeholder.fieldname];
                }
                else {
                    arrayRemove(this.request.files[placeholder.fieldname], placeholder);
                }
                break;
        }
    }
    replacePlaceholder(placeholder, file) {
        if (this.strategy === 'VALUE') {
            this.request.file = file;
            return;
        }
        delete placeholder.fieldname;
        Object.assign(placeholder, file);
    }
}
exports.default = FileAppender;
//# sourceMappingURL=file-appender.js.map