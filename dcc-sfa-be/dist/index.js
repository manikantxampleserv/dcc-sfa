"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
    override: true,
});
(0, server_1.startServer)();
//# sourceMappingURL=index.js.map