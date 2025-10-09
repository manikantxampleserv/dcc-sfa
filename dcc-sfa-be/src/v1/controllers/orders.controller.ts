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
    quantity: number;
    price: number;
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
  subtotal: order.subtotal,
  discount_amount: order.discount_amount,
  tax_amount: order.tax_amount,
  shipping_amount: order.shipping_amount,
  total_amount: order.total_amount,
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
        name: order.orders_salesperson_users.name,
        email: order.orders_salesperson_users.email,
      }
    : null,

  order_items:
    order.orders_items?.map((oi: any) => ({
      id: oi.id,
      product_id: oi.product_id,
      quantity: oi.quantity,
      price: Number(oi.unit_price),
    })) || [],

  invoices:
    order.invoices?.map((inv: any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: inv.amount,
    })) || [],
});

export const ordersController = {
  async createOrders(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      let order;
      const { id: _, order_items, ...parentData } = data;

      if (data.id) {
        order = await prisma.orders.update({
          where: { id: data.id },
          data: {
            ...parentData,
            updatedate: new Date(),
            updatedby: userId,
            log_inst: { increment: 1 },
          },
        });
      } else {
        order = await prisma.orders.create({
          data: {
            ...parentData,
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
            is_active: parentData.is_active || 'Y',
          },
        });
      }

      if (order_items !== undefined && Array.isArray(order_items)) {
        const processedIds: number[] = [];

        for (const item of order_items) {
          const itemData = {
            product_id: item.product_id,
            product_name: item.product_name,
            unit: item.unit,
            quantity: item.quantity,
            unit_price: item.price,
            discount_amount: item.discount_amount,
            tax_amount: item.tax_amount,
            total_amount: item.total_amount,
            notes: item.notes,
            parent_id: order.id,
          };

          if (item.id) {
            const exists = await prisma.order_items.findUnique({
              where: { id: item.id },
            });

            if (exists) {
              await prisma.order_items.update({
                where: { id: item.id },
                data: { ...itemData },
              });
              processedIds.push(item.id);
              continue;
            }
          }

          const newItem = await prisma.order_items.create({ data: itemData });
          processedIds.push(newItem.id);
        }

        if (processedIds.length > 0) {
          await prisma.order_items.deleteMany({
            where: {
              parent_id: order.id,
              id: { notIn: processedIds },
            },
          });
        } else {
          await prisma.order_items.deleteMany({
            where: {
              parent_id: order.id,
            },
          });
        }
      }

      const finalOrder = await prisma.orders.findUnique({
        where: { id: order.id },
        include: {
          orders_currencies: true,
          orders_customers: true,
          orders_salesperson_users: true,
          order_items: true,
          invoices: true,
        },
      });

      res.status(200).json({
        message: 'Order processed successfully',
        data: serializeOrder(finalOrder),
      });
    } catch (error: any) {
      console.error('Error processing order:', error);
      res.status(500).json({ message: error.message });
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
          orders_salesperson: true,
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
          order_items: true,
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
