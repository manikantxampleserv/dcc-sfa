import prisma from '../configs/prisma.client';

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
export async function createNotification(params: CreateNotificationParams) {
  const {
    user_id,
    type,
    category,
    title,
    message,
    priority = 'medium',
    action_url,
    data,
    expires_at,
    createdby = 1,
  } = params;

  // Validate required fields
  if (!user_id || !type || !category || !title || !message) {
    throw new Error(
      'user_id, type, category, title, and message are required for notifications'
    );
  }

  // Validate category length (max 20 chars)
  if (category.length > 20) {
    throw new Error('Category must be 20 characters or less');
  }

  // Validate title length (max 255 chars)
  if (title.length > 255) {
    throw new Error('Title must be 255 characters or less');
  }

  try {
    const notification = await prisma.notifications.create({
      data: {
        user_id,
        type,
        category,
        title,
        message,
        priority,
        action_url,
        data: data ? JSON.stringify(data) : null,
        expires_at: expires_at
          ? typeof expires_at === 'string'
            ? new Date(expires_at)
            : expires_at
          : null,
        is_read: 'N',
        createdby,
        createdate: new Date(),
      },
    });

    return notification;
  } catch (error: any) {
    console.error('Error creating notification:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

/**
 * Create notifications for multiple users
 * @param params - Array of notification parameters
 * @returns Array of created notifications
 */
export async function createNotificationsForUsers(
  params: CreateNotificationParams[]
) {
  const notifications = await Promise.all(
    params.map(param => createNotification(param))
  );
  return notifications;
}

/**
 * Create notification for a specific order event
 */
export async function createOrderNotification(
  userId: number,
  orderId: number,
  orderNumber: string,
  event: 'created' | 'updated' | 'approved' | 'rejected' | 'cancelled',
  createdBy: number = 1
) {
  const eventConfig = {
    created: {
      type: 'success' as const,
      title: 'Order Created',
      message: `Order #${orderNumber} has been created successfully`,
      priority: 'medium' as const,
    },
    updated: {
      type: 'info' as const,
      title: 'Order Updated',
      message: `Order #${orderNumber} has been updated`,
      priority: 'medium' as const,
    },
    approved: {
      type: 'success' as const,
      title: 'Order Approved',
      message: `Order #${orderNumber} has been approved`,
      priority: 'high' as const,
    },
    rejected: {
      type: 'error' as const,
      title: 'Order Rejected',
      message: `Order #${orderNumber} has been rejected`,
      priority: 'high' as const,
    },
    cancelled: {
      type: 'warning' as const,
      title: 'Order Cancelled',
      message: `Order #${orderNumber} has been cancelled`,
      priority: 'high' as const,
    },
  };

  const config = eventConfig[event];

  return await createNotification({
    user_id: userId,
    type: config.type,
    category: 'order',
    title: config.title,
    message: config.message,
    priority: config.priority,
    action_url: `/transactions/orders/${orderId}`,
    data: {
      order_id: orderId,
      order_number: orderNumber,
      event,
    },
    createdby: createdBy,
  });
}

/**
 * Create notification for workflow events
 */
export async function createWorkflowNotification(
  userId: number,
  workflowId: number,
  referenceNumber: string,
  event: 'created' | 'approved' | 'rejected' | 'pending',
  createdBy: number = 1
) {
  const eventConfig = {
    created: {
      type: 'info' as const,
      title: 'Workflow Created',
      message: `Workflow #${referenceNumber} has been created`,
      priority: 'medium' as const,
    },
    approved: {
      type: 'success' as const,
      title: 'Workflow Approved',
      message: `Workflow #${referenceNumber} has been approved`,
      priority: 'high' as const,
    },
    rejected: {
      type: 'error' as const,
      title: 'Workflow Rejected',
      message: `Workflow #${referenceNumber} has been rejected`,
      priority: 'high' as const,
    },
    pending: {
      type: 'warning' as const,
      title: 'Workflow Approval Required',
      message: `Workflow #${referenceNumber} requires your approval`,
      priority: 'high' as const,
    },
  };

  const config = eventConfig[event];

  return await createNotification({
    user_id: userId,
    type: config.type,
    category: 'workflow',
    title: config.title,
    message: config.message,
    priority: config.priority,
    action_url: `/workflows/approvals`,
    data: {
      workflow_id: workflowId,
      reference_number: referenceNumber,
      event,
    },
    createdby: createdBy,
  });
}

/**
 * Create notification for route exceptions
 */
export async function createRouteExceptionNotification(
  userId: number,
  exceptionId: number,
  routeName: string,
  exceptionType: string,
  description: string,
  severity: 'low' | 'medium' | 'high' = 'medium',
  createdBy: number = 1
) {
  const priorityMap = {
    low: 'low' as const,
    medium: 'medium' as const,
    high: 'high' as const,
  };

  return await createNotification({
    user_id: userId,
    type:
      severity === 'high'
        ? 'error'
        : severity === 'medium'
          ? 'warning'
          : 'info',
    category: 'route',
    title: 'Route Exception',
    message: `Exception (${exceptionType}) reported for route ${routeName}: ${description}`,
    priority: priorityMap[severity],
    action_url: `/workflows/exceptions/${exceptionId}`,
    data: {
      exception_id: exceptionId,
      route_name: routeName,
      exception_type: exceptionType,
      severity,
    },
    createdby: createdBy,
  });
}
