"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestLogger = void 0;
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const createRequestLogger = (serviceName) => {
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = function (body) {
            try {
                const payload = req.method === 'GET'
                    ? (req.query && Object.keys(req.query).length ? JSON.stringify(req.query) : null)
                    : (req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : null);
                const logData = {
                    service: serviceName,
                    endpoint: req.originalUrl || req.path,
                    method: req.method,
                    payload,
                    response: body ? JSON.stringify(body) : null,
                    status_code: res.statusCode,
                    user_id: req.user?.id ? Number(req.user.id) : null,
                    ip_address: (req.ip || req.headers['x-forwarded-for']?.toString() || '').substring(0, 50) || null,
                    device_info: (req.headers['user-agent'] || '').substring(0, 255) || null,
                };
                prisma_client_1.default.request_logs.create({ data: logData }).catch((err) => {
                    console.error(`Failed to save ${serviceName} request log:`, err);
                });
            }
            catch (err) {
                console.error(`Error logging ${serviceName} request:`, err);
            }
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.createRequestLogger = createRequestLogger;
//# sourceMappingURL=requestLogger.middleware.js.map