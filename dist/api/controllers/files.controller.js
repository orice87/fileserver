"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const express_1 = __importDefault(require("express"));
const storage_module_1 = require("../../storage/storage.module");
const metadata_module_1 = require("../../metadata/metadata.module");
const monitoring_module_1 = require("../../monitoring/monitoring.module");
const content_length_required_1 = require("../middlewares/content-length-required");
const content_type_required_1 = require("../middlewares/content-type-required");
class FilesController {
    constructor() {
        this._storageModule = new storage_module_1.StorageModule(storage_module_1.SupportedAdapters.local);
        this._metadataModule = new metadata_module_1.MetadataModule();
        this._monitoringModule = new monitoring_module_1.MonitoringModule();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._metadataModule._init();
            const router = express_1.default.Router();
            router.get("/space", this._getTotalSpaceUsed.bind(this));
            router.get("/:filename", this._downloadFileStream.bind(this));
            router.put("/:filename", content_length_required_1.contentLengthRequired, content_type_required_1.contentTypeRequired, this._uploadFileStream.bind(this));
            return router;
        });
    }
    _getTotalSpaceUsed(req, res) {
        return res.send({
            bytes: this._metadataModule.getTotalSpaceUsed()
        });
    }
    _downloadFileStream(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = req.params.filename;
            const metadata = yield this._metadataModule.findMetadataByFileName(filename);
            if (!metadata)
                return res.sendStatus(404);
            const downloadPromise = this._prepareStreamDownloadPromise(res, metadata);
            try {
                yield downloadPromise;
                return res;
            }
            catch (err) {
                return res.status(500).send(err);
            }
        });
    }
    _uploadFileStream(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = req.params.filename;
            const size = parseInt(req.headers["content-length"]); //we made sure that content-length is filled via a middleware
            const contentType = req.headers["content-type"]; //we made sure that content-length is filled via a middleware
            const metadata = {
                filename,
                size,
                contentType,
                uploadedAt: new Date()
            };
            const uploadPromise = this._prepareStreamUploadPromise(req, metadata);
            try {
                yield uploadPromise;
            }
            catch (err) {
                return res.status(500).send(err);
            }
            try {
                yield this._metadataModule.upsertMetadata(metadata);
                return res.send(metadata);
            }
            catch (err) {
                //Cleaning the mess if database fails
                yield this._storageModule.removeFile(filename);
                return res.status(500).send(err);
            }
        });
    }
    _prepareStreamUploadPromise(req, metadata) {
        const filename = metadata.filename;
        return new Promise((resolve, reject) => {
            const writableStream = this._storageModule.getWriteFileStream(filename);
            writableStream.on("error", err => {
                this._monitoringModule.fileUploadError(filename, err);
                reject(err);
            });
            writableStream.on("close", () => {
                this._monitoringModule.fileUploadFinished(filename, metadata.size);
                resolve();
            });
            writableStream.on("open", () => {
                this._monitoringModule.fileUploadStarted(filename, metadata.size);
                req.pipe(writableStream);
            });
        });
    }
    _prepareStreamDownloadPromise(res, metadata) {
        const filename = metadata.filename;
        const readableStream = this._storageModule.getReadFileStream(filename);
        return new Promise((resolve, reject) => {
            readableStream.on("error", err => {
                reject(err);
            });
            readableStream.on("open", () => {
                res.setHeader("Content-Length", metadata.size);
                res.setHeader("Content-Type", metadata.contentType);
                res.setHeader("Content-Disposition", "attachment; filename='" + filename + "'");
                readableStream.pipe(res);
            });
            readableStream.on("close", () => {
                resolve();
            });
        });
    }
}
exports.FilesController = FilesController;
