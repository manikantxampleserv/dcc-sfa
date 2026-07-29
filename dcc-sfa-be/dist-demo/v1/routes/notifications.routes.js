"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const notifications_controller_1 = require("../controllers/notifications.controller");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authenticateToken);
/**
 * @route GET /api/v1/notifications
 * @description Get all notifications for the authenticated user with filtering and pagination
 * @access Private (requires authentication)
 * @params Query: page, limit, type, category, is_read, priority
 */
router.get('/', notifications_controller_1.notificationsController.getNotifications);
/**
 * @route GET /api/v1/notifications/unread-count
 * @description Get unread notification count for the authenticated user
 * @access Private (requires authentication)
 */
router.get('/unread-count', notifications_controller_1.notificationsController.getUnreadCount);
/**
 * @route GET /api/v1/notifications/:id
 * @description Get notification by ID
 * @access Private (requires authentication)
 */
router.get('/:id', notifications_controller_1.notificationsController.getNotificationById);
/**
 * @route POST /api/v1/notifications
 * @description Create a new notification
 * @access Private (requires authentication)
 * @body { user_id, type, category, title, message, data?, priority?, action_url?, expires_at? }
 */
router.post('/', notifications_controller_1.notificationsController.createNotification);
/**
 * @route PUT /api/v1/notifications/:id/read
 * @description Mark a notification as read
 * @access Private (requires authentication)
 */
router.put('/:id/read', notifications_controller_1.notificationsController.markAsRead);
/**
 * @route PUT /api/v1/notifications/read-all
 * @description Mark all notifications as read for the authenticated user
 * @access Private (requires authentication)
 */
router.put('/read-all', notifications_controller_1.notificationsController.markAllAsRead);
/**
 * @route DELETE /api/v1/notifications/clear-all
 * @description Clear all notifications for authenticated user
 * @access Private (requires authentication)
 */
router.delete('/clear-all', notifications_controller_1.notificationsController.clearAll);
/**
 * @route DELETE /api/v1/notifications/:id
 * @description Delete a notification
 * @access Private (requires authentication)
 */
router.delete('/:id', notifications_controller_1.notificationsController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map