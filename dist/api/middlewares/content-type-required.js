"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentTypeRequired = void 0;
function contentTypeRequired(req, res, next) {
    if (!req.headers['content-type'])
        return res.status(400).send("Missing content-type header.");
    next();
}
exports.contentTypeRequired = contentTypeRequired;
