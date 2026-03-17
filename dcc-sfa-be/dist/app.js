"use strict";
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
const customerCategoryAssignment_job_1 = require("./jobs/customerCategoryAssignment.job");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const server_1 = require("./graphql/server");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./configs/swagger");
// First check if DATABASE_URL is already set in environment variables
if (!process.env.DATABASE_URL) {
    // Load environment variables from the root directory
    const possiblePaths = [
        (0, path_1.resolve)(process.cwd(), '.env'), // Current working directory
        (0, path_1.resolve)(__dirname, '../.env'), // Relative to compiled file
        (0, path_1.resolve)(__dirname, '../../../.env'), // For production builds
        '.env', // Fallback
    ];
    for (const path of possiblePaths) {
        try {
            const result = dotenv_1.default.config({ path, quiet: true });
            if (result.error) {
                continue;
            }
            if (process.env.DATABASE_URL) {
                break;
            }
        }
        catch (error) {
            continue;
        }
    }
}
/**
 * Creates and configures the Express application
 * @returns {Promise<Application>} Configured Express application
 */
const createApp = async () => {
    const app = (0, express_1.default)();
    app.set('trust proxy', true);
    await (0, server_1.setupGraphQL)(app);
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({ origin: '*', credentials: true }));
    app.use(response_middleware_1.responseHandler);
    app.use('/api', routes_1.default);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
    (0, customerCategoryAssignment_job_1.scheduleCustomerCategoryAssignment)();
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map