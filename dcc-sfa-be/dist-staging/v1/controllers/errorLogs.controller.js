"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const ipLocation_util_1 = require("../../utils/ipLocation.util");
/**
 * Error Logs Controller
 * Handles error log queries and triggers a reload
 */
exports.errorLogsController = {
    /**
     * Get Error Logs
     * GET /api/v1/error-logs
     * Returns error logs with filtering and pagination
     */
    async getErrorLogs(req, res) {
        try {
            const { page = 1, limit = 10, path, method, start_date, end_date, } = req.query;
            const where = {};
            if (path) {
                where.path = { contains: path };
            }
            if (method) {
                where.method = method;
            }
            if (start_date || end_date) {
                where.createdate = {};
                if (start_date) {
                    where.createdate.gte = new Date(start_date);
                }
                if (end_date) {
                    where.createdate.lte = new Date(end_date);
                }
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.error_logs,
                filters: where,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const ipsToLookup = data
                .map((log) => log.ip_address)
                .filter(Boolean);
            const locationMap = await (0, ipLocation_util_1.getLocationFromIPs)(ipsToLookup);
            const userIds = Array.from(new Set(data.map((log) => log.user_id).filter(Boolean)));
            const users = await prisma_client_1.default.users.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, email: true, employee_id: true },
            });
            const userMap = new Map(users.map(u => [u.id, u]));
            const serializedLogs = data.map((log) => {
                let parsedBody = null;
                let parsedQuery = null;
                try {
                    parsedBody = log.body ? JSON.parse(log.body) : null;
                }
                catch {
                    parsedBody = log.body;
                }
                try {
                    parsedQuery = log.query ? JSON.parse(log.query) : null;
                }
                catch {
                    parsedQuery = log.query;
                }
                const user = log.user_id ? userMap.get(log.user_id) : null;
                return {
                    id: log.id,
                    message: log.message,
                    stack: log.stack,
                    path: log.path,
                    method: log.method,
                    body: parsedBody,
                    query: parsedQuery,
                    user_id: log.user_id,
                    user_name: user?.name || 'N/A',
                    user_email: user?.email || 'N/A',
                    employee_code: user?.employee_id || 'N/A',
                    ip_address: log.ip_address,
                    device_info: log.device_info,
                    location: locationMap[log.ip_address || ''] || 'Unknown',
                    createdate: log.createdate,
                };
            });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const startOfMonth = new Date(today);
            startOfMonth.setDate(1);
            const [total_errors, today_errors, this_week_errors, this_month_errors] = await Promise.all([
                prisma_client_1.default.error_logs.count(),
                prisma_client_1.default.error_logs.count({ where: { createdate: { gte: today } } }),
                prisma_client_1.default.error_logs.count({
                    where: { createdate: { gte: startOfWeek } },
                }),
                prisma_client_1.default.error_logs.count({
                    where: { createdate: { gte: startOfMonth } },
                }),
            ]);
            return res.status(200).json({
                success: true,
                data: serializedLogs,
                stats: {
                    total_errors,
                    today_errors,
                    this_week_errors,
                    this_month_errors,
                },
                pagination: {
                    totalRecords: pagination.total_count,
                    totalPages: pagination.total_pages,
                    currentPage: pagination.current_page,
                    limit: limitNum,
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve error logs',
                error: error.message,
            });
        }
    },
};
//# sourceMappingURL=errorLogs.controller.js.map