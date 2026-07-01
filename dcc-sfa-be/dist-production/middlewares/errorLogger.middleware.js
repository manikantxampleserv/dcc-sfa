"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = void 0;
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const errorLogger = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        const failedItems = body?.results?.failed || body?.data?.failed;
        if (failedItems && Array.isArray(failedItems) && failedItems.length > 0) {
            try {
                for (const failedItem of failedItems) {
                    const errorMessage = failedItem.error || 'Bulk operation failed';
                    const errorLog = {
                        message: typeof errorMessage === 'string'
                            ? errorMessage
                            : JSON.stringify(errorMessage),
                        stack: failedItem.stack || null,
                        path: req.originalUrl || req.path,
                        method: req.method,
                        body: JSON.stringify(failedItem),
                        query: req.query && Object.keys(req.query).length
                            ? JSON.stringify(req.query)
                            : null,
                        user_id: req.user?.id
                            ? Number(req.user.id)
                            : null,
                        ip_address: (req.ip ||
                            req.headers['x-forwarded-for']?.toString() ||
                            '').substring(0, 50) || null,
                        device_info: (req.headers['user-agent'] || '').substring(0, 255) || null,
                    };
                    prisma_client_1.default.error_logs.create({ data: errorLog }).catch(console.error);
                }
            }
            catch (loggerError) {
                console.error('Failed to log bulk failures to database:', loggerError);
            }
        }
        else if (res.statusCode >= 400) {
            try {
                const errorMessage = body?.error || body?.message || `HTTP Error ${res.statusCode}`;
                const errorLog = {
                    message: typeof errorMessage === 'string'
                        ? errorMessage
                        : JSON.stringify(errorMessage),
                    stack: body?.stack || null,
                    path: req.originalUrl || req.path,
                    method: req.method,
                    body: req.body && Object.keys(req.body).length
                        ? JSON.stringify(req.body)
                        : null,
                    query: req.query && Object.keys(req.query).length
                        ? JSON.stringify(req.query)
                        : null,
                    user_id: req.user?.id ? Number(req.user.id) : null,
                    ip_address: (req.ip ||
                        req.headers['x-forwarded-for']?.toString() ||
                        '').substring(0, 50) || null,
                    device_info: (req.headers['user-agent'] || '').substring(0, 255) || null,
                };
                prisma_client_1.default.error_logs.create({ data: errorLog }).catch(console.error);
            }
            catch (loggerError) {
                console.error('Failed to log error to database:', loggerError);
            }
        }
        return originalJson.call(this, body);
    };
    next();
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=errorLogger.middleware.js.map