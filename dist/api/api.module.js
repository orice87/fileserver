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
exports.ApiModule = void 0;
const express_1 = __importDefault(require("express"));
const files_controller_1 = require("./controllers/files.controller");
class ApiModule {
    constructor(_filesController = new files_controller_1.FilesController()) {
        this._filesController = _filesController;
        this._loadConfig();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = (0, express_1.default)();
            server.use("/files", yield this._filesController.init());
            server.listen(this._port, () => {
                console.log("API Service has started on :" + this._port);
            });
        });
    }
    _loadConfig() {
        if (!process.env.port)
            throw new Error("Missing 'port' in configuration.");
        this._port = parseInt(process.env.port);
    }
}
exports.ApiModule = ApiModule;
