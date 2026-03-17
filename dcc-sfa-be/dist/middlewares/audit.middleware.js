"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditDelete = exports.auditUpdate = exports.auditCreate = exports.auditRoute = exports.auditMiddleware = void 0;
const ipUtils_1 = require("../utils/ipUtils");
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
/**
 * Create an audit log entry
 */
const createAuditLog = async (tableName, recordId, action, changedData, userId, req) => {
    try {
        const ipAddress = (0, ipUtils_1.getClientIP)(req);
        const deviceInfo = req.headers['user-agent'] || 'Unknown';
        const sessionId = req.headers['x-session-id'] || 'Unknown';
        await prisma_client_1.default.audit_logs.create({
            data: {
                table_name: tableName,
                record_id: recordId,
                action: action,
                changed_data: typeof changedData === 'string'
                    ? changedData
                    : JSON.stringify(changedData),
                changed_by: userId,
                ip_address: ipAddress,
                device_info: deviceInfo,
                session_id: sessionId,
                createdby: userId,
                is_active: 'Y',
                createdate: new Date(),
                changed_at: new Date(),
            },
        });
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
    }
};
/**
 * Audit middleware wrapper functions
 */
exports.auditMiddleware = {
    logCreate: async (tableName, recordId, data, userId, req) => {
        return createAuditLog(tableName, recordId, 'CREATE', data, userId, req);
    },
    logUpdate: async (tableName, recordId, oldData, newData, userId, req) => {
        const changes = { old: oldData, new: newData };
        return createAuditLog(tableName, recordId, 'UPDATE', changes, userId, req);
    },
    logDelete: async (tableName, recordId, data, userId, req) => {
        return createAuditLog(tableName, recordId, 'DELETE', data, userId, req);
    },
};
/**
 * Audit Route Middleware
 * Automatically logs CRUD operations at the route level
 */
const auditRoute = (tableName, action) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = function (data) {
            const result = originalJson(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.user?.id || 1;
                try {
                    switch (action) {
                        case 'CREATE':
                            if (data?.data?.id) {
                                createAuditLog(tableName, data.data.id, 'CREATE', data.data, userId, req).catch((error) => console.error('Audit log error:', error));
                            }
                            break;
                        case 'UPDATE':
                            if (req.params?.id && data?.data) {
                                const recordId = parseInt(req.params.id);
                                createAuditLog(tableName, recordId, 'UPDATE', { new: data.data }, userId, req).catch((error) => console.error('Audit log error:', error));
                            }
                            break;
                        case 'DELETE':
                            if (req.params?.id) {
                                const recordId = parseInt(req.params.id);
                                createAuditLog(tableName, recordId, 'DELETE', {}, userId, req).catch((error) => console.error('Audit log error:', error));
                            }
                            break;
                    }
                }
                catch (error) {
                    console.error('Audit middleware error:', error);
                }
            }
            return result;
        };
        next();
    };
};
exports.auditRoute = auditRoute;
const auditCreate = (tableName) => {
    return (0, exports.auditRoute)(tableName, 'CREATE');
};
exports.auditCreate = auditCreate;
const auditUpdate = (tableName) => {
    return (0, exports.auditRoute)(tableName, 'UPDATE');
};
exports.auditUpdate = auditUpdate;
const auditDelete = (tableName) => {
    return (0, exports.auditRoute)(tableName, 'DELETE');
};
exports.auditDelete = auditDelete;
//# sourceMappingURL=audit.middleware.js.map