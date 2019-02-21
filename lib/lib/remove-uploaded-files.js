"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeUploadedFiles(uploadedFiles, remove, cb) {
    const length = uploadedFiles.length;
    const errors = [];
    if (length === 0) {
        return cb(null, errors);
    }
    function handleFile(idx) {
        const file = uploadedFiles[idx];
        remove(file, function (err) {
            if (err) {
                err.file = file;
                err.field = file.fieldname;
                errors.push(err);
            }
            if (idx < length - 1) {
                handleFile(idx + 1);
            }
            else {
                cb(null, errors);
            }
        });
    }
    handleFile(0);
}
exports.default = removeUploadedFiles;
//# sourceMappingURL=remove-uploaded-files.js.map