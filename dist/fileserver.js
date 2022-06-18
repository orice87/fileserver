"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const api_module_1 = require("./api/api.module");
new api_module_1.ApiModule().init();
