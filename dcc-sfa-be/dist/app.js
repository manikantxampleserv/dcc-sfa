"use strict";
/**
 * Sets up middleware, routes, and application-level configurations.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const response_middleware_1 = require("./middlewares/response.middleware");
const routes_1 = __importDefault(require("./routes"));
/**
 * Creates and configures the Express application
 * @returns {Application} Configured Express application
 */
const createApp = () => {
    const app = (0, express_1.default)();
    app.set('trust proxy', true);
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({ origin: '*', credentials: true }));
    app.use(response_middleware_1.responseHandler);
    app.use('/api', routes_1.default);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map