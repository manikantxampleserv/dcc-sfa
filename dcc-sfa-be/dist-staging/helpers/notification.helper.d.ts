export interface CreateNotificationParams {
    user_id: number;
    type: 'success' | 'warning' | 'info' | 'error';
    category: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    action_url?: string;
    data?: any;
    expires_at?: Date | string;
    createdby?: number;
}
/**
 * Helper function to create notifications consistently across the application
 * @param params - Notification parameters
 * @returns Created notification
 */
export declare function createNotification(params: CreateNotificationParams): Promise<{
    id: number;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    user_id: number;
    expires_at: Date | null;
    priority: string | null;
    type: string;
    category: string;
    title: string;
    message: string;
    data: string | null;
    is_read: string;
    action_url: string | null;
    read_at: Date | null;
}>;
/**
 * Create notifications for multiple users
 * @param params - Array of notification parameters
 * @returns Array of created notifications
 */
export declare function createNotificationsForUsers(params: CreateNotificationParams[]): Promise<{
    id: number;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    user_id: number;
    expires_at: Date | null;
    priority: string | null;
    type: string;
    category: string;
    title: string;
    message: string;
    data: string | null;
    is_read: string;
    action_url: string | null;
    read_at: Date | null;
}[]>;
/**
 * Create notification for a specific order event
 */
export declare function createOrderNotification(userId: number, orderId: number, orderNumber: string, event: 'created' | 'updated' | 'approved' | 'rejected' | 'cancelled', createdBy?: number): Promise<{
    id: number;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    user_id: number;
    expires_at: Date | null;
    priority: string | null;
    type: string;
    category: string;
    title: string;
    message: string;
    data: string | null;
    is_read: string;
    action_url: string | null;
    read_at: Date | null;
}>;
/**
 * Create notification for workflow events
 */
export declare function createWorkflowNotification(userId: number, workflowId: number, referenceNumber: string, event: 'created' | 'approved' | 'rejected' | 'pending', createdBy?: number): Promise<{
    id: number;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    user_id: number;
    expires_at: Date | null;
    priority: string | null;
    type: string;
    category: string;
    title: string;
    message: string;
    data: string | null;
    is_read: string;
    action_url: string | null;
    read_at: Date | null;
}>;
/**
 * Create notification for route exceptions
 */
export declare function createRouteExceptionNotification(userId: number, exceptionId: number, routeName: string, exceptionType: string, description: string, severity?: 'low' | 'medium' | 'high', createdBy?: number): Promise<{
    id: number;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    user_id: number;
    expires_at: Date | null;
    priority: string | null;
    type: string;
    category: string;
    title: string;
    message: string;
    data: string | null;
    is_read: string;
    action_url: string | null;
    read_at: Date | null;
}>;
//# sourceMappingURL=notification.helper.d.ts.map