import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

interface NotificationSerialized {
  id: number;
  user_id: number;
  type: string;
  category: string;
  title: string;
  message: string;
  data?: string | null;
  is_read: boolean;
  priority?: string | null;
  action_url?: string | null;
  expires_at?: Date | null;
  createdate?: Date | null;
  read_at?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

const serializeNotification = (notification: any): NotificationSerialized => ({
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

export const notificationsController = {
  /**
   * Get all notifications for the authenticated user
   * GET /api/v1/notifications
   */
  async getNotifications(req: any, res: any) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category,
        is_read,
        priority,
      } = req.query;

      const userId = req.user?.id;
      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const where: any = {
        user_id: userId,
      };

      if (type) {
        where.type = type as string;
      }

      if (category) {
        where.category = category as string;
      }

      if (is_read !== undefined) {
        where.is_read = is_read === 'true' ? 'Y' : 'N';
      }

      if (priority) {
        where.priority = priority as string;
      }

      where.OR = [{ expires_at: null }, { expires_at: { gt: new Date() } }];

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const { data, pagination } = await paginate({
        model: prisma.notifications,
        filters: where,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      const unreadCount = await prisma.notifications.count({
        where: {
          user_id: userId,
          is_read: 'N',
          OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        },
      });

      res.success(
        'Notifications retrieved successfully',
        {
          notifications: data.map((n: any) => serializeNotification(n)),
          unread_count: unreadCount,
        },
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Get Notifications Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Get notification by ID
   * GET /api/v1/notifications/:id
   */
  async getNotificationById(req: any, res: any) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const notification = await prisma.notifications.findFirst({
        where: {
          id: parseInt(id),
          user_id: userId,
        },
      });

      if (!notification) {
        return res.error('Notification not found', 404);
      }

      res.success(
        'Notification retrieved successfully',
        serializeNotification(notification)
      );
    } catch (error: any) {
      console.error('Get Notification By ID Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Create a new notification
   * POST /api/v1/notifications
   */
  async createNotification(req: any, res: any) {
    try {
      const {
        user_id,
        type,
        category,
        title,
        message,
        data,
        priority = 'medium',
        action_url,
        expires_at,
      } = req.body;

      if (!user_id || !type || !category || !title || !message) {
        return res.error(
          'user_id, type, category, title, and message are required',
          400
        );
      }

      const notification = await prisma.notifications.create({
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

      res.success(
        'Notification created successfully',
        serializeNotification(notification),
        201
      );
    } catch (error: any) {
      console.error('Create Notification Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/:id/read
   */
  async markAsRead(req: any, res: any) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const notification = await prisma.notifications.findFirst({
        where: {
          id: parseInt(id),
          user_id: userId,
        },
      });

      if (!notification) {
        return res.error('Notification not found', 404);
      }

      const updated = await prisma.notifications.update({
        where: { id: parseInt(id) },
        data: {
          is_read: 'Y',
          read_at: new Date(),
          updatedby: userId,
          updatedate: new Date(),
        },
      });

      res.success(
        'Notification marked as read',
        serializeNotification(updated)
      );
    } catch (error: any) {
      console.error('Mark As Read Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  async markAllAsRead(req: any, res: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const result = await prisma.notifications.updateMany({
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
    } catch (error: any) {
      console.error('Mark All As Read Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:id
   */
  async deleteNotification(req: any, res: any) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      if (!id || isNaN(Number(id))) {
        return res.error('Invalid or missing notification ID', 400);
      }

      const notification = await prisma.notifications.findFirst({
        where: {
          id: Number(id),
          user_id: userId,
        },
      });

      if (!notification) {
        return res.error('Notification not found', 404);
      }

      await prisma.notifications.delete({
        where: { id: Number(id) },
      });

      res.success('Notification deleted successfully');
    } catch (error: any) {
      console.error('Delete Notification Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Clear all notifications for the user
   * DELETE /api/v1/notifications/clear-all
   */
  async clearAll(req: any, res: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const result = await prisma.notifications.deleteMany({
        where: {
          user_id: userId,
        },
      });

      res.success('All notifications cleared', { count: result.count });
    } catch (error: any) {
      console.error('Clear All Notifications Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Get unread count
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(req: any, res: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const count = await prisma.notifications.count({
        where: {
          user_id: userId,
          is_read: 'N',
          OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        },
      });

      res.success('Unread count retrieved successfully', { count });
    } catch (error: any) {
      console.error('Get Unread Count Error:', error);
      res.error(error.message);
    }
  },
};
