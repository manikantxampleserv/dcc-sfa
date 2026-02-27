"use strict";
/**
 * Application entry point.
 * Handles environment setup and starts the server.
 *
 * @module index
 */
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
require("./configs/env");
(0, server_1.startServer)();
//# sourceMappingURL=index.js.map