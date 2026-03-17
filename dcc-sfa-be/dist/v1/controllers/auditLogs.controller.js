"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * Audit Logs Controller
 * Handles audit log queries and reporting
 */
exports.auditLogsController = {
    /**
     * Get Audit Logs
     * GET /api/v1/audit-logs
     * Returns audit logs with filtering and pagination
     */
    async getAuditLogs(req, res) {
        try {
            const { page = 1, limit = 10, table_name, action, user_id, start_date, end_date, } = req.query;
            const where = {
                is_active: 'Y',
            };
            if (table_name) {
                where.table_name = table_name;
            }
            if (action) {
                where.action = action;
            }
            if (user_id) {
                where.changed_by = parseInt(user_id);
            }
            if (start_date || end_date) {
                where.changed_at = {};
                if (start_date) {
                    where.changed_at.gte = new Date(start_date);
                }
                if (end_date) {
                    where.changed_at.lte = new Date(end_date);
                }
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.audit_logs,
                filters: where,
                page: pageNum,
                limit: limitNum,
                orderBy: { changed_at: 'desc' },
                include: {
                    users_audit_logs_changed_byTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            employee_id: true,
                        },
                    },
                },
            });
            // Serialize audit logs
            const serializedLogs = data.map((log) => {
                let parsedChangedData = null;
                try {
                    parsedChangedData = log.changed_data
                        ? JSON.parse(log.changed_data)
                        : null;
                }
                catch {
                    parsedChangedData = log.changed_data;
                }
                return {
                    id: log.id,
                    table_name: log.table_name,
                    record_id: log.record_id,
                    action: log.action,
                    changed_data: parsedChangedData,
                    changed_by: log.changed_by,
                    user_name: log.users_audit_logs_changed_byTousers?.name || 'N/A',
                    user_email: log.users_audit_logs_changed_byTousers?.email || 'N/A',
                    employee_id: log.users_audit_logs_changed_byTousers?.employee_id,
                    changed_at: log.changed_at,
                    ip_address: log.ip_address,
                    device_info: log.device_info,
                    session_id: log.session_id,
                };
            });
            // Calculate statistics
            const stats = {
                total_logs: pagination.total_count,
                by_action: {
                    CREATE: await prisma_client_1.default.audit_logs.count({
                        where: { ...where, action: 'CREATE' },
                    }),
                    UPDATE: await prisma_client_1.default.audit_logs.count({
                        where: { ...where, action: 'UPDATE' },
                    }),
                    DELETE: await prisma_client_1.default.audit_logs.count({
                        where: { ...where, action: 'DELETE' },
                    }),
                },
                unique_tables: await prisma_client_1.default.audit_logs.findMany({
                    where,
                    select: { table_name: true },
                    distinct: ['table_name'],
                }),
                unique_users: await prisma_client_1.default.audit_logs.findMany({
                    where,
                    select: { changed_by: true },
                    distinct: ['changed_by'],
                }),
            };
            res.json({
                success: true,
                message: 'Audit logs retrieved successfully',
                data: {
                    logs: serializedLogs,
                    pagination: {
                        page: pagination.current_page,
                        limit: limitNum,
                        total: pagination.total_count,
                        total_pages: pagination.total_pages,
                    },
                    statistics: {
                        ...stats,
                        unique_tables_count: stats.unique_tables.length,
                        unique_users_count: stats.unique_users.length,
                    },
                },
            });
        }
        catch (error) {
            console.error('Get Audit Logs Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve audit logs',
            });
        }
    },
};
//# sourceMappingURL=auditLogs.controller.js.map