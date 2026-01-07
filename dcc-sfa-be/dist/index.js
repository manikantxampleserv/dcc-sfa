"use strict";
/**
 * Application entry point.
 * Handles environment setup and starts the server.
 *
 * @module index
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./server");
dotenv_1.default.config({ quiet: true });
/**
 * Suppresses DEP0123 warning for IP addresses in TLS connections.
 * This warning occurs when connecting to SQL Server with an IP address.
 */
process.on('warning', (warning) => {
    if (warning.message && warning.message.includes('DEP0123')) {
        return;
    }
    console.warn(warning.name, warning.message);
});
(0, server_1.startServer)();
//# sourceMappingURL=index.js.map