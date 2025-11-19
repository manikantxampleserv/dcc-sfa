import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { notificationsController } from '../controllers/notifications.controller';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/v1/notifications
 * @description Get all notifications for the authenticated user with filtering and pagination
 * @access Private (requires authentication)
 * @params Query: page, limit, type, category, is_read, priority
 */
router.get(
  '/',
  requirePermission([{ module: 'alert', action: 'read' }]),
  notificationsController.getNotifications
);

/**
 * @route GET /api/v1/notifications/unread-count
 * @description Get unread notification count for the authenticated user
 * @access Private (requires authentication)
 */
router.get(
  '/unread-count',
  requirePermission([{ module: 'alert', action: 'read' }]),
  notificationsController.getUnreadCount
);

/**
 * @route GET /api/v1/notifications/:id
 * @description Get notification by ID
 * @access Private (requires authentication)
 */
router.get(
  '/:id',
  requirePermission([{ module: 'alert', action: 'read' }]),
  notificationsController.getNotificationById
);

/**
 * @route POST /api/v1/notifications
 * @description Create a new notification
 * @access Private (requires authentication)
 * @body { user_id, type, category, title, message, data?, priority?, action_url?, expires_at? }
 */
router.post(
  '/',
  auditCreate('notifications'),
  requirePermission([{ module: 'alert', action: 'create' }]),
  notificationsController.createNotification
);

/**
 * @route PUT /api/v1/notifications/:id/read
 * @description Mark a notification as read
 * @access Private (requires authentication)
 */
router.put(
  '/:id/read',
  auditUpdate('notifications'),
  requirePermission([{ module: 'alert', action: 'update' }]),
  notificationsController.markAsRead
);

/**
 * @route PUT /api/v1/notifications/read-all
 * @description Mark all notifications as read for the authenticated user
 * @access Private (requires authentication)
 */
router.put(
  '/read-all',
  auditUpdate('notifications'),
  requirePermission([{ module: 'alert', action: 'update' }]),
  notificationsController.markAllAsRead
);

/**
 * @route DELETE /api/v1/notifications/:id
 * @description Delete a notification
 * @access Private (requires authentication)
 */
router.delete(
  '/:id',
  auditDelete('notifications'),
  requirePermission([{ module: 'alert', action: 'delete' }]),
  notificationsController.deleteNotification
);

/**
 * @route DELETE /api/v1/notifications/clear-all
 * @description Clear all notifications for the authenticated user
 * @access Private (requires authentication)
 */
router.delete(
  '/clear-all',
  auditDelete('notifications'),
  requirePermission([{ module: 'alert', action: 'delete' }]),
  notificationsController.clearAll
);

export default router;
