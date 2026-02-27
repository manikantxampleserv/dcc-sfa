"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const logger_1 = __importDefault(require("./configs/logger"));
const killPort_1 = require("./utils/killPort");
const attendance_cron_service_1 = require("./v1/services/attendance.cron.service");
const path_1 = require("path");
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
const startServer = async () => {
    const port = process.env.PORT || 4000;
    try {
        const app = (0, app_1.createApp)();
        if (await (0, killPort_1.isPortInUse)(port)) {
            logger_1.default.warn(`Port ${port} is in use. Attempting to kill existing processes...`);
            await (0, killPort_1.killPort)(port);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const server = app.listen(port, async () => {
            attendance_cron_service_1.AttendanceCronService.startAutoPunchOut();
            attendance_cron_service_1.AttendanceCronService.startMidnightStatusReset();
            logger_1.default.info('Attendance cron jobs started');
            logger_1.default.success(`Server running at http://localhost:${port}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
//# sourceMappingURL=server.js.map