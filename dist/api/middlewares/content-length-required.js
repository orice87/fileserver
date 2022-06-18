"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentLengthRequired = void 0;
function contentLengthRequired(req, res, next) {
    if (!req.headers['content-length'])
        return res.status(400).send("Missing content-length header.");
    next();
}
exports.contentLengthRequired = contentLengthRequired;
