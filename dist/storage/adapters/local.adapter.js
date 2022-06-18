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
exports.LocalAdapter = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
class LocalAdapter {
    constructor() {
        this._loadConfig();
        this._checkStorageDirectory();
    }
    getReadFileStream(filename) {
        return (0, fs_1.createReadStream)(path_1.default.join(this._storageDirectory, filename));
    }
    getWriteFileStream(filename) {
        return (0, fs_1.createWriteStream)(path_1.default.join(this._storageDirectory, filename));
    }
    removeFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, promises_1.unlink)(path_1.default.join(this._storageDirectory, filename));
        });
    }
    _checkStorageDirectory() {
        if (!(0, fs_1.existsSync)(this._storageDirectory))
            throw new Error("Storage directory '" + this._storageDirectory + "' does not exits.");
        try {
            (0, fs_1.accessSync)(this._storageDirectory, fs_1.constants.W_OK);
        }
        catch (err) {
            throw new Error("Missing access rights to storage directory: '" + this._storageDirectory + "'");
        }
    }
    _loadConfig() {
        if (!process.env.localStorageDirectory)
            throw new Error("Missing 'localStorageDirectory' in configuration.");
        this._storageDirectory = process.env.localStorageDirectory;
    }
}
exports.LocalAdapter = LocalAdapter;
