export declare const notificationsController: {
    /**
     * Get all notifications for the authenticated user
     * GET /api/v1/notifications
     */
    getNotifications(req: any, res: any): Promise<any>;
    /**
     * Get notification by ID
     * GET /api/v1/notifications/:id
     */
    getNotificationById(req: any, res: any): Promise<any>;
    /**
     * Create a new notification
     * POST /api/v1/notifications
     */
    createNotification(req: any, res: any): Promise<any>;
    /**
     * Mark notification as read
     * PUT /api/v1/notifications/:id/read
     */
    markAsRead(req: any, res: any): Promise<any>;
    /**
     * Mark all notifications as read
     * PUT /api/v1/notifications/read-all
     */
    markAllAsRead(req: any, res: any): Promise<any>;
    /**
     * Delete a notification
     * DELETE /api/v1/notifications/:id
     */
    deleteNotification(req: any, res: any): Promise<any>;
    /**
     * Clear all notifications for the user
     * DELETE /api/v1/notifications/clear-all
     */
    clearAll(req: any, res: any): Promise<any>;
    /**
     * Get unread count
     * GET /api/v1/notifications/unread-count
     */
    getUnreadCount(req: any, res: any): Promise<any>;
};
//# sourceMappingURL=notifications.controller.d.ts.map