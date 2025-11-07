# How to Create Approval Workflows

This guide explains how to create approval workflows in the DCC-SFA application.

## Quick Start

### 1. Import the Helper Functions

```typescript
import {
  createApprovalWorkflow,
  createOrderApprovalWorkflow,
  createWorkflowNotification,
} from '../../helpers';
```

### 2. Choose Your Method

There are two ways to create workflows:

#### **Method A: Using Pre-built Helper (Recommended for Orders)**

For orders, use the specialized helper:

```typescript
import { createOrderApprovalWorkflow } from '../../helpers';

// Create workflow for an order
const workflow = await createOrderApprovalWorkflow(
  orderId, // number: Order ID
  'ORD-001', // string: Order number
  userId, // number: User who requested (salesperson)
  'high', // priority: 'low' | 'medium' | 'high' | 'urgent'
  {
    // optional: Additional order data
    total_amount: 50000,
    customer_id: 123,
    salesperson_id: 456,
  },
  userId // optional: Created by user ID
);
```

#### **Method B: Using Generic Helper (For Custom Workflows)**

For other entities (returns, expenses, etc.):

```typescript
import { createApprovalWorkflow, randomUUID } from '../../helpers';
import { randomUUID } from 'crypto';

const workflow = await createApprovalWorkflow({
  workflow_type: 'return', // 'order', 'return', 'expense', etc.
  reference_type: 'return_request',
  reference_id: randomUUID(), // UUID string
  reference_number: 'RET-001', // Human-readable reference
  requested_by: userId, // User who requested
  priority: 'medium', // 'low' | 'medium' | 'high' | 'urgent'
  request_data: {
    // Optional: Additional data
    return_id: 123,
    reason: 'Defective product',
  },
  createdby: userId, // Optional: Defaults to 1
});
```

## Workflow Templates

The system provides default templates based on `workflow_type`:

### Order Workflow (4 steps)

1. Salesperson Review (auto-completed)
2. Manager Approval
3. Finance Approval
4. Final Approval

### Return Workflow (4 steps)

1. Request Submitted (auto-completed)
2. Initial Review
3. Approval Decision
4. Processing

### Expense Workflow (3 steps)

1. Expense Submitted (auto-completed)
2. Manager Approval
3. Finance Approval

### Generic Workflow (3 steps)

1. Request Submitted (auto-completed)
2. Review
3. Approval

## Custom Workflow Steps

You can define custom steps:

```typescript
import { createApprovalWorkflow, randomUUID } from '../../helpers';
import { randomUUID } from 'crypto';

const workflow = await createApprovalWorkflow({
  workflow_type: 'custom',
  reference_type: 'custom_request',
  reference_id: randomUUID(),
  reference_number: 'CUST-001',
  requested_by: userId,
  priority: 'high',
  steps: [
    {
      step_number: 1,
      step_name: 'Initial Submission',
      is_required: false, // Optional step
    },
    {
      step_number: 2,
      step_name: 'Department Review',
      assigned_role: 'Department Head',
      assigned_user_id: 123, // Optional: Specific user
      is_required: true,
      due_date: new Date('2024-12-31'), // Optional: Deadline
    },
    {
      step_number: 3,
      step_name: 'Executive Approval',
      assigned_role: 'Executive',
      is_required: true,
    },
  ],
  request_data: {
    custom_field: 'value',
  },
});
```

## Complete Example: Creating Workflow for an Order

```typescript
import {
  createOrderApprovalWorkflow,
  createWorkflowNotification,
} from '../../helpers';

// In your controller/service
async function handleOrderApproval(order: Order, userId: number) {
  try {
    // Determine priority based on order amount
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (order.total_amount >= 100000) {
      priority = 'urgent';
    } else if (order.total_amount >= 50000) {
      priority = 'high';
    } else if (order.total_amount >= 10000) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Create the workflow
    const workflow = await createOrderApprovalWorkflow(
      order.id,
      order.order_number,
      order.salesperson_id,
      priority,
      {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        customer_id: order.customer_id,
      },
      userId
    );

    if (!workflow) {
      throw new Error('Failed to create workflow');
    }

    // Find approvers (e.g., manager, finance team)
    const approvers = await findApprovers(order);

    // Send notifications to approvers
    for (const approverId of approvers) {
      await createWorkflowNotification(
        approverId,
        workflow.id,
        order.order_number,
        'pending', // Event type
        userId
      );
    }

    return workflow;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}
```

## Example: Creating Workflow for Return Request

```typescript
import { createApprovalWorkflow, randomUUID } from '../../helpers';
import { randomUUID } from 'crypto';

async function createReturnWorkflow(
  returnRequest: ReturnRequest,
  userId: number
) {
  const workflow = await createApprovalWorkflow({
    workflow_type: 'return',
    reference_type: 'return_request',
    reference_id: randomUUID(),
    reference_number: returnRequest.return_number,
    requested_by: userId,
    priority: returnRequest.is_urgent ? 'high' : 'medium',
    request_data: {
      return_id: returnRequest.id,
      customer_id: returnRequest.customer_id,
      reason: returnRequest.reason,
      items_count: returnRequest.items.length,
    },
    createdby: userId,
  });

  return workflow;
}
```

## Example: Creating Custom Workflow

```typescript
import { createApprovalWorkflow, randomUUID } from '../../helpers';
import { randomUUID } from 'crypto';

async function createCustomWorkflow(
  entityId: number,
  entityNumber: string,
  userId: number
) {
  const workflow = await createApprovalWorkflow({
    workflow_type: 'credit_note',
    reference_type: 'credit_note',
    reference_id: randomUUID(),
    reference_number: entityNumber,
    requested_by: userId,
    priority: 'high',
    steps: [
      {
        step_number: 1,
        step_name: 'Credit Note Created',
        is_required: false,
      },
      {
        step_number: 2,
        step_name: 'Accountant Review',
        assigned_role: 'Accountant',
        is_required: true,
      },
      {
        step_number: 3,
        step_name: 'Finance Manager Approval',
        assigned_role: 'Finance Manager',
        is_required: true,
      },
      {
        step_number: 4,
        step_name: 'Final Approval',
        assigned_role: 'CFO',
        is_required: true,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    ],
    request_data: {
      credit_note_id: entityId,
      amount: 5000,
    },
    createdby: userId,
  });

  return workflow;
}
```

## Workflow Parameters Explained

### `CreateApprovalWorkflowParams`

| Parameter          | Type   | Required | Description                                           |
| ------------------ | ------ | -------- | ----------------------------------------------------- |
| `workflow_type`    | string | Yes      | Type: 'order', 'return', 'expense', etc.              |
| `reference_type`   | string | Yes      | Entity type: 'order', 'return_request', etc.          |
| `reference_id`     | string | Yes      | UUID string (use `randomUUID()`)                      |
| `reference_number` | string | Yes      | Human-readable number (e.g., 'ORD-001')               |
| `requested_by`     | number | Yes      | User ID who requested the workflow                    |
| `priority`         | string | No       | 'low', 'medium', 'high', 'urgent' (default: 'medium') |
| `request_data`     | any    | No       | Additional data (JSON stringified)                    |
| `steps`            | array  | No       | Custom steps (uses template if not provided)          |
| `createdby`        | number | No       | User ID who created (default: 1)                      |

### `WorkflowStepDefinition`

| Parameter          | Type    | Required | Description                               |
| ------------------ | ------- | -------- | ----------------------------------------- |
| `step_number`      | number  | Yes      | Sequential step number (1, 2, 3...)       |
| `step_name`        | string  | Yes      | Name of the step                          |
| `assigned_role`    | string  | No       | Role required to approve                  |
| `assigned_user_id` | number  | No       | Specific user assigned                    |
| `is_required`      | boolean | No       | Whether step is mandatory (default: true) |
| `due_date`         | Date    | No       | Step deadline                             |

## Best Practices

1. **Use Pre-built Helpers**: Use `createOrderApprovalWorkflow` for orders
2. **Set Appropriate Priority**: Based on amount, urgency, or business rules
3. **Include Request Data**: Store relevant IDs and context in `request_data`
4. **Send Notifications**: Use `createWorkflowNotification` to notify approvers
5. **Handle Errors**: Wrap in try-catch and handle failures gracefully
6. **Use Transactions**: Create workflows within database transactions when possible

## Next Steps

After creating a workflow:

1. **Send Notifications** to assigned approvers
2. **Track Progress** using workflow steps
3. **Process Approvals** when users approve/reject steps
4. **Update Entity Status** when workflow completes

## See Also

- `dcc-sfa-be/src/helpers/approvalWorkflow.helper.ts` - Helper implementation
- `dcc-sfa-be/src/v1/controllers/orders.controller.ts` - Example usage
- `dcc-sfa-be/docs/NOTIFICATIONS_GUIDE.md` - Notification guide
