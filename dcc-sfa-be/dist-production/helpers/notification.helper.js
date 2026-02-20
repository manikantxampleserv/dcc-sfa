"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.createNotificationsForUsers = createNotificationsForUsers;
exports.createOrderNotification = createOrderNotification;
exports.createWorkflowNotification = createWorkflowNotification;
exports.createRouteExceptionNotification = createRouteExceptionNotification;
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
/**
 * Helper function to create notifications consistently across the application
 * @param params - Notification parameters
 * @returns Created notification
 */
async function createNotification(params) {
    const { user_id, type, category, title, message, priority = 'medium', action_url, data, expires_at, createdby = 1, } = params;
    // Validate required fields
    if (!user_id || !type || !category || !title || !message) {
        throw new Error('user_id, type, category, title, and message are required for notifications');
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
        const notification = await prisma_client_1.default.notifications.create({
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
    }
    catch (error) {
        console.error('Error creating notification:', error);
        throw new Error(`Failed to create notification: ${error.message}`);
    }
}
/**
 * Create notifications for multiple users
 * @param params - Array of notification parameters
 * @returns Array of created notifications
 */
async function createNotificationsForUsers(params) {
    const notifications = await Promise.all(params.map(param => createNotification(param)));
    return notifications;
}
/**
 * Create notification for a specific order event
 */
async function createOrderNotification(userId, orderId, orderNumber, event, createdBy = 1) {
    const eventConfig = {
        created: {
            type: 'success',
            title: 'Order Created',
            message: `Order #${orderNumber} has been created successfully`,
            priority: 'medium',
        },
        updated: {
            type: 'info',
            title: 'Order Updated',
            message: `Order #${orderNumber} has been updated`,
            priority: 'medium',
        },
        approved: {
            type: 'success',
            title: 'Order Approved',
            message: `Order #${orderNumber} has been approved`,
            priority: 'high',
        },
        rejected: {
            type: 'error',
            title: 'Order Rejected',
            message: `Order #${orderNumber} has been rejected`,
            priority: 'high',
        },
        cancelled: {
            type: 'warning',
            title: 'Order Cancelled',
            message: `Order #${orderNumber} has been cancelled`,
            priority: 'high',
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
async function createWorkflowNotification(userId, workflowId, referenceNumber, event, createdBy = 1) {
    const eventConfig = {
        created: {
            type: 'info',
            title: 'Workflow Created',
            message: `Workflow #${referenceNumber} has been created`,
            priority: 'medium',
        },
        approved: {
            type: 'success',
            title: 'Workflow Approved',
            message: `Workflow #${referenceNumber} has been approved`,
            priority: 'high',
        },
        rejected: {
            type: 'error',
            title: 'Workflow Rejected',
            message: `Workflow #${referenceNumber} has been rejected`,
            priority: 'high',
        },
        pending: {
            type: 'warning',
            title: 'Workflow Approval Required',
            message: `Workflow #${referenceNumber} requires your approval`,
            priority: 'high',
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
async function createRouteExceptionNotification(userId, exceptionId, routeName, exceptionType, description, severity = 'medium', createdBy = 1) {
    const priorityMap = {
        low: 'low',
        medium: 'medium',
        high: 'high',
    };
    return await createNotification({
        user_id: userId,
        type: severity === 'high'
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
//# sourceMappingURL=notification.helper.js.map