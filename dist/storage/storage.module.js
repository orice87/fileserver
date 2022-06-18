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
exports.StorageModule = exports.SupportedAdapters = void 0;
const local_adapter_1 = require("./adapters/local.adapter");
var SupportedAdapters;
(function (SupportedAdapters) {
    SupportedAdapters["local"] = "local";
})(SupportedAdapters = exports.SupportedAdapters || (exports.SupportedAdapters = {}));
class StorageModule {
    constructor(adapterName) {
        switch (adapterName) {
            case (SupportedAdapters.local):
                this._adapter = new local_adapter_1.LocalAdapter();
                break;
        }
    }
    getWriteFileStream(filename) {
        return this._adapter.getWriteFileStream(filename);
    }
    getReadFileStream(filename) {
        return this._adapter.getReadFileStream(filename);
    }
    removeFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._adapter.removeFile(filename);
        });
    }
}
exports.StorageModule = StorageModule;
