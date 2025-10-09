import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
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
  customer?: { id: number; name: string };
  salesperson?: { id: number; name: string; email: string } | null;
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
    ? { id: order.orders_customers.id, name: order.orders_customers.name }
    : undefined,
  salesperson: order.orders_salesperson_users
    ? {
        id: order.orders_salesperson_users.id,
        name:
          `${order.orders_salesperson_users.first_name || ''} ${order.orders_salesperson_users.last_name || ''}`.trim() ||
          'N/A',
        email: order.orders_salesperson_users.email,
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

export const ordersController = {
  async createOrUpdateOrder(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      const { orderItems, order_items, ...orderData } = data;
      const items = orderItems || order_items || [];
      const orderId = orderData.id;

      console.log('Processing order with items:', {
        orderId,
        itemsCount: items.length,
      });

      const result = await prisma.$transaction(
        async tx => {
          let order;

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

          if (orderId) {
            order = await tx.orders.update({
              where: { id: orderId },
              data: {
                ...orderPayload,
                updatedate: new Date(),
                updatedby: userId,
                log_inst: { increment: 1 },
              },
            });
          } else {
            order = await tx.orders.create({
              data: {
                ...orderPayload,
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });
          }

          console.log('Order processed, ID:', order.id);

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
                itemsToUpdate.push({ id: item.id, data: itemData });
                processedChildIds.push(item.id);
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
                  id: { notIn: processedChildIds },
                },
                select: { id: true },
              });
              processedChildIds.push(...newItems.map(item => item.id));
            }

            for (const { id, data } of itemsToUpdate) {
              await tx.order_items.update({
                where: { id },
                data,
              });
              console.log('Updated item ID:', id);
            }

            if (orderId) {
              const deletedCount = await tx.order_items.deleteMany({
                where: {
                  parent_id: order.id,
                  id: { notIn: processedChildIds },
                },
              });
              if (deletedCount.count > 0) {
                console.log('Deleted items count:', deletedCount.count);
              }
            }
          } else if (orderId) {
            await tx.order_items.deleteMany({
              where: { parent_id: order.id },
            });
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

          return finalOrder;
        },
        {
          maxWait: 5000,
          timeout: 10000,
        }
      );

      console.log('Final order items count:', result?.order_items?.length || 0);
      console.log('Sample item:', result?.order_items?.[0]);

      res.status(orderId ? 200 : 201).json({
        message: orderId
          ? 'Order updated successfully'
          : 'Order created successfully',
        data: serializeOrder(result),
      });
    } catch (error: any) {
      console.error('Error processing order:', error);
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
      const existingOrder = await prisma.orders.findUnique({
        where: { id: Number(id) },
      });

      if (!existingOrder)
        return res.status(404).json({ message: 'Order not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const order = await prisma.orders.update({
        where: { id: Number(id) },
        data,
        include: {
          orders_currencies: true,
          orders_customers: true,
          orders_salesperson_users: true,
          order_items: true, // ✅ Fixed: was order_items
          invoices: true,
        },
      });

      res.json({
        message: 'Order updated successfully',
        data: serializeOrder(order),
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
