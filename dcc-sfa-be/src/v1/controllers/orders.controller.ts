import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import {
  createOrderApprovalWorkflow,
  createOrderNotification,
  createWorkflowNotification,
} from '../../helpers';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface OrderSerialized {
  id: number;
  order_number: string;
  parent_id: number;
  salesperson_id: number;
  order_date?: Date | null;
  delivery_date?: Date | null;
  status?: string | null;
  priority?: string | null;
  order_type?: string | null;
  payment_method?: string | null;
  payment_terms?: string | null;
  subtotal?: number | null;
  discount_amount?: number | null;
  tax_amount?: number | null;
  shipping_amount?: number | null;
  total_amount?: number | null;
  notes?: string | null;
  shipping_address?: string | null;
  approval_status?: string | null;
  approved_by?: number | null;
  approved_at?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  currency?: { id: number; code: string; name: string } | null;
  customer?: { id: number; name: string; code: string; type: string };
  salesperson?: {
    id: number;
    name: string;
    email: string;
    profile_image: string;
  } | null;
  order_items?: {
    id: number;
    product_id: number;
    product_name?: string;
    unit?: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_amount?: number;
    total_amount?: number;
    notes?: string;
  }[];
  invoices?: { id: number; invoice_number: string; amount: number }[];
}

const serializeOrder = (order: any): OrderSerialized => ({
  id: order.id,
  order_number: order.order_number,
  parent_id: order.parent_id,
  salesperson_id: order.salesperson_id,
  order_date: order.order_date,
  delivery_date: order.delivery_date,
  status: order.status,
  priority: order.priority,
  order_type: order.order_type,
  payment_method: order.payment_method,
  payment_terms: order.payment_terms,
  subtotal: order.subtotal ? Number(order.subtotal) : null,
  discount_amount: order.discount_amount ? Number(order.discount_amount) : null,
  tax_amount: order.tax_amount ? Number(order.tax_amount) : null,
  shipping_amount: order.shipping_amount ? Number(order.shipping_amount) : null,
  total_amount: order.total_amount ? Number(order.total_amount) : null,
  notes: order.notes,
  shipping_address: order.shipping_address,
  approval_status: order.approval_status,
  approved_by: order.approved_by,
  approved_at: order.approved_at,
  is_active: order.is_active,
  createdate: order.createdate,
  createdby: order.createdby,
  updatedate: order.updatedate,
  updatedby: order.updatedby,
  log_inst: order.log_inst,
  currency: order.orders_currencies
    ? {
        id: order.orders_currencies.id,
        code: order.orders_currencies.code,
        name: order.orders_currencies.name,
      }
    : null,
  customer: order.orders_customers
    ? {
        id: order.orders_customers.id,
        name: order.orders_customers.name,
        code: order.orders_customers.code,
        type: order.orders_customers.type,
      }
    : undefined,
  salesperson: order.orders_salesperson_users
    ? {
        id: order.orders_salesperson_users.id,
        name: order.orders_salesperson_users.name || 'N/A',
        email: order.orders_salesperson_users.email,
        profile_image: order.orders_salesperson_users.profile_image,
      }
    : null,

  order_items:
    order.order_items?.map((oi: any) => ({
      id: oi.id,
      product_id: oi.product_id,
      product_name: oi.product_name,
      unit: oi.unit,
      quantity: oi.quantity,
      unit_price: Number(oi.unit_price),
      discount_amount: oi.discount_amount
        ? Number(oi.discount_amount)
        : undefined,
      tax_amount: oi.tax_amount ? Number(oi.tax_amount) : undefined,
      total_amount: oi.total_amount ? Number(oi.total_amount) : undefined,
      notes: oi.notes,
    })) || [],

  invoices:
    order.invoices?.map((inv: any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: inv.amount,
    })) || [],
});

async function generateOrderNumber(tx: any): Promise<string> {
  const maxRetries = 10;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const lastOrder = await tx.orders.findFirst({
        where: {
          order_number: {
            startsWith: 'ORD-',
          },
        },
        orderBy: {
          id: 'desc',
        },
        select: {
          order_number: true,
        },
      });

      let nextNumber = 1;

      if (lastOrder && lastOrder.order_number) {
        const match = lastOrder.order_number.match(/ORD-(\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      const allOrders = await tx.orders.findMany({
        where: {
          order_number: {
            startsWith: 'ORD-',
          },
        },
        select: {
          order_number: true,
        },
      });

      for (const order of allOrders) {
        const match = order.order_number.match(/ORD-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num >= nextNumber) {
            nextNumber = num + 1;
          }
        }
      }

      const newOrderNumber = `ORD-${nextNumber.toString().padStart(5, '0')}`;

      const exists = await tx.orders.findFirst({
        where: {
          order_number: newOrderNumber,
        },
      });

      if (!exists) {
        console.log(' Generated unique order number:', newOrderNumber);
        return newOrderNumber;
      }

      console.log(' Order number exists, retrying...', newOrderNumber);
      retryCount++;
    } catch (error) {
      console.error('Error generating order number:', error);
      retryCount++;

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const timestamp = Date.now();
  const fallbackOrderNumber = `ORD-${timestamp}`;
  return fallbackOrderNumber;
}

export const ordersController = {
  async createOrUpdateOrder(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      const { orderItems, order_items, ...orderData } = data;
      const items = orderItems || order_items || [];
      let orderId = orderData.id;

      console.log(' Processing order with items:', {
        orderId,
        orderNumber: orderData.order_number,
        itemsCount: items.length,
      });

      const result = await prisma.$transaction(
        async tx => {
          let order;
          let isUpdate = false;

          if (!orderId && orderData.order_number) {
            const existingOrder = await tx.orders.findFirst({
              where: { order_number: orderData.order_number },
            });
            if (existingOrder) {
              orderId = existingOrder.id;
              isUpdate = true;
              console.log(' Found existing order by order_number:', orderId);
            }
          } else if (orderId) {
            isUpdate = true;
          }

          let orderNumber = orderData.order_number;
          if (!isUpdate && !orderNumber) {
            orderNumber = await generateOrderNumber(tx);
            console.log(' Generated new order number:', orderNumber);
          }

          const orderPayload = {
            order_number: orderNumber,
            parent_id: orderData.parent_id,
            salesperson_id: orderData.salesperson_id,
            currency_id: orderData.currency_id || null,
            order_date: orderData.order_date
              ? new Date(orderData.order_date)
              : undefined,
            delivery_date: orderData.delivery_date
              ? new Date(orderData.delivery_date)
              : undefined,
            status: orderData.status || 'draft',
            priority: orderData.priority || 'medium',
            order_type: orderData.order_type || 'regular',
            payment_method: orderData.payment_method || 'credit',
            payment_terms: orderData.payment_terms || 'Net 30',
            subtotal: parseFloat(orderData.subtotal) || 0,
            discount_amount: parseFloat(orderData.discount_amount) || 0,
            tax_amount: parseFloat(orderData.tax_amount) || 0,
            shipping_amount: parseFloat(orderData.shipping_amount) || 0,
            total_amount: parseFloat(orderData.total_amount) || 0,
            notes: orderData.notes || null,
            shipping_address: orderData.shipping_address || null,
            approval_status: orderData.approval_status || 'pending',
            is_active: orderData.is_active || 'Y',
          };

          if (isUpdate && orderId) {
            const updatePayload = { ...orderPayload };
            if (!orderData.order_number) {
              delete updatePayload.order_number;
            }

            order = await tx.orders.update({
              where: { id: orderId },
              data: {
                ...updatePayload,
                updatedate: new Date(),
                updatedby: userId,
                log_inst: { increment: 1 },
              },
            });
            console.log(' Order updated, ID:', order.id);
          } else {
            order = await tx.orders.create({
              data: {
                ...orderPayload,
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });
            console.log(' Order created, ID:', order.id);
          }

          console.log(
            ' Order processed - ID:',
            order.id,
            'Number:',
            order.order_number
          );

          const processedChildIds: number[] = [];

          if (Array.isArray(items) && items.length > 0) {
            const itemsToCreate = [];
            const itemsToUpdate = [];

            for (const item of items) {
              console.log('Processing item:', item);

              const unitPrice = parseFloat(
                item.unit_price || item.price || '0'
              );
              const quantity = parseInt(item.quantity) || 1;
              const discountAmount = parseFloat(item.discount_amount || '0');
              const taxAmount = parseFloat(item.tax_amount || '0');
              const totalAmount = item.total_amount
                ? parseFloat(item.total_amount)
                : unitPrice * quantity - discountAmount + taxAmount;

              const itemData = {
                product_id: item.product_id,
                product_name: item.product_name || null,
                unit: item.unit || null,
                quantity: quantity,
                unit_price: unitPrice,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                notes: item.notes || null,
              };

              if (item.id) {
                const existingItem = await tx.order_items.findFirst({
                  where: {
                    id: item.id,
                    parent_id: order.id,
                  },
                });

                if (existingItem) {
                  itemsToUpdate.push({ id: item.id, data: itemData });
                  processedChildIds.push(item.id);
                  console.log(`Item ${item.id} will be updated`);
                } else {
                  itemsToCreate.push({
                    ...itemData,
                    parent_id: order.id,
                  });
                  console.log(
                    ` Item ${item.id} doesn't belong to this order, creating new`
                  );
                }
              } else {
                itemsToCreate.push({
                  ...itemData,
                  parent_id: order.id,
                });
              }
            }

            if (itemsToCreate.length > 0) {
              const createdItems = await tx.order_items.createMany({
                data: itemsToCreate,
              });
              console.log(`Created ${createdItems.count} new items`);

              const newItems = await tx.order_items.findMany({
                where: {
                  parent_id: order.id,
                  id:
                    processedChildIds.length > 0
                      ? { notIn: processedChildIds }
                      : undefined,
                },
                select: { id: true },
                orderBy: { id: 'desc' },
                take: createdItems.count,
              });
              processedChildIds.push(...newItems.map(item => item.id));
              console.log(
                ' New item IDs:',
                newItems.map(item => item.id)
              );
            }

            for (const { id, data } of itemsToUpdate) {
              await tx.order_items.update({
                where: { id },
                data,
              });
              console.log(' Updated item ID:', id);
            }

            if (isUpdate && orderId) {
              const itemsToDelete = await tx.order_items.findMany({
                where: {
                  parent_id: order.id,
                  id:
                    processedChildIds.length > 0
                      ? { notIn: processedChildIds }
                      : undefined,
                },
                select: { id: true },
              });

              if (itemsToDelete.length > 0) {
                const deletedCount = await tx.order_items.deleteMany({
                  where: {
                    parent_id: order.id,
                    id: { notIn: processedChildIds },
                  },
                });
                console.log(
                  'Deleted items count:',
                  deletedCount.count,
                  'IDs:',
                  itemsToDelete.map(i => i.id)
                );
              }
            }
          } else if (isUpdate && orderId) {
            const deletedCount = await tx.order_items.deleteMany({
              where: { parent_id: order.id },
            });
            console.log(' Deleted all items, count:', deletedCount.count);
          }

          const finalOrder = await tx.orders.findUnique({
            where: { id: order.id },
            include: {
              orders_currencies: true,
              orders_customers: true,
              orders_salesperson_users: true,
              order_items: true,
              invoices: true,
            },
          });

          console.log(
            ' Final order items count:',
            finalOrder?.order_items?.length || 0
          );
          if (finalOrder?.order_items && finalOrder.order_items.length > 0) {
            console.log(' Sample item:', finalOrder.order_items[0]);
          }

          return finalOrder;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );

      // Create notifications after successful order creation/update
      if (result) {
        try {
          const orderEvent = orderId ? 'updated' : 'created';
          const orderCreatorId = result.createdby || userId;

          // Notify the order creator
          await createOrderNotification(
            orderCreatorId,
            result.id,
            result.order_number || '',
            orderEvent,
            userId
          );

          // If order requires approval, create approval workflow and notify approvers
          // Check if workflow already exists to prevent duplicates
          const existingWorkflow = await prisma.approval_workflows.findFirst({
            where: {
              reference_type: 'order',
              reference_number: result.order_number || '',
              status: 'P',
            },
          });

          if (
            !existingWorkflow &&
            (result.approval_status === 'pending' ||
              result.approval_status === 'submitted')
          ) {
            try {
              // Determine priority based on order amount or other criteria
              let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
              if (result.total_amount) {
                const totalAmount = Number(result.total_amount);
                if (totalAmount >= 100000) {
                  priority = 'urgent';
                } else if (totalAmount >= 50000) {
                  priority = 'high';
                } else if (totalAmount >= 10000) {
                  priority = 'medium';
                } else {
                  priority = 'low';
                }
              }

              // Create approval workflow
              const workflow = await createOrderApprovalWorkflow(
                result.id,
                result.order_number || '',
                orderCreatorId,
                priority,
                {
                  order_id: result.id,
                  order_number: result.order_number,
                  total_amount: result.total_amount,
                  customer_id: result.parent_id,
                  salesperson_id: result.salesperson_id,
                },
                userId
              );

              if (!workflow) {
                throw new Error('Failed to create approval workflow');
              }

              // Get salesperson's manager or find approvers based on business logic
              if (result.salesperson_id) {
                const salesperson = await prisma.users.findUnique({
                  where: { id: result.salesperson_id },
                  include: {
                    user_role: {
                      include: {
                        roles_permission: {
                          include: {
                            permission: true,
                          },
                        },
                      },
                    },
                  },
                });

                // Find users who can approve (based on role or manager hierarchy)
                const approvers: number[] = [];

                // If salesperson has a parent (manager), add them as approver
                if (salesperson?.parent_id) {
                  approvers.push(salesperson.parent_id);
                }

                // Find users with Manager role for step 2
                if (
                  workflow.workflow_steps &&
                  workflow.workflow_steps.length > 1
                ) {
                  const managerStep = workflow.workflow_steps.find(
                    s => s.step_name === 'Manager Approval'
                  );
                  if (managerStep && managerStep.assigned_role) {
                    const managers = await prisma.users.findMany({
                      where: {
                        user_role: {
                          name: {
                            contains: 'Manager',
                          },
                        },
                        is_active: 'Y',
                      },
                      select: { id: true },
                    });
                    managers.forEach(m => {
                      if (!approvers.includes(m.id)) {
                        approvers.push(m.id);
                      }
                    });
                  }
                }

                // Send notifications to all approvers
                for (const approverId of approvers) {
                  await createWorkflowNotification(
                    approverId,
                    workflow.id,
                    result.order_number || '',
                    'pending',
                    userId
                  );
                }

                // Also notify the order creator
                await createWorkflowNotification(
                  orderCreatorId,
                  workflow.id,
                  result.order_number || '',
                  'created',
                  userId
                );
              }
            } catch (workflowError) {
              // Log error but don't fail the order creation
              console.error('Error creating approval workflow:', workflowError);
            }
          }
        } catch (notificationError) {
          // Log error but don't fail the order creation/update
          console.error(
            'Error creating order notification:',
            notificationError
          );
        }
      }

      res.status(orderId ? 200 : 201).json({
        message: orderId
          ? 'Order updated successfully'
          : 'Order created successfully',
        data: serializeOrder(result),
      });
    } catch (error: any) {
      console.error(' Error processing order:', error);
      res.status(500).json({
        message: 'Failed to process order',
        error: error.message,
      });
    }
  },

  async getAllOrders(req: any, res: any) {
    try {
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const filters: any = {
        ...(search && {
          OR: [
            { order_number: { contains: searchLower } },
            { status: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.orders,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          orders_currencies: true,
          orders_customers: true,
          orders_salesperson_users: true,
          order_items: true,
          invoices: true,
        },
      });

      const totalOrders = await prisma.orders.count();
      const activeOrders = await prisma.orders.count({
        where: { is_active: 'Y' },
      });
      const inactiveOrders = await prisma.orders.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const ordersThisMonth = await prisma.orders.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Orders retrieved successfully',
        data.map((order: any) => serializeOrder(order)),
        200,
        pagination,
        {
          total_orders: totalOrders,
          active_orders: activeOrders,
          inactive_orders: inactiveOrders,
          orders_this_month: ordersThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Orders Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getOrdersById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await prisma.orders.findUnique({
        where: { id: Number(id) },
        include: {
          orders_currencies: true,
          orders_customers: true,
          orders_salesperson_users: true,
          order_items: true,
          invoices: true,
        },
      });

      if (!order) return res.status(404).json({ message: 'Order not found' });

      res.json({
        message: 'Order fetched successfully',
        data: serializeOrder(order),
      });
    } catch (error: any) {
      console.error('Get Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateOrders(req: any, res: any) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;
      const { orderItems, order_items, ...orderData } = req.body;
      const items = orderItems || order_items || [];

      const existingOrder = await prisma.orders.findUnique({
        where: { id: Number(id) },
      });

      if (!existingOrder)
        return res.status(404).json({ message: 'Order not found' });

      const result = await prisma.$transaction(
        async tx => {
          // Prepare order update data (excluding order_items)
          const orderPayload = {
            order_number: orderData.order_number,
            parent_id: orderData.parent_id,
            salesperson_id: orderData.salesperson_id,
            currency_id: orderData.currency_id || null,
            order_date: orderData.order_date
              ? new Date(orderData.order_date)
              : undefined,
            delivery_date: orderData.delivery_date
              ? new Date(orderData.delivery_date)
              : undefined,
            status: orderData.status,
            priority: orderData.priority,
            order_type: orderData.order_type,
            payment_method: orderData.payment_method,
            payment_terms: orderData.payment_terms,
            subtotal: parseFloat(orderData.subtotal) || 0,
            discount_amount: parseFloat(orderData.discount_amount) || 0,
            tax_amount: parseFloat(orderData.tax_amount) || 0,
            shipping_amount: parseFloat(orderData.shipping_amount) || 0,
            total_amount: parseFloat(orderData.total_amount) || 0,
            notes: orderData.notes || null,
            shipping_address: orderData.shipping_address || null,
            approval_status: orderData.approval_status,
            is_active: orderData.is_active,
            updatedate: new Date(),
            updatedby: userId,
            log_inst: { increment: 1 },
          };

          // Update the order
          const order = await tx.orders.update({
            where: { id: Number(id) },
            data: orderPayload,
          });

          // Handle order items if provided
          if (Array.isArray(items) && items.length > 0) {
            // Delete existing order items
            await tx.order_items.deleteMany({
              where: { parent_id: order.id },
            });

            // Create new order items
            const itemsToCreate = items.map((item: any) => {
              const unitPrice = parseFloat(
                item.unit_price || item.price || '0'
              );
              const quantity = parseInt(item.quantity) || 1;
              const discountAmount = parseFloat(item.discount_amount || '0');
              const taxAmount = parseFloat(item.tax_amount || '0');
              const totalAmount = item.total_amount
                ? parseFloat(item.total_amount)
                : unitPrice * quantity - discountAmount + taxAmount;

              return {
                parent_id: order.id,
                product_id: item.product_id,
                product_name: item.product_name || null,
                unit: item.unit || null,
                quantity: quantity,
                unit_price: unitPrice,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                notes: item.notes || null,
              };
            });

            await tx.order_items.createMany({
              data: itemsToCreate,
            });
          }

          // Fetch the complete order with relations
          const finalOrder = await tx.orders.findUnique({
            where: { id: order.id },
            include: {
              orders_currencies: true,
              orders_customers: true,
              orders_salesperson_users: true,
              order_items: true,
              invoices: true,
            },
          });

          return finalOrder;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );

      // Create notification after successful order update
      if (result) {
        try {
          const orderCreatorId = result.createdby || userId;
          const previousApprovalStatus = existingOrder.approval_status;

          // Notify the order creator about the update
          await createOrderNotification(
            orderCreatorId,
            result.id,
            result.order_number || '',
            'updated',
            userId
          );

          // If order status changed to cancelled or rejected, notify
          if (
            result.status === 'cancelled' ||
            result.approval_status === 'rejected'
          ) {
            await createOrderNotification(
              orderCreatorId,
              result.id,
              result.order_number || '',
              result.status === 'cancelled' ? 'cancelled' : 'rejected',
              userId
            );
          }

          // If approval_status changed from non-pending to pending/submitted, create workflow
          if (
            previousApprovalStatus !== 'pending' &&
            previousApprovalStatus !== 'submitted' &&
            (result.approval_status === 'pending' ||
              result.approval_status === 'submitted')
          ) {
            // Check if workflow already exists
            const existingWorkflow = await prisma.approval_workflows.findFirst({
              where: {
                reference_type: 'order',
                reference_number: result.order_number || '',
                status: {
                  in: ['pending', 'in_progress'],
                },
              },
            });

            if (!existingWorkflow) {
              try {
                // Determine priority based on order amount
                let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
                if (result.total_amount) {
                  const totalAmount = Number(result.total_amount);
                  if (totalAmount >= 100000) {
                    priority = 'urgent';
                  } else if (totalAmount >= 50000) {
                    priority = 'high';
                  } else if (totalAmount >= 10000) {
                    priority = 'medium';
                  } else {
                    priority = 'low';
                  }
                }

                // Create approval workflow
                const workflow = await createOrderApprovalWorkflow(
                  result.id,
                  result.order_number || '',
                  orderCreatorId,
                  priority,
                  {
                    order_id: result.id,
                    order_number: result.order_number,
                    total_amount: result.total_amount,
                    customer_id: result.parent_id,
                    salesperson_id: result.salesperson_id,
                  },
                  userId
                );

                if (workflow) {
                  // Get salesperson's manager or find approvers
                  if (result.salesperson_id) {
                    const salesperson = await prisma.users.findUnique({
                      where: { id: result.salesperson_id },
                      include: {
                        user_role: {
                          include: {
                            roles_permission: {
                              include: {
                                permission: true,
                              },
                            },
                          },
                        },
                      },
                    });

                    const approvers: number[] = [];

                    if (salesperson?.parent_id) {
                      approvers.push(salesperson.parent_id);
                    }

                    if (
                      workflow.workflow_steps &&
                      workflow.workflow_steps.length > 1
                    ) {
                      const managerStep = workflow.workflow_steps.find(
                        s => s.step_name === 'Manager Approval'
                      );
                      if (managerStep && managerStep.assigned_role) {
                        const managers = await prisma.users.findMany({
                          where: {
                            user_role: {
                              name: {
                                contains: 'Manager',
                              },
                            },
                            is_active: 'Y',
                          },
                          select: { id: true },
                        });
                        managers.forEach(m => {
                          if (!approvers.includes(m.id)) {
                            approvers.push(m.id);
                          }
                        });
                      }
                    }

                    // Send notifications to approvers
                    for (const approverId of approvers) {
                      await createWorkflowNotification(
                        approverId,
                        workflow.id,
                        result.order_number || '',
                        'pending',
                        userId
                      );
                    }

                    // Notify the order creator
                    await createWorkflowNotification(
                      orderCreatorId,
                      workflow.id,
                      result.order_number || '',
                      'created',
                      userId
                    );
                  }
                }
              } catch (workflowError) {
                console.error(
                  'Error creating approval workflow:',
                  workflowError
                );
              }
            }
          }
        } catch (notificationError) {
          // Log error but don't fail the order update
          console.error(
            'Error creating order notification:',
            notificationError
          );
        }
      }

      res.json({
        message: 'Order updated successfully',
        data: serializeOrder(result),
      });
    } catch (error: any) {
      console.error('Update Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteOrders(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingOrder = await prisma.orders.findUnique({
        where: { id: Number(id) },
      });

      if (!existingOrder)
        return res.status(404).json({ message: 'Order not found' });

      await prisma.orders.delete({ where: { id: Number(id) } });

      res.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
      console.error('Delete Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
