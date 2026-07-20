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
if (!process.env.DATABASE_URL) {
    const possiblePaths = [
        (0, path_1.resolve)(process.cwd(), '.env'),
        (0, path_1.resolve)(__dirname, '../.env'),
        (0, path_1.resolve)(__dirname, '../../../.env'),
        '.env',
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
        const app = await (0, app_1.createApp)();
        if (await (0, killPort_1.isPortInUse)(port)) {
            logger_1.default.warn(`Port ${port} is in use. Attempting to kill existing processes...`);
            await (0, killPort_1.killPort)(port);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        app.listen(port, async () => {
            attendance_cron_service_1.AttendanceCronService.startAutoPunchOut();
            attendance_cron_service_1.AttendanceCronService.startMidnightStatusReset();
            attendance_cron_service_1.AttendanceCronService.startRequestLogsCleanup();
            logger_1.default.info(`Server running at http://localhost:${port}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
//# sourceMappingURL=server.js.map