"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileErrorLogsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
exports.mobileErrorLogsController = {
    async getMobileErrorLogs(req, res) {
        try {
            const model = prisma_client_1.default.mobile_error_logs;
            if (!model) {
                return res.status(500).json({
                    success: false,
                    message: 'Prisma client was not initialized with mobile_error_logs. Please restart the backend server.',
                });
            }
            const { page = 1, limit = 10, search, error_message, error_type, screen_name, device_info, user_id, is_synced, start_date, end_date, } = req.query;
            console.log(' Fetching Logs with query:', req.query);
            const where = {};
            const searchTerm = (search || error_message)?.trim();
            if (searchTerm) {
                where.OR = [
                    { error_message: { contains: searchTerm } },
                    { stack_trace: { contains: searchTerm } },
                    { screen_name: { contains: searchTerm } },
                ];
            }
            if (error_type) {
                where.error_type = error_type.trim();
            }
            if (screen_name) {
                where.screen_name = { contains: screen_name.trim() };
            }
            if (device_info) {
                where.device_info = { contains: device_info.trim() };
            }
            if (user_id) {
                where.user_id = parseInt(user_id, 10);
            }
            if (is_synced !== undefined) {
                where.is_synced = parseInt(is_synced, 10);
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
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const { data, pagination } = await (0, paginate_1.paginate)({
                model,
                filters: where,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const userIds = Array.from(new Set(data.map((log) => log.user_id).filter(Boolean)));
            const users = userIds.length
                ? await prisma_client_1.default.users.findMany({
                    where: { id: { in: userIds } },
                    select: { id: true, name: true, email: true, employee_id: true },
                })
                : [];
            const userMap = new Map(users.map(u => [u.id, u]));
            const serializedLogs = data.map((log) => {
                const user = log.user_id ? userMap.get(log.user_id) : null;
                return {
                    id: log.id,
                    error_message: log.error_message,
                    stack_trace: log.stack_trace,
                    error_type: log.error_type,
                    screen_name: log.screen_name,
                    device_info: log.device_info,
                    user_id: log.user_id,
                    user_name: user?.name || 'N/A',
                    user_email: user?.email || 'N/A',
                    employee_code: user?.employee_id || 'N/A',
                    is_synced: log.is_synced,
                    createdate: log.createdate,
                };
            });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const startOfMonth = new Date(today);
            startOfMonth.setDate(1);
            let total_errors = 0;
            let today_errors = 0;
            let this_week_errors = 0;
            let this_month_errors = 0;
            if (typeof model?.count === 'function') {
                try {
                    [total_errors, today_errors, this_week_errors, this_month_errors] =
                        await Promise.all([
                            model.count(),
                            model.count({
                                where: { createdate: { gte: today } },
                            }),
                            model.count({
                                where: { createdate: { gte: startOfWeek } },
                            }),
                            model.count({
                                where: { createdate: { gte: startOfMonth } },
                            }),
                        ]);
                }
                catch (countErr) {
                    console.warn(' Could not calculate count statistics:', countErr);
                }
            }
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
                message: 'Failed to retrieve mobile error logs',
                error: error.message,
            });
        }
    },
    async syncMobileErrorLogs(req, res) {
        try {
            const model = prisma_client_1.default.mobile_error_logs;
            if (!model) {
                return res.status(500).json({
                    success: false,
                    message: 'Prisma client was not initialized with mobile_error_logs. Please restart the backend server.',
                });
            }
            const body = req.body;
            const rawLogs = Array.isArray(body)
                ? body
                : Array.isArray(body?.logs)
                    ? body.logs
                    : [body];
            if (!rawLogs.length || !rawLogs[0]?.error_message) {
                console.warn(' Validation Failed: No error_message found in payload.');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payload. At least one error log with error_message is required.',
                });
            }
            const logsToInsert = rawLogs.map((item) => ({
                error_message: String(item.error_message || item.message || 'Unknown Error'),
                stack_trace: item.stack_trace ? String(item.stack_trace) : null,
                error_type: item.error_type ? String(item.error_type) : null,
                screen_name: item.screen_name ? String(item.screen_name) : null,
                device_info: item.device_info
                    ? typeof item.device_info === 'object'
                        ? JSON.stringify(item.device_info)
                        : String(item.device_info)
                    : null,
                user_id: item.user_id
                    ? Number(item.user_id)
                    : body?.user_id
                        ? Number(body.user_id)
                        : null,
                is_synced: 1,
                createdate: item.createdate || item.created_at
                    ? new Date(item.createdate || item.created_at)
                    : new Date(),
            }));
            console.log(`Prepared ${logsToInsert.length} log(s) to insert:`);
            console.log(JSON.stringify(logsToInsert, null, 2));
            const createdLogs = await prisma_client_1.default.$transaction(logsToInsert.map((log) => model.create({
                data: log,
            })));
            return res.status(201).json({
                success: true,
                message: `${createdLogs.length} mobile error log synced successfully.`,
                synced_count: createdLogs.length,
                data: createdLogs,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to sync mobile error logs',
                error: error.message,
            });
        }
    },
};
//# sourceMappingURL=mobileErrorLogs.controller.js.map