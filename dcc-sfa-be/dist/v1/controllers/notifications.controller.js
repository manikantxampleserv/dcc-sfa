"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
const serializeNotification = (notification) => ({
    id: notification.id,
    user_id: notification.user_id,
    type: notification.type,
    category: notification.category,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    is_read: notification.is_read === 'Y',
    priority: notification.priority,
    action_url: notification.action_url,
    expires_at: notification.expires_at,
    createdate: notification.createdate,
    read_at: notification.read_at,
    createdby: notification.createdby,
    updatedate: notification.updatedate,
    updatedby: notification.updatedby,
    log_inst: notification.log_inst,
});
exports.notificationsController = {
    /**
     * Get all notifications for the authenticated user
     * GET /api/v1/notifications
     */
    async getNotifications(req, res) {
        try {
            const { page = 1, limit = 20, type, category, is_read, priority, } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const where = {
                user_id: userId,
            };
            if (type) {
                where.type = type;
            }
            if (category) {
                where.category = category;
            }
            if (is_read !== undefined) {
                where.is_read = is_read === 'true' ? 'Y' : 'N';
            }
            if (priority) {
                where.priority = priority;
            }
            where.OR = [{ expires_at: null }, { expires_at: { gt: new Date() } }];
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.notifications,
                filters: where,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const unreadCount = await prisma_client_1.default.notifications.count({
                where: {
                    user_id: userId,
                    is_read: 'N',
                    OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
                },
            });
            res.success('Notifications retrieved successfully', {
                notifications: data.map((n) => serializeNotification(n)),
                unread_count: unreadCount,
            }, 200, pagination);
        }
        catch (error) {
            console.error('Get Notifications Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Get notification by ID
     * GET /api/v1/notifications/:id
     */
    async getNotificationById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const notification = await prisma_client_1.default.notifications.findFirst({
                where: {
                    id: parseInt(id),
                    user_id: userId,
                },
            });
            if (!notification) {
                return res.error('Notification not found', 404);
            }
            res.success('Notification retrieved successfully', serializeNotification(notification));
        }
        catch (error) {
            console.error('Get Notification By ID Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Create a new notification
     * POST /api/v1/notifications
     */
    async createNotification(req, res) {
        try {
            const { user_id, type, category, title, message, data, priority = 'medium', action_url, expires_at, } = req.body;
            if (!user_id || !type || !category || !title || !message) {
                return res.error('user_id, type, category, title, and message are required', 400);
            }
            const notification = await prisma_client_1.default.notifications.create({
                data: {
                    user_id,
                    type,
                    category,
                    title,
                    message,
                    data: data ? JSON.stringify(data) : null,
                    priority,
                    action_url,
                    expires_at: expires_at ? new Date(expires_at) : null,
                    is_read: 'N',
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                },
            });
            res.success('Notification created successfully', serializeNotification(notification), 201);
        }
        catch (error) {
            console.error('Create Notification Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Mark notification as read
     * PUT /api/v1/notifications/:id/read
     */
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const notification = await prisma_client_1.default.notifications.findFirst({
                where: {
                    id: parseInt(id),
                    user_id: userId,
                },
            });
            if (!notification) {
                return res.error('Notification not found', 404);
            }
            const updated = await prisma_client_1.default.notifications.update({
                where: { id: parseInt(id) },
                data: {
                    is_read: 'Y',
                    read_at: new Date(),
                    updatedby: userId,
                    updatedate: new Date(),
                },
            });
            res.success('Notification marked as read', serializeNotification(updated));
        }
        catch (error) {
            console.error('Mark As Read Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Mark all notifications as read
     * PUT /api/v1/notifications/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const result = await prisma_client_1.default.notifications.updateMany({
                where: {
                    user_id: userId,
                    is_read: 'N',
                },
                data: {
                    is_read: 'Y',
                    read_at: new Date(),
                    updatedby: userId,
                    updatedate: new Date(),
                },
            });
            res.success('All notifications marked as read', {
                count: result.count,
            });
        }
        catch (error) {
            console.error('Mark All As Read Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Delete a notification
     * DELETE /api/v1/notifications/:id
     */
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            if (!id || isNaN(Number(id))) {
                return res.error('Invalid or missing notification ID', 400);
            }
            const notification = await prisma_client_1.default.notifications.findFirst({
                where: {
                    id: Number(id),
                    user_id: userId,
                },
            });
            if (!notification) {
                return res.error('Notification not found', 404);
            }
            await prisma_client_1.default.notifications.delete({
                where: { id: Number(id) },
            });
            res.success('Notification deleted successfully');
        }
        catch (error) {
            console.error('Delete Notification Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Clear all notifications for the user
     * DELETE /api/v1/notifications/clear-all
     */
    async clearAll(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const result = await prisma_client_1.default.notifications.deleteMany({
                where: {
                    user_id: userId,
                },
            });
            res.success('All notifications cleared', { count: result.count });
        }
        catch (error) {
            console.error('Clear All Notifications Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Get unread count
     * GET /api/v1/notifications/unread-count
     */
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const count = await prisma_client_1.default.notifications.count({
                where: {
                    user_id: userId,
                    is_read: 'N',
                    OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
                },
            });
            res.success('Unread count retrieved successfully', { count });
        }
        catch (error) {
            console.error('Get Unread Count Error:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=notifications.controller.js.map