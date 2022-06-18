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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataModule = void 0;
const mongodb_1 = require("mongodb");
const monitoring_module_1 = require("../monitoring/monitoring.module");
class MetadataModule {
    constructor() {
        this._monitoringModule = new monitoring_module_1.MonitoringModule();
        this._loadConfig();
    }
    upsertMetadata(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkInit();
            const result = yield this._metadataCollection.updateOne({ filename: metadata.filename }, { $set: metadata }, { upsert: true });
            if (result.upsertedId)
                this._totalSpaceUsed += metadata.size;
            else
                this._totalSpaceUsed = yield this._countTotalSpaceUsed();
            if (this._totalSpaceUsed > this._spaceUsedTreshold)
                this._monitoringModule.sizeTresholdExceeded(this._totalSpaceUsed, this._spaceUsedTreshold);
        });
    }
    getTotalSpaceUsed() {
        this._checkInit();
        return this._totalSpaceUsed;
    }
    findMetadataByFileName(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkInit();
            const result = yield this._metadataCollection.findOne({ filename });
            if (!result)
                return null;
            return {
                _id: result._id,
                filename: result.filename,
                size: result.size,
                contentType: result.contentType,
                uploadedAt: result.uploadedAt,
            };
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield mongodb_1.MongoClient.connect(this._connectionString);
                const db = client.db(this._databaseName);
                this._metadataCollection = db.collection("metadata");
                this._metadataCollection.createIndex({ filename: 1 });
                this._totalSpaceUsed = yield this._countTotalSpaceUsed();
                console.log("Database connection established successfully.");
            }
            catch (error) {
                console.log(error);
                throw new Error("Database connection failed!");
            }
        });
    }
    _countTotalSpaceUsed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._metadataCollection)
                throw new Error("Missing db connection. Metadata module was not initialized properly.");
            const result = yield this._metadataCollection.aggregate([{
                    $group: {
                        _id: null,
                        "totalSize": {
                            $sum: "$size"
                        }
                    }
                }]).next();
            return result ? result.totalSize : 0;
        });
    }
    _checkInit() {
        if (!this._metadataCollection)
            throw new Error("Missing db connection. Metadata module was not initialized properly.");
        if (!this._totalSpaceUsed && this._totalSpaceUsed !== 0)
            throw new Error("Sum of total space used was not calculated yet. Metadata module was not initialized properly.");
    }
    _loadConfig() {
        if (!process.env.mongoConnectionString)
            throw new Error("Missing 'mongoConnectionString' in configuration.");
        this._connectionString = process.env.mongoConnectionString;
        if (!process.env.mongoDatabaseName)
            throw new Error("Missing 'mongoDatabaseName' in configuration");
        this._databaseName = process.env.mongoDatabaseName;
        if (!process.env.spaceUsedTreshold)
            throw new Error("Missing 'spaceUsedTreshold' in configuration");
        this._spaceUsedTreshold = parseInt(process.env.spaceUsedTreshold);
    }
}
exports.MetadataModule = MetadataModule;
