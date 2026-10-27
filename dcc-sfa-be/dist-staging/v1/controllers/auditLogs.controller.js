"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * Extracts a human-readable record name or identifier from changed audit data or entity payload.
 * @param data - The parsed changed data or database record
 * @returns The resolved record name or null
 */
const extractRecordName = (data) => {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const candidateFields = [
        'order_number',
        'invoice_number',
        'order_no',
        'invoice_no',
        'name',
        'title',
        'outlet_name',
        'shop_name',
        'customer_name',
        'product_name',
        'route_name',
        'vehicle_number',
        'plate_number',
        'reference_number',
        'reference_no',
        'reference',
        'ref_no',
        'voucher_no',
        'receipt_no',
        'code',
        'short_code',
        'username',
        'employee_id',
        'description',
    ];
    const obj = data;
    for (const field of candidateFields) {
        const val = obj[field];
        if (typeof val === 'string' && val.trim().length > 0) {
            return val.trim();
        }
        if (typeof val === 'number') {
            return String(val);
        }
    }
    const nestedKeys = ['new', 'data', 'old', 'record', 'item'];
    for (const key of nestedKeys) {
        if (obj[key] && typeof obj[key] === 'object') {
            const nested = obj[key];
            for (const field of candidateFields) {
                const val = nested[field];
                if (typeof val === 'string' && val.trim().length > 0) {
                    return val.trim();
                }
                if (typeof val === 'number') {
                    return String(val);
                }
            }
        }
    }
    return null;
};
/**
 * Attempts to retrieve a referenced record's display name directly from its database table.
 * @param tableName - Name of the database table
 * @param recordId - Primary key ID of the record
 * @returns The resolved display name or null
 */
const resolveRecordNameFromDb = async (tableName, recordId) => {
    if (!tableName || !recordId || isNaN(recordId)) {
        return null;
    }
    try {
        const raw = tableName.trim().toLowerCase();
        const candidateModelNames = [
            raw,
            raw.endsWith('s') ? raw.slice(0, -1) : `${raw}s`,
        ];
        let targetModel = null;
        for (const modelKey of candidateModelNames) {
            if (prisma_client_1.default[modelKey]) {
                targetModel = prisma_client_1.default[modelKey];
                break;
            }
        }
        if (!targetModel ||
            typeof targetModel.findUnique !== 'function') {
            return null;
        }
        const record = await targetModel.findUnique({
            where: { id: recordId },
        });
        if (record) {
            return extractRecordName(record);
        }
    }
    catch {
        return null;
    }
    return null;
};
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
            else {
                where.table_name = {
                    notIn: [
                        'gps_logs',
                        'gps_log',
                        'request_logs',
                        'error_logs',
                        'mobile_error_logs',
                    ],
                };
            }
            if (action) {
                where.action = action;
            }
            if (user_id) {
                where.changed_by = parseInt(user_id);
            }
            if (start_date || end_date) {
                const dateFilter = {};
                if (start_date) {
                    dateFilter.gte = new Date(start_date);
                }
                if (end_date) {
                    dateFilter.lte = new Date(end_date);
                }
                where.changed_at = dateFilter;
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
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
                            profile_image: true,
                        },
                    },
                },
            });
            const serializedLogs = await Promise.all(data.map(async (log) => {
                let parsedChangedData = null;
                try {
                    parsedChangedData = log.changed_data
                        ? JSON.parse(log.changed_data)
                        : null;
                }
                catch {
                    parsedChangedData = log.changed_data;
                }
                let record_name = extractRecordName(parsedChangedData);
                if (!record_name &&
                    typeof log.table_name === 'string' &&
                    typeof log.record_id === 'number') {
                    record_name = await resolveRecordNameFromDb(log.table_name, log.record_id);
                }
                const userRelation = log.users_audit_logs_changed_byTousers;
                return {
                    id: log.id,
                    table_name: log.table_name,
                    record_id: log.record_id,
                    record_name: record_name,
                    action: log.action,
                    changed_data: parsedChangedData,
                    changed_by: log.changed_by,
                    user_name: userRelation?.name || 'N/A',
                    user_email: userRelation?.email || 'N/A',
                    user_avatar: userRelation?.profile_image || null,
                    employee_id: userRelation?.employee_id || null,
                    changed_at: log.changed_at,
                    ip_address: log.ip_address,
                    device_info: log.device_info,
                    session_id: log.session_id,
                };
            }));
            /**
             * Calculate statistics
             */
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
            const err = error;
            console.error('Get Audit Logs Error:', error);
            res.status(500).json({
                success: false,
                message: err?.message || 'Failed to retrieve audit logs',
            });
        }
    },
};
//# sourceMappingURL=auditLogs.controller.js.map