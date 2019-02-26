"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const kMultipart = Symbol('multipart');
function setMultipart(req, done) {
    ;
    req[kMultipart] = true;
    done(null);
}
function isMultipart() {
    return this.req[kMultipart] || false;
}
exports.isMultipart = isMultipart;
function fastifyMulter(fastify, options, next) {
    fastify.addContentTypeParser('multipart', setMultipart);
    fastify.decorateRequest('isMultipart', isMultipart);
    next();
}
exports.default = fastify_plugin_1.default(fastifyMulter, {
    fastify: '>= 2.0.0',
    name: 'fastify-multer',
});
//# sourceMappingURL=content-parser.js.map