import axioConfig from '../../configs/axio.config';

export interface Notification {
  id: number;
  user_id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  category: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority?: 'low' | 'medium' | 'high';
  action_url?: string;
  expires_at?: string;
  createdate?: string;
  read_at?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: 'success' | 'warning' | 'info' | 'error';
  category?: string;
  is_read?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  unread_count: number;
}

export const notificationsService = {
  /**
   * Get all notifications for the authenticated user
   * @param filters - Optional filters for notifications
   * @returns Promise<NotificationsResponse> - Array of notifications with pagination
   */
  async getNotifications(
    filters?: NotificationFilters
  ): Promise<NotificationsResponse> {
    const params: any = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;
    if (filters?.is_read !== undefined) params.is_read = filters.is_read;
    if (filters?.priority) params.priority = filters.priority;

    const response = await axioConfig.get('/notifications', { params });
    return {
      data: response.data.data.notifications || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      },
      unread_count: response.data.data.unread_count || 0,
    };
  },

  /**
   * Get notification by ID
   * @param id - The ID of the notification
   * @returns Promise<Notification> - Notification object
   */
  async getNotificationById(id: number): Promise<Notification> {
    const response = await axioConfig.get(`/notifications/${id}`);
    return response.data.data;
  },

  /**
   * Create a new notification
   * @param notification - Notification data
   * @returns Promise<Notification> - Created notification
   */
  async createNotification(notification: {
    user_id: number;
    type: 'success' | 'warning' | 'info' | 'error';
    category: string;
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'medium' | 'high';
    action_url?: string;
    expires_at?: string;
  }): Promise<Notification> {
    const response = await axioConfig.post('/notifications', notification);
    return response.data.data;
  },

  /**
   * Mark notification as read
   * @param id - The ID of the notification
   * @returns Promise<Notification> - Updated notification
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await axioConfig.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   * @returns Promise<{ count: number }> - Count of updated notifications
   */
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await axioConfig.put('/notifications/read-all');
    return response.data.data || { count: 0 };
  },

  /**
   * Delete a notification
   * @param id - The ID of the notification
   * @returns Promise<void>
   */
  async deleteNotification(id: number): Promise<void> {
    await axioConfig.delete(`/notifications/${id}`);
  },

  /**
   * Clear all notifications
   * @returns Promise<{ count: number }> - Count of deleted notifications
   */
  async clearAll(): Promise<{ count: number }> {
    const response = await axioConfig.delete('/notifications/clear-all');
    return response.data.data || { count: 0 };
  },

  /**
   * Get unread notification count
   * @returns Promise<{ count: number }> - Unread count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await axioConfig.get('/notifications/unread-count');
    return response.data.data || { count: 0 };
  },
};
