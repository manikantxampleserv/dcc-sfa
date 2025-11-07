# Notifications System - Implementation Guide

## Overview

The notifications system allows you to create, manage, and display notifications to users in the DCC-SFA application. Notifications can be created programmatically from backend services or manually through the API.

## Database Schema

```prisma
model notifications {
  id         Int       @id @default(autoincrement())
  user_id    Int       // Required: ID of the user who will receive the notification
  type       String    // Required: 'success', 'warning', 'info', 'error'
  category   String    // Required: Category of notification (e.g., 'order', 'workflow', 'system')
  title      String    // Required: Short title/heading
  message    String    // Required: Detailed message content
  data       String?   // Optional: JSON string for additional data
  is_read    String    @default("N") // 'Y' or 'N'
  priority   String?   @default("medium") // 'low', 'medium', 'high'
  action_url String?   // Optional: URL to navigate when notification is clicked
  expires_at DateTime? // Optional: Expiration date/time
  createdate DateTime? @default(now())
  read_at    DateTime? // Set when notification is marked as read
  createdby  Int       // ID of user who created the notification
  updatedate DateTime?
  updatedby  Int?
  log_inst   Int?
}
```

## API Endpoint

### Create Notification

**POST** `/api/v1/notifications`

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "user_id": 1, // Required: ID of recipient user
  "type": "info", // Required: 'success' | 'warning' | 'info' | 'error'
  "category": "order", // Required: Category name (max 20 chars)
  "title": "New Order Created", // Required: Title (max 255 chars)
  "message": "Order #12345 has been created successfully", // Required: Message content
  "priority": "medium", // Optional: 'low' | 'medium' | 'high' (default: 'medium')
  "action_url": "/orders/12345", // Optional: URL to navigate on click
  "data": {
    // Optional: Additional data (will be JSON stringified)
    "order_id": 12345,
    "order_number": "ORD-001"
  },
  "expires_at": "2024-12-31T23:59:59Z" // Optional: ISO date string
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "type": "info",
    "category": "order",
    "title": "New Order Created",
    "message": "Order #12345 has been created successfully",
    "is_read": false,
    "priority": "medium",
    "action_url": "/orders/12345",
    "createdate": "2024-01-15T10:30:00Z"
  }
}
```

## Implementation Methods

### Method 1: Programmatic Creation (Backend)

Create notifications automatically when events occur in your controllers/services.

#### Example: Creating Notification in Order Controller

```typescript
// In dcc-sfa-be/src/v1/controllers/orders.controller.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async createOrUpdateOrder(req: Request, res: Response) {
  try {
    // ... existing order creation logic ...

    const order = await prisma.orders.create({
      data: orderData
    });

    // Create notification for the order creator
    await prisma.notifications.create({
      data: {
        user_id: userId,
        type: 'success',
        category: 'order',
        title: 'Order Created Successfully',
        message: `Order #${order.order_number} has been created successfully`,
        priority: 'medium',
        action_url: `/orders/${order.id}`,
        data: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number
        }),
        is_read: 'N',
        createdby: userId,
        createdate: new Date(),
      },
    });

    // Create notification for approver (if needed)
    if (order.requires_approval) {
      await prisma.notifications.create({
        data: {
          user_id: approverId,
          type: 'info',
          category: 'workflow',
          title: 'Order Approval Required',
          message: `Order #${order.order_number} requires your approval`,
          priority: 'high',
          action_url: `/workflows/approvals/${order.id}`,
          is_read: 'N',
          createdby: userId,
          createdate: new Date(),
        },
      });
    }

    res.success('Order created successfully', order);
  } catch (error) {
    res.error(error.message);
  }
}
```

#### Example: Creating Notification in Workflow Service

```typescript
// In dcc-sfa-be/src/v1/services/workflow.service.ts
async approveWorkflow(workflowId: number, approverId: number) {
  const workflow = await prisma.workflows.update({
    where: { id: workflowId },
    data: { status: 'approved', approved_by: approverId }
  });

  // Notify the requester
  await prisma.notifications.create({
    data: {
      user_id: workflow.requested_by,
      type: 'success',
      category: 'workflow',
      title: 'Workflow Approved',
      message: `Your workflow request #${workflow.reference_number} has been approved`,
      priority: 'medium',
      action_url: `/workflows/approvals/${workflowId}`,
      is_read: 'N',
      createdby: approverId,
      createdate: new Date(),
    },
  });
}
```

### Method 2: Using Helper Function (Recommended)

Create a reusable helper function for consistent notification creation:

```typescript
// In dcc-sfa-be/src/utils/notificationHelper.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateNotificationParams {
  user_id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  category: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  action_url?: string;
  data?: any;
  expires_at?: Date;
  createdby?: number;
}

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

  return await prisma.notifications.create({
    data: {
      user_id,
      type,
      category,
      title,
      message,
      priority,
      action_url,
      data: data ? JSON.stringify(data) : null,
      expires_at,
      is_read: 'N',
      createdby,
      createdate: new Date(),
    },
  });
}

// Usage in controllers:
import { createNotification } from '../../utils/notificationHelper';

await createNotification({
  user_id: userId,
  type: 'info',
  category: 'order',
  title: 'Order Status Updated',
  message: `Order #${orderNumber} status changed to ${status}`,
  priority: 'high',
  action_url: `/orders/${orderId}`,
  data: { order_id: orderId, status },
  createdby: req.user?.id,
});
```

### Method 3: Frontend Creation (Manual)

For admin/testing purposes, you can create notifications from the frontend:

```typescript
// In frontend component
import { useCreateNotification } from 'hooks/useNotifications';

const MyComponent = () => {
  const createNotification = useCreateNotification();

  const handleCreateNotification = async () => {
    try {
      await createNotification.mutateAsync({
        user_id: 1,
        type: 'info',
        category: 'system',
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'medium',
        action_url: '/dashboard',
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  return <button onClick={handleCreateNotification}>Create Notification</button>;
};
```

## Common Use Cases

### 1. Order-Related Notifications

```typescript
// Order created
await createNotification({
  user_id: order.created_by,
  type: 'success',
  category: 'order',
  title: 'Order Created',
  message: `Order #${order.order_number} has been created`,
  action_url: `/orders/${order.id}`,
});

// Order requires approval
await createNotification({
  user_id: approverId,
  type: 'warning',
  category: 'order',
  title: 'Approval Required',
  message: `Order #${order.order_number} requires your approval`,
  priority: 'high',
  action_url: `/workflows/approvals/${order.id}`,
});
```

### 2. Workflow Notifications

```typescript
// Workflow approved
await createNotification({
  user_id: workflow.requested_by,
  type: 'success',
  category: 'workflow',
  title: 'Workflow Approved',
  message: `Workflow #${workflow.reference_number} has been approved`,
  action_url: `/workflows/approvals/${workflow.id}`,
});

// Workflow rejected
await createNotification({
  user_id: workflow.requested_by,
  type: 'error',
  category: 'workflow',
  title: 'Workflow Rejected',
  message: `Workflow #${workflow.reference_number} has been rejected`,
  priority: 'high',
  action_url: `/workflows/approvals/${workflow.id}`,
});
```

### 3. System Alerts

```typescript
// Low stock alert
await createNotification({
  user_id: warehouseManagerId,
  type: 'warning',
  category: 'inventory',
  title: 'Low Stock Alert',
  message: `Product ${product.name} is running low (${stock} units remaining)`,
  priority: 'high',
  action_url: `/products/${product.id}`,
  data: { product_id: product.id, current_stock: stock },
});
```

### 4. Route Exceptions

```typescript
// Route exception reported
await createNotification({
  user_id: routeManagerId,
  type: 'error',
  category: 'route',
  title: 'Route Exception',
  message: `Exception reported for route ${route.name}: ${exception.description}`,
  priority: 'high',
  action_url: `/workflows/exceptions/${exception.id}`,
  data: { route_id: route.id, exception_id: exception.id },
});
```

## Best Practices

1. **Always set appropriate priority:**
   - `high`: Urgent actions required (approvals, errors)
   - `medium`: Important but not urgent (status updates)
   - `low`: Informational (general updates)

2. **Use meaningful categories:**
   - `order`, `workflow`, `inventory`, `route`, `system`, `user`

3. **Include action URLs:**
   - Always provide `action_url` so users can navigate directly to relevant pages

4. **Set expiration dates:**
   - For time-sensitive notifications, set `expires_at` to auto-cleanup

5. **Use data field for context:**
   - Store relevant IDs and metadata in `data` field for future reference

6. **Notify the right users:**
   - Notify users who need to take action or are affected by the event

7. **Handle errors gracefully:**
   - Wrap notification creation in try-catch to prevent breaking main flow

## Error Handling

```typescript
try {
  await createNotification({
    user_id: userId,
    type: 'info',
    category: 'order',
    title: 'Order Updated',
    message: 'Order has been updated',
  });
} catch (error) {
  console.error('Failed to create notification:', error);
  // Don't throw - notification failure shouldn't break main flow
}
```

## Testing

You can test notification creation using:

1. **Postman/Thunder Client:**

   ```
   POST http://localhost:3000/api/v1/notifications
   Headers: Authorization: Bearer <token>
   Body: { ... notification data ... }
   ```

2. **Frontend Hook:**

   ```typescript
   const createNotification = useCreateNotification();
   await createNotification.mutateAsync({ ... });
   ```

3. **Backend Service:**
   ```typescript
   await createNotification({ ... });
   ```

## Summary

The correct procedure for adding notifications:

1. **Identify the event** that should trigger a notification
2. **Determine the recipient** user(s)
3. **Choose appropriate type, category, and priority**
4. **Create the notification** using:
   - Direct Prisma call in controllers/services
   - Helper function for consistency
   - API endpoint for manual creation
5. **Handle errors** gracefully without breaking main flow
6. **Test** to ensure notifications appear correctly
