import { Request, Response } from 'express';
import {
  createOrderApprovalWorkflow,
  createOrderNotification,
  createWorkflowNotification,
} from '../../helpers';
import { paginate } from '../../utils/paginate';
import { createRequest } from './requests.controller';
import prisma from '../../configs/prisma.client';
import { Prisma } from '@prisma/client';

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
  promotion_id?: number | null;
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
  customer?: {
    id: number;
    name: string;
    code: string;
    type: string;
    route?: { id: number; name: string; code: string } | null;
    outstanding_amount?: number | null;
    credit_limit?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
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
    is_free_gift?: boolean;
  }[];
  invoices?: { id: number; invoice_number: string; amount: number }[];
  promotion_applied?: {
    promotion_id: number;
    promotion_name: string;
    promotion_code: string;
    discount_amount: number;
    free_products: any[];
  } | null;
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
  promotion_id: order.promotion_id,
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
        outstanding_amount: order.orders_customers.outstanding_amount,
        credit_limit: order.orders_customers.credit_limit,
        latitude: order.orders_customers.latitude,
        longitude: order.orders_customers.longitude,
        route: order.orders_customers.customer_routes
          ? {
              id: order.orders_customers.customer_routes.id,
              name: order.orders_customers.customer_routes.name,
              code: order.orders_customers.customer_routes.code,
            }
          : null,
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
      is_free_gift: oi.is_free_gift || false,
    })) || [],

  invoices:
    order.invoices?.map((inv: any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: inv.amount,
    })) || [],

  promotion_applied: order.promotion_applied || null,
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

async function calculatePromotionsInternal(params: {
  customer_id: number;
  depot_id?: number;
  salesman_id: number;
  route_id?: number;
  platform: string;
  order_date: Date | string;
  order_lines: Array<{
    product_id: number;
    category_id: number;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const {
    customer_id,
    depot_id,
    salesman_id,
    route_id,
    platform,
    order_date,
    order_lines,
  } = params;

  const checkDate = new Date(order_date);

  // Get customer details
  const customer = await prisma.customers.findUnique({
    where: { id: customer_id },
    select: { type: true },
  });

  // Get active promotions
  const promotionsQuery: Prisma.promotionsWhereInput = {
    is_active: 'Y',
    start_date: { lte: checkDate },
    end_date: { gte: checkDate },
  };

  if (platform) {
    promotionsQuery.promotion_channel_promotions = {
      some: {
        channel_type: platform,
        is_active: 'Y',
      },
    };
  }

  const promotions = await prisma.promotions.findMany({
    where: promotionsQuery,
    include: {
      promotion_depot_promotions: { where: { is_active: 'Y' } },
      promotion_salesperson_promotions: { where: { is_active: 'Y' } },
      promotion_routes_promotions: { where: { is_active: 'Y' } },
      promotion_customer_category_promotions: { where: { is_active: 'Y' } },
      promotion_customer_exclusion_promotions: true,
      promotion_condition_promotions: {
        where: { is_active: 'Y' },
        include: {
          promotion_condition_products: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_productId: true,
              promotion_condition_categories: true,
            },
          },
        },
      },
      promotion_level_promotions: {
        where: { is_active: 'Y' },
        include: {
          promotion_benefit_level: {
            where: { is_active: 'Y' },
            include: {
              promotion_benefit_products: true,
            },
          },
        },
        orderBy: { threshold_value: 'desc' },
      },
    },
  });

  const eligiblePromotions: any[] = [];

  for (const promo of promotions) {
    const isExcluded = promo.promotion_customer_exclusion_promotions.find(
      (exc: { customer_id: number; is_excluded: string }) =>
        exc.customer_id === customer_id && exc.is_excluded === 'Y'
    );
    if (isExcluded) continue;

    let isEligible = false;

    if (
      promo.promotion_depot_promotions.length === 0 &&
      promo.promotion_salesperson_promotions.length === 0 &&
      promo.promotion_routes_promotions.length === 0 &&
      promo.promotion_customer_category_promotions.length === 0
    ) {
      isEligible = true;
    } else {
      if (depot_id && promo.promotion_depot_promotions.length > 0) {
        if (
          promo.promotion_depot_promotions.find(
            (d: { depot_id: number }) => d.depot_id === depot_id
          )
        ) {
          isEligible = true;
        }
      }
      if (salesman_id && promo.promotion_salesperson_promotions.length > 0) {
        if (
          promo.promotion_salesperson_promotions.find(
            (s: { salesperson_id: number }) => s.salesperson_id === salesman_id
          )
        ) {
          isEligible = true;
        }
      }
      if (route_id && promo.promotion_routes_promotions.length > 0) {
        if (
          promo.promotion_routes_promotions.find(
            (r: { route_id: number }) => r.route_id === route_id
          )
        ) {
          isEligible = true;
        }
      }
      if (
        customer?.type &&
        promo.promotion_customer_category_promotions.length > 0
      ) {
        for (const cat of promo.promotion_customer_category_promotions) {
          const category = await prisma.customer_category.findUnique({
            where: { id: cat.customer_category_id },
          });
          if (category && category.category_code === customer.type) {
            isEligible = true;
            break;
          }
        }
      }
    }

    if (!isEligible) continue;

    for (const condition of promo.promotion_condition_promotions) {
      let totalQty = new Prisma.Decimal(0);
      let totalValue = new Prisma.Decimal(0);

      for (const line of order_lines) {
        const productMatch = condition.promotion_condition_products.find(
          (cp: { product_id: number | null; category_id: number | null }) =>
            cp.product_id === line.product_id ||
            cp.category_id === line.category_id
        );

        if (productMatch) {
          const lineQty = new Prisma.Decimal(line.quantity || 0);
          const linePrice = new Prisma.Decimal(line.unit_price || 0);
          const lineValue = lineQty.mul(linePrice);

          totalQty = totalQty.add(lineQty);
          totalValue = totalValue.add(lineValue);
        }
      }

      const minValue = new Prisma.Decimal(condition.min_value || 0);
      if (!totalValue.gte(minValue)) continue;

      const applicableLevel = promo.promotion_level_promotions.find(
        (lvl: { threshold_value: Prisma.Decimal | number }) =>
          new Prisma.Decimal(lvl.threshold_value).lte(totalValue)
      );

      if (!applicableLevel) continue;

      let discountAmount = new Prisma.Decimal(0);

      if (applicableLevel.discount_type === 'PERCENTAGE') {
        const discountPercent = new Prisma.Decimal(
          applicableLevel.discount_value || 0
        );
        discountAmount = totalValue.mul(discountPercent).div(100);
      } else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
        discountAmount = new Prisma.Decimal(
          applicableLevel.discount_value || 0
        );
      }

      const freeProducts: any[] = [];
      for (const benefit of applicableLevel.promotion_benefit_level) {
        if (benefit.benefit_type === 'FREE_PRODUCT') {
          freeProducts.push({
            product_id: benefit.product_id,
            product_name: benefit.promotion_benefit_products?.name || null,
            product_code: benefit.promotion_benefit_products?.code || null,
            quantity: benefit.benefit_value.toNumber(),
            gift_limit: benefit.gift_limit || 0,
          });
        }
      }

      eligiblePromotions.push({
        promotion_id: promo.id,
        promotion_name: promo.name,
        promotion_code: promo.code,
        level_number: applicableLevel.level_number,
        discount_type: applicableLevel.discount_type,
        discount_amount: discountAmount.toNumber(),
        free_products: freeProducts,
        qualified_quantity: totalQty.toNumber(),
        qualified_value: totalValue.toNumber(),
      });

      break;
    }
  }

  return eligiblePromotions;
}

export const ordersController = {
  // async createOrUpdateOrder(req: Request, res: Response) {
  //   const data = req.body;
  //   const userId = req.user?.id || 1;

  //   try {
  //     const { orderItems, order_items, selected_promotion_id, ...orderData } =
  //       data;

  //     const items = orderItems || order_items || [];
  //     let orderId = orderData.id;

  //     console.log(' Processing order with items:', {
  //       orderId,
  //       orderNumber: orderData.order_number,
  //       itemsCount: items.length,
  //       selected_promotion_id: selected_promotion_id || 'None',
  //     });

  //     let calculatedSubtotal = new Prisma.Decimal(0);
  //     for (const item of items) {
  //       const itemTotal = new Prisma.Decimal(item.quantity).mul(
  //         new Prisma.Decimal(item.price || item.unit_price || 0)
  //       );
  //       calculatedSubtotal = calculatedSubtotal.add(itemTotal);
  //     }

  //     const customer = await prisma.customers.findUnique({
  //       where: { id: orderData.parent_id },
  //       select: {
  //         id: true,
  //         type: true,
  //         route_id: true,
  //       },
  //     });

  //     if (!customer) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Customer not found',
  //       });
  //     }

  //     let appliedPromotion = null;
  //     let promotionDiscount = new Prisma.Decimal(0);
  //     let freeProducts: any[] = [];

  //     if (selected_promotion_id) {
  //       try {
  //         const promotionCheck = await prisma.promotions.findUnique({
  //           where: { id: parseInt(selected_promotion_id) },
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //             is_active: true,
  //             start_date: true,
  //             end_date: true,
  //           },
  //         });

  //         if (!promotionCheck) {
  //           return res.status(404).json({
  //             success: false,
  //             message: 'Selected promotion not found',
  //           });
  //         }

  //         const now = new Date();
  //         if (
  //           promotionCheck.is_active !== 'Y' ||
  //           promotionCheck.start_date > now ||
  //           promotionCheck.end_date < now
  //         ) {
  //           return res.status(400).json({
  //             success: false,
  //             message: 'Selected promotion is not active or has expired',
  //           });
  //         }

  //         const productsWithCategories = await Promise.all(
  //           items.map(async (item: any) => {
  //             const product = await prisma.products.findUnique({
  //               where: { id: item.product_id },
  //               select: { id: true, category_id: true },
  //             });
  //             return {
  //               product_id: item.product_id,
  //               category_id: product?.category_id || 0,
  //               quantity: item.quantity,
  //               unit_price: item.price || item.unit_price || 0,
  //             };
  //           })
  //         );

  //         const platform = (req.headers['x-platform'] as string) || 'OFFICE';
  //         const allPromotions = await calculatePromotionsInternal({
  //           customer_id: orderData.parent_id,
  //           salesman_id: orderData.salesperson_id,
  //           route_id: customer.route_id || undefined,
  //           platform,
  //           order_date: orderData.order_date || new Date(),
  //           order_lines: productsWithCategories,
  //         });

  //         // Find the selected promotion in eligible list
  //         appliedPromotion = allPromotions.find(
  //           p => p.promotion_id === parseInt(selected_promotion_id)
  //         );

  //         if (!appliedPromotion) {
  //           return res.status(400).json({
  //             success: false,
  //             message:
  //               'Selected promotion is no longer valid or customer does not qualify',
  //           });
  //         }

  //         promotionDiscount = new Prisma.Decimal(appliedPromotion.discount_amount);
  //         freeProducts = appliedPromotion.free_products || [];

  //         console.log(
  //           ' Customer-selected promotion applied:',
  //           appliedPromotion.promotion_name
  //         );
  //         console.log(' Discount:', appliedPromotion.discount_amount);
  //         console.log(' Free Products:', freeProducts.length);
  //       } catch (error) {
  //         console.error(' Error applying selected promotion:', error);
  //         return res.status(400).json({
  //           success: false,
  //           message: 'Failed to apply selected promotion',
  //         });
  //       }
  //     } else if (orderData.manual_discount) {
  //       promotionDiscount = new Prisma.Decimal(orderData.manual_discount);
  //     } else {
  //       console.log(' No promotion selected by customer');
  //     }

  //     const subtotal = calculatedSubtotal;
  //     const discount_amount = promotionDiscount;
  //     const tax_amount = new Prisma.Decimal(orderData.tax_amount || 0);
  //     const shipping_amount = new Prisma.Decimal(orderData.shipping_amount || 0);

  //     const total_amount = subtotal
  //       .minus(discount_amount)
  //       .plus(tax_amount)
  //       .plus(shipping_amount);

  //     const result = await prisma.$transaction(
  //       async tx => {
  //         let order;
  //         let isUpdate = false;

  //         if (!orderId && orderData.order_number) {
  //           const existingOrder = await tx.orders.findFirst({
  //             where: { order_number: orderData.order_number },
  //           });
  //           if (existingOrder) {
  //             orderId = existingOrder.id;
  //             isUpdate = true;
  //             console.log('🔄 Found existing order by order_number:', orderId);
  //           }
  //         } else if (orderId) {
  //           isUpdate = true;
  //         }

  //         let orderNumber = orderData.order_number;
  //         if (!isUpdate && !orderNumber) {
  //           orderNumber = await generateOrderNumber(tx);
  //           console.log(' Generated new order number:', orderNumber);
  //         }

  //         const orderPayload = {
  //           order_number: orderNumber,
  //           parent_id: orderData.parent_id,
  //           salesperson_id: orderData.salesperson_id,
  //           currency_id: orderData.currency_id || null,
  //           order_date: orderData.order_date
  //             ? new Date(orderData.order_date)
  //             : undefined,
  //           delivery_date: orderData.delivery_date
  //             ? new Date(orderData.delivery_date)
  //             : undefined,
  //           status: orderData.status || 'draft',
  //           priority: orderData.priority || 'medium',
  //           order_type: orderData.order_type || 'regular',
  //           payment_method: orderData.payment_method || 'credit',
  //           payment_terms: orderData.payment_terms || 'Net 30',
  //           subtotal: subtotal.toNumber(),
  //           discount_amount: discount_amount.toNumber(),
  //           tax_amount: tax_amount.toNumber(),
  //           shipping_amount: shipping_amount.toNumber(),
  //           total_amount: total_amount.toNumber(),
  //           notes: orderData.notes || null,
  //           shipping_address: orderData.shipping_address || null,
  //           approval_status: orderData.approval_status || 'pending',
  //           is_active: orderData.is_active || 'Y',
  //           promotion_id: selected_promotion_id
  //             ? parseInt(selected_promotion_id)
  //             : null,
  //         };

  //         if (isUpdate && orderId) {
  //           const updatePayload = { ...orderPayload };
  //           if (!orderData.order_number) {
  //             delete updatePayload.order_number;
  //           }

  //           order = await tx.orders.update({
  //             where: { id: orderId },
  //             data: {
  //               ...updatePayload,
  //               updatedate: new Date(),
  //               updatedby: userId,
  //               log_inst: { increment: 1 },
  //             },
  //           });
  //         } else {
  //           order = await tx.orders.create({
  //             data: {
  //               ...orderPayload,
  //               createdate: new Date(),
  //               createdby: userId,
  //               log_inst: 1,
  //             },
  //           });
  //           console.log(' Order created, ID:', order.id);
  //         }

  //         if (items && items.length > 0) {
  //           if (isUpdate && orderId) {
  //             await tx.order_items.deleteMany({
  //               where: { parent_id: orderId },
  //             });
  //             console.log(' Deleted existing order items');
  //           }

  //           const safeParse = (val: any, fallback = 0) => {
  //             const num = parseFloat(val);
  //             return isNaN(num) ? fallback : num;
  //           };

  //           const orderItemsData = items.map((item: any) => {
  //             const quantity = safeParse(item.quantity, 0);
  //             const unitPrice = safeParse(item.unit_price || item.price, 0);
  //             const discountAmount = safeParse(
  //               item.discount_amount || item.discount,
  //               0
  //             );
  //             const taxAmount = safeParse(item.tax_amount || item.tax, 0);
  //             const subtotal = quantity * unitPrice;

  //             return {
  //               parent_id: order.id,
  //               product_id: item.product_id,
  //               product_name: item.product_name || null,
  //               unit: item.unit || null,
  //               quantity: quantity,
  //               unit_price: unitPrice,
  //               discount_amount: discountAmount,
  //               tax_amount: taxAmount,
  //               total_amount: subtotal - discountAmount + taxAmount,
  //               notes: item.notes || null,
  //               is_free_gift: false,
  //             };
  //           });

  //           await tx.order_items.createMany({
  //             data: orderItemsData,
  //           });
  //           console.log(` Created ${orderItemsData.length} order items`);

  //           if (freeProducts.length > 0) {
  //             const freeItemsData = freeProducts.map((freeProduct: any) => ({
  //               parent_id: order.id,
  //               product_id: freeProduct.product_id,
  //               product_name: freeProduct.product_name || null,
  //               unit: null,
  //               quantity: freeProduct.quantity,
  //               unit_price: 0,
  //               discount_amount: 0,
  //               tax_amount: 0,
  //               total_amount: 0,
  //               notes: `Free gift from promotion: ${appliedPromotion?.promotion_name}`,
  //               is_free_gift: true,
  //             }));

  //             await tx.order_items.createMany({
  //               data: freeItemsData,
  //             });
  //             console.log(` Added ${freeItemsData.length} free products`);
  //           }
  //         }

  //         const finalOrder = await tx.orders.findUnique({
  //           where: { id: order.id },
  //           include: {
  //             orders_currencies: true,
  //             orders_customers: true,
  //             orders_salesperson_users: true,
  //             order_items: true,
  //             invoices: true,
  //           },
  //         });

  //         return finalOrder;
  //       },
  //       {
  //         maxWait: 10000,
  //         timeout: 20000,
  //       }
  //     );

  //     if (appliedPromotion && !orderId) {
  //       try {
  //         await prisma.promotion_tracking.create({
  //           data: {
  //             parent_id: appliedPromotion.promotion_id,
  //             action_type: 'APPLIED',
  //             action_date: new Date(),
  //             user_id: userId,
  //             comments: `Applied to order ${result?.order_number} for customer ${orderData.parent_id}. Discount: ${discount_amount.toNumber()}. Free Products: ${JSON.stringify(freeProducts.map(p => ({ product_id: p.product_id, quantity: p.quantity })))}`,
  //             is_active: 'Y',
  //           },
  //         });
  //         console.log(' Promotion tracked successfully');
  //       } catch (error) {
  //         console.error('Promotion tracking failed:', error);
  //       }
  //     }

  //     if (result && !orderId) {
  //       try {
  //         const orderEvent = 'created';
  //         const orderCreatorId = result.createdby || userId;

  //         await createOrderNotification(
  //           orderCreatorId,
  //           result.id,
  //           result.order_number || '',
  //           orderEvent,
  //           userId
  //         );

  //         await createRequest({
  //           requester_id: result.salesperson_id,
  //           request_type: 'ORDER_APPROVAL',
  //           reference_id: result.id,
  //           createdby: userId,
  //           log_inst: 1,
  //         });

  //         console.log(
  //           ' Approval workflow initiated for order:',
  //           result.order_number
  //         );
  //       } catch (error: any) {
  //         console.error('  Error creating approval request:', error);
  //       }
  //     }

  //     const response = {
  //       success: true,
  //       message: orderId
  //         ? 'Order updated successfully'
  //         : 'Order created successfully and sent for approval',
  //       data: {
  //         ...serializeOrder(result),
  //         promotion_applied: appliedPromotion
  //           ? {
  //               promotion_id: appliedPromotion.promotion_id,
  //               promotion_name: appliedPromotion.promotion_name,
  //               promotion_code: appliedPromotion.promotion_code,
  //               discount_amount: appliedPromotion.discount_amount,
  //               free_products: freeProducts,
  //             }
  //           : null,
  //       },
  //     };

  //     res.status(orderId ? 200 : 201).json(response);
  //   } catch (error: any) {
  //     console.error(' Error processing order:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to process order',
  //       error: error.message,
  //     });
  //   }
  // },

  async createOrUpdateOrder(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      const { orderItems, order_items, selected_promotion_id, ...orderData } =
        data;
      const items = orderItems || order_items || [];
      let orderId = orderData.id;

      console.log(' Processing order with items:', {
        orderId,
        orderNumber: orderData.order_number,
        itemsCount: items.length,
        selected_promotion_id: selected_promotion_id || 'None',
      });

      let calculatedSubtotal = new Prisma.Decimal(0);
      for (const item of items) {
        const itemTotal = new Prisma.Decimal(item.quantity).mul(
          new Prisma.Decimal(item.price || item.unit_price || 0)
        );
        calculatedSubtotal = calculatedSubtotal.add(itemTotal);
      }

      const customer = await prisma.customers.findUnique({
        where: { id: orderData.parent_id },
        select: {
          id: true,
          type: true,
          route_id: true,
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      let appliedPromotion = null;
      let promotionDiscount = new Prisma.Decimal(0);
      let freeProducts: any[] = [];

      if (selected_promotion_id) {
        try {
          const promotion = await prisma.promotions.findUnique({
            where: { id: parseInt(selected_promotion_id) },
            include: {
              promotion_condition_promotions: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_products: {
                    where: { is_active: 'Y' },
                  },
                },
              },
              promotion_level_promotions: {
                where: { is_active: 'Y' },
                include: {
                  promotion_benefit_level: {
                    where: { is_active: 'Y' },
                    include: {
                      promotion_benefit_products: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                        },
                      },
                    },
                  },
                },
                orderBy: { threshold_value: 'desc' },
              },
              promotion_salesperson_promotions: {
                where: { is_active: 'Y' },
                select: { salesperson_id: true },
              },
              promotion_routes_promotions: {
                where: { is_active: 'Y' },
                select: { route_id: true },
              },
              promotion_customer_category_promotions: {
                where: { is_active: 'Y' },
                select: { customer_category_id: true },
              },
              promotion_customer_exclusion_promotions: {
                where: { customer_id: orderData.parent_id },
                select: { is_excluded: true },
              },
            },
          });

          if (!promotion) {
            return res.status(404).json({
              success: false,
              message: 'Selected promotion not found',
            });
          }

          const now = new Date();
          if (
            promotion.is_active !== 'Y' ||
            promotion.start_date > now ||
            promotion.end_date < now
          ) {
            return res.status(400).json({
              success: false,
              message: 'Selected promotion is not active or has expired',
            });
          }

          if (promotion.promotion_customer_exclusion_promotions.length > 0) {
            const isExcluded =
              promotion.promotion_customer_exclusion_promotions.some(
                exc => exc.is_excluded === 'Y'
              );
            if (isExcluded) {
              return res.status(400).json({
                success: false,
                message: 'Customer is excluded from this promotion',
              });
            }
          }

          let isEligible = false;

          if (
            promotion.promotion_salesperson_promotions.length === 0 &&
            promotion.promotion_routes_promotions.length === 0 &&
            promotion.promotion_customer_category_promotions.length === 0
          ) {
            isEligible = true;
          } else {
            if (
              promotion.promotion_salesperson_promotions.length > 0 &&
              promotion.promotion_salesperson_promotions.some(
                s => s.salesperson_id === orderData.salesperson_id
              )
            ) {
              isEligible = true;
            }

            if (
              !isEligible &&
              customer.route_id &&
              promotion.promotion_routes_promotions.length > 0 &&
              promotion.promotion_routes_promotions.some(
                r => r.route_id === customer.route_id
              )
            ) {
              isEligible = true;
            }

            if (
              !isEligible &&
              customer.type &&
              promotion.promotion_customer_category_promotions.length > 0
            ) {
              const categoryIds =
                promotion.promotion_customer_category_promotions.map(
                  c => c.customer_category_id
                );
              const categories = await prisma.customer_category.findMany({
                where: {
                  id: { in: categoryIds },
                  category_code: customer.type,
                },
                select: { id: true },
              });

              if (categories.length > 0) {
                isEligible = true;
              }
            }
          }

          if (!isEligible) {
            return res.status(400).json({
              success: false,
              message: 'Customer does not qualify for this promotion',
            });
          }

          if (promotion.promotion_condition_promotions.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Promotion has no conditions defined',
            });
          }

          const condition = promotion.promotion_condition_promotions[0];
          let totalQty = new Prisma.Decimal(0);
          let totalValue = new Prisma.Decimal(0);

          const productIds = items.map((item: any) => item.product_id);
          const products = await prisma.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, category_id: true },
          });

          const productCategoryMap = new Map(
            products.map(p => [p.id, p.category_id])
          );

          for (const item of items) {
            const productMatch = condition.promotion_condition_products.find(
              cp =>
                cp.product_id === item.product_id ||
                cp.category_id === productCategoryMap.get(item.product_id)
            );

            if (productMatch) {
              const lineQty = new Prisma.Decimal(item.quantity || 0);
              const linePrice = new Prisma.Decimal(
                item.price || item.unit_price || 0
              );
              const lineValue = lineQty.mul(linePrice);

              totalQty = totalQty.add(lineQty);
              totalValue = totalValue.add(lineValue);
            }
          }

          const minValue = new Prisma.Decimal(condition.min_value || 0);
          if (!totalValue.gte(minValue)) {
            return res.status(400).json({
              success: false,
              message: `Order value ${totalValue.toFixed(2)} does not meet minimum ${minValue.toFixed(2)}`,
            });
          }

          const applicableLevel = promotion.promotion_level_promotions.find(
            lvl => new Prisma.Decimal(lvl.threshold_value).lte(totalValue)
          );

          if (!applicableLevel) {
            return res.status(400).json({
              success: false,
              message: 'Order does not meet promotion threshold',
            });
          }

          let discountAmount = new Prisma.Decimal(0);
          if (applicableLevel.discount_type === 'PERCENTAGE') {
            const discountPercent = new Prisma.Decimal(
              applicableLevel.discount_value || 0
            );
            discountAmount = totalValue.mul(discountPercent).div(100);
          } else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
            discountAmount = new Prisma.Decimal(
              applicableLevel.discount_value || 0
            );
          }

          for (const benefit of applicableLevel.promotion_benefit_level) {
            if (benefit.benefit_type === 'FREE_PRODUCT') {
              freeProducts.push({
                product_id: benefit.product_id,
                product_name: benefit.promotion_benefit_products?.name || null,
                product_code: benefit.promotion_benefit_products?.code || null,
                quantity: benefit.benefit_value.toNumber(),
                gift_limit: benefit.gift_limit || 0,
              });
            }
          }

          appliedPromotion = {
            promotion_id: promotion.id,
            promotion_name: promotion.name,
            promotion_code: promotion.code,
            discount_amount: discountAmount.toNumber(),
            free_products: freeProducts,
          };

          promotionDiscount = discountAmount;

          console.log(appliedPromotion.promotion_name);
          console.log(appliedPromotion.discount_amount);
          console.log(freeProducts.length);
        } catch (error) {
          console.error(' Error applying promotion:', error);
          return res.status(400).json({
            success: false,
            message: 'Failed to apply selected promotion',
          });
        }
      }

      const subtotal = calculatedSubtotal;
      const discount_amount = promotionDiscount;
      const tax_amount = new Prisma.Decimal(orderData.tax_amount || 0);
      const shipping_amount = new Prisma.Decimal(
        orderData.shipping_amount || 0
      );

      const total_amount = subtotal
        .minus(discount_amount)
        .plus(tax_amount)
        .plus(shipping_amount);

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
            }
          } else if (orderId) {
            isUpdate = true;
          }

          let orderNumber = orderData.order_number;
          if (!isUpdate && !orderNumber) {
            orderNumber = await generateOrderNumber(tx);
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
            subtotal: subtotal.toNumber(),
            discount_amount: discount_amount.toNumber(),
            tax_amount: tax_amount.toNumber(),
            shipping_amount: shipping_amount.toNumber(),
            total_amount: total_amount.toNumber(),
            notes: orderData.notes || null,
            shipping_address: orderData.shipping_address || null,
            approval_status: orderData.approval_status || 'pending',
            is_active: orderData.is_active || 'Y',
            promotion_id: selected_promotion_id
              ? parseInt(selected_promotion_id)
              : null,
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

          if (items && items.length > 0) {
            if (isUpdate && orderId) {
              await tx.order_items.deleteMany({
                where: { parent_id: orderId },
              });
            }

            const safeParse = (val: any, fallback = 0) => {
              const num = parseFloat(val);
              return isNaN(num) ? fallback : num;
            };

            const orderItemsData = items.map((item: any) => {
              const quantity = safeParse(item.quantity, 0);
              const unitPrice = safeParse(item.unit_price || item.price, 0);
              const discountAmount = safeParse(
                item.discount_amount || item.discount,
                0
              );
              const taxAmount = safeParse(item.tax_amount || item.tax, 0);
              const subtotal = quantity * unitPrice;

              return {
                parent_id: order.id,
                product_id: item.product_id,
                product_name: item.product_name || null,
                unit: item.unit || null,
                quantity: quantity,
                unit_price: unitPrice,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                total_amount: subtotal - discountAmount + taxAmount,
                notes: item.notes || null,
                is_free_gift: false,
              };
            });

            await tx.order_items.createMany({
              data: orderItemsData,
            });

            if (freeProducts.length > 0) {
              const freeItemsData = freeProducts.map((freeProduct: any) => ({
                parent_id: order.id,
                product_id: freeProduct.product_id,
                product_name: freeProduct.product_name || null,
                unit: null,
                quantity: freeProduct.quantity,
                unit_price: 0,
                discount_amount: 0,
                tax_amount: 0,
                total_amount: 0,
                notes: `Free gift from promotion: ${appliedPromotion?.promotion_name}`,
                is_free_gift: true,
              }));

              await tx.order_items.createMany({
                data: freeItemsData,
              });
            }
          }

          const finalOrder = await tx.orders.findUnique({
            where: { id: order.id },
            include: {
              orders_currencies: true,
              orders_customers: {
                include: {
                  customer_routes: true,
                },
              },
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

      if (appliedPromotion && !orderId) {
        try {
          await prisma.promotion_tracking.create({
            data: {
              parent_id: appliedPromotion.promotion_id,
              action_type: 'APPLIED',
              action_date: new Date(),
              user_id: userId,
              comments: `Applied to order ${result?.order_number}`,
              is_active: 'Y',
            },
          });
        } catch (error) {
          console.error('Promotion tracking failed:', error);
        }
      }

      if (result && !orderId) {
        try {
          await createOrderNotification(
            result.createdby || userId,
            result.id,
            result.order_number || '',
            'created',
            userId
          );

          await createRequest({
            requester_id: result.salesperson_id,
            request_type: 'ORDER_APPROVAL',
            reference_id: result.id,
            createdby: userId,
            log_inst: 1,
          });
        } catch (error: any) {
          console.error(' Error creating approval request:', error);
        }
      }

      const response = {
        success: true,
        message: orderId
          ? 'Order updated successfully'
          : 'Order created successfully and sent for approval',
        data: {
          ...serializeOrder(result),
          promotion_applied: appliedPromotion,
        },
      };

      res.status(orderId ? 200 : 201).json(response);
    } catch (error: any) {
      console.error(' Error processing order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process order',
        error: error.message,
      });
    }
  },

  // async getAllOrders(req: any, res: any) {
  //   try {
  //     const {
  //       page,
  //       limit,
  //       search,
  //       sales_person_id,
  //       customer_id,
  //       status,
  //       isActive,
  //       route_id,
  //       route_ids,
  //     } = req.query;

  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 10;
  //     const searchLower = search ? (search as string).toLowerCase() : '';

  //     const filters: any = {};

  //     if (search) {
  //       filters.OR = [
  //         { order_number: { contains: searchLower } },
  //         { status: { contains: searchLower } },
  //         { notes: { contains: searchLower } },
  //         {
  //           orders_customers: {
  //             name: { contains: searchLower },
  //           },
  //         },
  //       ];
  //     }

  //     if (sales_person_id) {
  //       filters.salesperson_id = parseInt(sales_person_id as string, 10);
  //     }

  //     if (customer_id) {
  //       filters.parent_id = parseInt(customer_id as string, 10);
  //     }

  //     if (status) {
  //       filters.status = status as string;
  //     }

  //     if (route_ids) {
  //       const routeIdArray = route_ids
  //         .split(',')
  //         .map((id: string) => parseInt(id.trim(), 10))
  //         .filter((id: number) => !isNaN(id));

  //       if (routeIdArray.length > 0) {
  //         filters.orders_customers = {
  //           ...filters.orders_customers,
  //           route_id: {
  //             in: routeIdArray,
  //           },
  //         };
  //       }
  //     } else if (route_id) {
  //       const parsedRouteId = parseInt(route_id as string, 10);
  //       if (!isNaN(parsedRouteId)) {
  //         filters.orders_customers = {
  //           ...filters.orders_customers,
  //           route_id: parsedRouteId,
  //         };
  //       }
  //     }

  //     if (isActive !== undefined && isActive !== '') {
  //       let activeValue = isActive.toString().toUpperCase();

  //       if (
  //         activeValue === 'TRUE' ||
  //         activeValue === '1' ||
  //         activeValue === 'ACTIVE'
  //       ) {
  //         activeValue = 'Y';
  //       } else if (
  //         activeValue === 'FALSE' ||
  //         activeValue === '0' ||
  //         activeValue === 'INACTIVE'
  //       ) {
  //         activeValue = 'N';
  //       }

  //       if (activeValue === 'Y' || activeValue === 'N') {
  //         filters.is_active = activeValue;
  //       }
  //     }

  //     const { data, pagination } = await paginate({
  //       model: prisma.orders,
  //       filters,
  //       page: pageNum,
  //       limit: limitNum,
  //       orderBy: { createdate: 'desc' },
  //       include: {
  //         orders_currencies: true,
  //         orders_customers: {
  //           include: {
  //             customer_routes: true,
  //           },
  //         },
  //         orders_salesperson_users: true,
  //         order_items: true,
  //         invoices: true,
  //       },
  //     });

  //     const statsFilter: any = {};

  //     if (route_ids) {
  //       const routeIdArray = route_ids
  //         .split(',')
  //         .map((id: string) => parseInt(id.trim(), 10))
  //         .filter((id: number) => !isNaN(id));

  //       if (routeIdArray.length > 0) {
  //         statsFilter.orders_customers = {
  //           route_id: { in: routeIdArray },
  //         };
  //       }
  //     } else if (route_id) {
  //       const parsedRouteId = parseInt(route_id as string, 10);
  //       if (!isNaN(parsedRouteId)) {
  //         statsFilter.orders_customers = {
  //           route_id: parsedRouteId,
  //         };
  //       }
  //     }

  //     if (customer_id) {
  //       statsFilter.parent_id = parseInt(customer_id as string, 10);
  //     }

  //     if (sales_person_id) {
  //       statsFilter.salesperson_id = parseInt(sales_person_id as string, 10);
  //     }

  //     if (status) {
  //       statsFilter.status = status as string;
  //     }
  //     const totalOrders = await prisma.orders.count({
  //       where: statsFilter,
  //     });

  //     const activeOrders = await prisma.orders.count({
  //       where: {
  //         ...statsFilter,
  //         is_active: 'Y',
  //       },
  //     });

  //     const inactiveOrders = await prisma.orders.count({
  //       where: {
  //         ...statsFilter,
  //         is_active: 'N',
  //       },
  //     });

  //     const now = new Date();
  //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  //     const ordersThisMonth = await prisma.orders.count({
  //       where: {
  //         ...statsFilter,
  //         createdate: {
  //           gte: startOfMonth,
  //           lte: endOfMonth,
  //         },
  //       },
  //     });

  //     let routeStats = null;
  //     if (route_id || route_ids) {
  //       const routeFilter = route_ids
  //         ? {
  //             route_id: {
  //               in: route_ids
  //                 .split(',')
  //                 .map((id: string) => parseInt(id.trim(), 10))
  //                 .filter((id: number) => !isNaN(id)),
  //             },
  //           }
  //         : { route_id: parseInt(route_id as string, 10) };

  //       const customersInRoutes = await prisma.customers.count({
  //         where: routeFilter,
  //       });

  //       const orderTotals = await prisma.orders.aggregate({
  //         where: {
  //           orders_customers: routeFilter,
  //         },
  //         _sum: {
  //           total_amount: true,
  //         },
  //         _avg: {
  //           total_amount: true,
  //         },
  //       });

  //       routeStats = {
  //         customers_in_routes: customersInRoutes,
  //         total_order_value: orderTotals._sum.total_amount || 0,
  //         average_order_value: orderTotals._avg.total_amount || 0,
  //       };
  //     }

  //     res.success(
  //       'Orders retrieved successfully',
  //       data.map((order: any) => serializeOrder(order)),
  //       200,
  //       pagination,
  //       {
  //         total_orders: totalOrders,
  //         active_orders: activeOrders,
  //         inactive_orders: inactiveOrders,
  //         orders_this_month: ordersThisMonth,
  //         ...(routeStats && { route_statistics: routeStats }),
  //         filters_applied: {
  //           route_id: route_id || null,
  //           route_ids: route_ids || null,
  //           sales_person_id: sales_person_id || null,
  //           customer_id: customer_id || null,
  //           status: status || null,
  //           is_active: isActive || null,
  //         },
  //       }
  //     );
  //   } catch (error: any) {
  //     console.error('Get Orders Error:', error);
  //     res.status(500).json({
  //       message: 'Failed to retrieve orders',
  //       error: error.message,
  //     });
  //   }
  // },

  async getAllOrders(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        sales_person_id,
        customer_id,
        status,
        isActive,
        route_id,
        route_ids,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {};

      if (search) {
        filters.OR = [
          { order_number: { contains: searchLower } },
          { status: { contains: searchLower } },
          { notes: { contains: searchLower } },
          {
            orders_customers: {
              name: { contains: searchLower },
            },
          },
        ];
      }

      if (sales_person_id) {
        filters.salesperson_id = parseInt(sales_person_id as string, 10);
      }

      if (customer_id) {
        filters.parent_id = parseInt(customer_id as string, 10);
      }

      if (status) {
        filters.status = status as string;
      }

      if (route_ids) {
        const routeIdArray = route_ids
          .split(',')
          .map((id: string) => parseInt(id.trim(), 10))
          .filter((id: number) => !isNaN(id));

        if (routeIdArray.length > 0) {
          filters.orders_customers = {
            ...filters.orders_customers,
            route_id: {
              in: routeIdArray,
            },
          };
        }
      } else if (route_id) {
        const parsedRouteId = parseInt(route_id as string, 10);
        if (!isNaN(parsedRouteId)) {
          filters.orders_customers = {
            ...filters.orders_customers,
            route_id: parsedRouteId,
          };
        }
      }

      if (isActive !== undefined && isActive !== '') {
        let activeValue = isActive.toString().toUpperCase();

        if (
          activeValue === 'TRUE' ||
          activeValue === '1' ||
          activeValue === 'ACTIVE'
        ) {
          activeValue = 'Y';
        } else if (
          activeValue === 'FALSE' ||
          activeValue === '0' ||
          activeValue === 'INACTIVE'
        ) {
          activeValue = 'N';
        }

        if (activeValue === 'Y' || activeValue === 'N') {
          filters.is_active = activeValue;
        }
      }

      const { data, pagination } = await paginate({
        model: prisma.orders,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          orders_currencies: true,
          orders_customers: {
            include: {
              customer_routes: true,
            },
          },
          orders_salesperson_users: true,
          order_items: true,
          invoices: true,
          orders_promotion: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              description: true,
            },
          },
        },
      });

      const enrichedOrders = data.map((order: any) => {
        const serialized = serializeOrder(order);

        if (order.promotion_id && order.orders_promotion) {
          serialized.promotion_applied = {
            promotion_id: order.orders_promotion.id,
            promotion_name: order.orders_promotion.name,
            promotion_code: order.orders_promotion.code,
            discount_amount: order.discount_amount
              ? Number(order.discount_amount)
              : 0,
            free_products:
              order.order_items
                ?.filter((item: any) => item.is_free_gift === true)
                .map((item: any) => ({
                  product_id: item.product_id,
                  product_name: item.product_name,
                  quantity: item.quantity,
                })) || [],
          };
        }

        return serialized;
      });

      const statsFilter: any = {};

      if (route_ids) {
        const routeIdArray = route_ids
          .split(',')
          .map((id: string) => parseInt(id.trim(), 10))
          .filter((id: number) => !isNaN(id));

        if (routeIdArray.length > 0) {
          statsFilter.orders_customers = {
            route_id: { in: routeIdArray },
          };
        }
      } else if (route_id) {
        const parsedRouteId = parseInt(route_id as string, 10);
        if (!isNaN(parsedRouteId)) {
          statsFilter.orders_customers = {
            route_id: parsedRouteId,
          };
        }
      }

      if (customer_id) {
        statsFilter.parent_id = parseInt(customer_id as string, 10);
      }

      if (sales_person_id) {
        statsFilter.salesperson_id = parseInt(sales_person_id as string, 10);
      }

      if (status) {
        statsFilter.status = status as string;
      }

      const totalOrders = await prisma.orders.count({
        where: statsFilter,
      });

      const activeOrders = await prisma.orders.count({
        where: {
          ...statsFilter,
          is_active: 'Y',
        },
      });

      const inactiveOrders = await prisma.orders.count({
        where: {
          ...statsFilter,
          is_active: 'N',
        },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const ordersThisMonth = await prisma.orders.count({
        where: {
          ...statsFilter,
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      let routeStats = null;
      if (route_id || route_ids) {
        const routeFilter = route_ids
          ? {
              route_id: {
                in: route_ids
                  .split(',')
                  .map((id: string) => parseInt(id.trim(), 10))
                  .filter((id: number) => !isNaN(id)),
              },
            }
          : { route_id: parseInt(route_id as string, 10) };

        const customersInRoutes = await prisma.customers.count({
          where: routeFilter,
        });

        const orderTotals = await prisma.orders.aggregate({
          where: {
            orders_customers: routeFilter,
          },
          _sum: {
            total_amount: true,
          },
          _avg: {
            total_amount: true,
          },
        });

        routeStats = {
          customers_in_routes: customersInRoutes,
          total_order_value: orderTotals._sum.total_amount || 0,
          average_order_value: orderTotals._avg.total_amount || 0,
        };
      }

      res.success(
        'Orders retrieved successfully',
        enrichedOrders,
        200,
        pagination,
        {
          total_orders: totalOrders,
          active_orders: activeOrders,
          inactive_orders: inactiveOrders,
          orders_this_month: ordersThisMonth,
          ...(routeStats && { route_statistics: routeStats }),
          filters_applied: {
            route_id: route_id || null,
            route_ids: route_ids || null,
            sales_person_id: sales_person_id || null,
            customer_id: customer_id || null,
            status: status || null,
            is_active: isActive || null,
          },
        }
      );
    } catch (error: any) {
      console.error('Get Orders Error:', error);
      res.status(500).json({
        message: 'Failed to retrieve orders',
        error: error.message,
      });
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

          const order = await tx.orders.update({
            where: { id: Number(id) },
            data: orderPayload,
          });

          if (Array.isArray(items) && items.length > 0) {
            await tx.order_items.deleteMany({
              where: { parent_id: order.id },
            });

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

      if (result) {
        try {
          const orderCreatorId = result.createdby || userId;
          const previousApprovalStatus = existingOrder.approval_status;

          await createOrderNotification(
            orderCreatorId,
            result.id,
            result.order_number || '',
            'updated',
            userId
          );

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

          if (
            previousApprovalStatus !== 'pending' &&
            previousApprovalStatus !== 'submitted' &&
            (result.approval_status === 'pending' ||
              result.approval_status === 'submitted')
          ) {
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

                    for (const approverId of approvers) {
                      await createWorkflowNotification(
                        approverId,
                        workflow.id,
                        result.order_number || '',
                        'pending',
                        userId
                      );
                    }

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

  async getOrdersOrderItemsByOrderId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const orderItems = await prisma.order_items.findMany({
        where: { parent_id: Number(id) },
        include: {
          products: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      if (!orderItems || orderItems.length === 0) {
        return res
          .status(404)
          .json({ message: 'No order items found for this order' });
      }

      res.json({
        message: 'Order items fetched successfully',
        data: orderItems,
      });
    } catch (error: any) {
      console.error('Get Order Items Error:', error);
      res.status(500).json({
        message: 'Failed to retrieve order items',
        error: error.message,
      });
    }
  },
};
