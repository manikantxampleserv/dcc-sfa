import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { notificationsController } from '../controllers/notifications.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/v1/notifications
 * @description Get all notifications for the authenticated user with filtering and pagination
 * @access Private (requires authentication)
 * @params Query: page, limit, type, category, is_read, priority
 */
router.get('/', notificationsController.getNotifications);

/**
 * @route GET /api/v1/notifications/unread-count
 * @description Get unread notification count for the authenticated user
 * @access Private (requires authentication)
 */
router.get('/unread-count', notificationsController.getUnreadCount);

/**
 * @route GET /api/v1/notifications/:id
 * @description Get notification by ID
 * @access Private (requires authentication)
 */
router.get('/:id', notificationsController.getNotificationById);

/**
 * @route POST /api/v1/notifications
 * @description Create a new notification
 * @access Private (requires authentication)
 * @body { user_id, type, category, title, message, data?, priority?, action_url?, expires_at? }
 */
router.post('/', notificationsController.createNotification);

/**
 * @route PUT /api/v1/notifications/:id/read
 * @description Mark a notification as read
 * @access Private (requires authentication)
 */
router.put('/:id/read', notificationsController.markAsRead);

/**
 * @route PUT /api/v1/notifications/read-all
 * @description Mark all notifications as read for the authenticated user
 * @access Private (requires authentication)
 */
router.put('/read-all', notificationsController.markAllAsRead);

/**
 * @route DELETE /api/v1/notifications/:id
 * @description Delete a notification
 * @access Private (requires authentication)
 */
router.delete('/:id', notificationsController.deleteNotification);

/**
 * @route DELETE /api/v1/notifications/clear-all
 * @description Clear all notifications for the authenticated user
 * @access Private (requires authentication)
 */
router.delete('/clear-all', notificationsController.clearAll);

export default router;
