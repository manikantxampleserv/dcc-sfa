"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersController = void 0;
const helpers_1 = require("../../helpers");
const paginate_1 = require("../../utils/paginate");
const requests_controller_1 = require("./requests.controller");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const client_1 = require("@prisma/client");
const serializeOrder = (order) => ({
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
    order_items: order.order_items?.map((oi) => ({
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
    invoices: order.invoices?.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        amount: inv.amount,
    })) || [],
    promotion_applied: order.promotion_applied || null,
});
async function generateOrderNumber(tx) {
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
        }
        catch (error) {
            console.error('Error generating order number:', error);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    const timestamp = Date.now();
    const fallbackOrderNumber = `ORD-${timestamp}`;
    return fallbackOrderNumber;
}
async function calculatePromotionsInternal(params) {
    const { customer_id, depot_id, salesman_id, route_id, platform, order_date, order_lines, } = params;
    const checkDate = new Date(order_date);
    // Get customer details
    const customer = await prisma_client_1.default.customers.findUnique({
        where: { id: customer_id },
        select: { type: true },
    });
    // Get active promotions
    const promotionsQuery = {
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
    const promotions = await prisma_client_1.default.promotions.findMany({
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
    const eligiblePromotions = [];
    for (const promo of promotions) {
        const isExcluded = promo.promotion_customer_exclusion_promotions.find((exc) => exc.customer_id === customer_id && exc.is_excluded === 'Y');
        if (isExcluded)
            continue;
        let isEligible = false;
        if (promo.promotion_depot_promotions.length === 0 &&
            promo.promotion_salesperson_promotions.length === 0 &&
            promo.promotion_routes_promotions.length === 0 &&
            promo.promotion_customer_category_promotions.length === 0) {
            isEligible = true;
        }
        else {
            if (depot_id && promo.promotion_depot_promotions.length > 0) {
                if (promo.promotion_depot_promotions.find((d) => d.depot_id === depot_id)) {
                    isEligible = true;
                }
            }
            if (salesman_id && promo.promotion_salesperson_promotions.length > 0) {
                if (promo.promotion_salesperson_promotions.find((s) => s.salesperson_id === salesman_id)) {
                    isEligible = true;
                }
            }
            if (route_id && promo.promotion_routes_promotions.length > 0) {
                if (promo.promotion_routes_promotions.find((r) => r.route_id === route_id)) {
                    isEligible = true;
                }
            }
            if (customer?.type &&
                promo.promotion_customer_category_promotions.length > 0) {
                for (const cat of promo.promotion_customer_category_promotions) {
                    const category = await prisma_client_1.default.customer_category.findUnique({
                        where: { id: cat.customer_category_id },
                    });
                    if (category && category.category_code === customer.type) {
                        isEligible = true;
                        break;
                    }
                }
            }
        }
        if (!isEligible)
            continue;
        for (const condition of promo.promotion_condition_promotions) {
            let totalQty = new client_1.Prisma.Decimal(0);
            let totalValue = new client_1.Prisma.Decimal(0);
            for (const line of order_lines) {
                const productMatch = condition.promotion_condition_products.find((cp) => cp.product_id === line.product_id ||
                    cp.category_id === line.category_id);
                if (productMatch) {
                    const lineQty = new client_1.Prisma.Decimal(line.quantity || 0);
                    const linePrice = new client_1.Prisma.Decimal(line.unit_price || 0);
                    const lineValue = lineQty.mul(linePrice);
                    totalQty = totalQty.add(lineQty);
                    totalValue = totalValue.add(lineValue);
                }
            }
            const minValue = new client_1.Prisma.Decimal(condition.min_value || 0);
            if (!totalValue.gte(minValue))
                continue;
            const applicableLevel = promo.promotion_level_promotions.find((lvl) => new client_1.Prisma.Decimal(lvl.threshold_value).lte(totalValue));
            if (!applicableLevel)
                continue;
            let discountAmount = new client_1.Prisma.Decimal(0);
            if (applicableLevel.discount_type === 'PERCENTAGE') {
                const discountPercent = new client_1.Prisma.Decimal(applicableLevel.discount_value || 0);
                discountAmount = totalValue.mul(discountPercent).div(100);
            }
            else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
                discountAmount = new client_1.Prisma.Decimal(applicableLevel.discount_value || 0);
            }
            const freeProducts = [];
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
exports.ordersController = {
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
    //         const promotion = await prisma.promotions.findUnique({
    //           where: { id: parseInt(selected_promotion_id) },
    //           include: {
    //             promotion_condition_promotions: {
    //               where: { is_active: 'Y' },
    //               include: {
    //                 promotion_condition_products: {
    //                   where: { is_active: 'Y' },
    //                 },
    //               },
    //             },
    //             promotion_level_promotions: {
    //               where: { is_active: 'Y' },
    //               include: {
    //                 promotion_benefit_level: {
    //                   where: { is_active: 'Y' },
    //                   include: {
    //                     promotion_benefit_products: {
    //                       select: {
    //                         id: true,
    //                         name: true,
    //                         code: true,
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //               orderBy: { threshold_value: 'desc' },
    //             },
    //             promotion_salesperson_promotions: {
    //               where: { is_active: 'Y' },
    //               select: { salesperson_id: true },
    //             },
    //             promotion_routes_promotions: {
    //               where: { is_active: 'Y' },
    //               select: { route_id: true },
    //             },
    //             promotion_customer_category_promotions: {
    //               where: { is_active: 'Y' },
    //               select: { customer_category_id: true },
    //             },
    //             promotion_customer_exclusion_promotions: {
    //               where: { customer_id: orderData.parent_id },
    //               select: { is_excluded: true },
    //             },
    //           },
    //         });
    //         if (!promotion) {
    //           return res.status(404).json({
    //             success: false,
    //             message: 'Selected promotion not found',
    //           });
    //         }
    //         const now = new Date();
    //         if (
    //           promotion.is_active !== 'Y' ||
    //           promotion.start_date > now ||
    //           promotion.end_date < now
    //         ) {
    //           return res.status(400).json({
    //             success: false,
    //             message: 'Selected promotion is not active or has expired',
    //           });
    //         }
    //         if (promotion.promotion_customer_exclusion_promotions.length > 0) {
    //           const isExcluded =
    //             promotion.promotion_customer_exclusion_promotions.some(
    //               exc => exc.is_excluded === 'Y'
    //             );
    //           if (isExcluded) {
    //             return res.status(400).json({
    //               success: false,
    //               message: 'Customer is excluded from this promotion',
    //             });
    //           }
    //         }
    //         let isEligible = false;
    //         if (
    //           promotion.promotion_salesperson_promotions.length === 0 &&
    //           promotion.promotion_routes_promotions.length === 0 &&
    //           promotion.promotion_customer_category_promotions.length === 0
    //         ) {
    //           isEligible = true;
    //         } else {
    //           if (
    //             promotion.promotion_salesperson_promotions.length > 0 &&
    //             promotion.promotion_salesperson_promotions.some(
    //               s => s.salesperson_id === orderData.salesperson_id
    //             )
    //           ) {
    //             isEligible = true;
    //           }
    //           if (
    //             !isEligible &&
    //             customer.route_id &&
    //             promotion.promotion_routes_promotions.length > 0 &&
    //             promotion.promotion_routes_promotions.some(
    //               r => r.route_id === customer.route_id
    //             )
    //           ) {
    //             isEligible = true;
    //           }
    //           if (
    //             !isEligible &&
    //             customer.type &&
    //             promotion.promotion_customer_category_promotions.length > 0
    //           ) {
    //             const categoryIds =
    //               promotion.promotion_customer_category_promotions.map(
    //                 c => c.customer_category_id
    //               );
    //             const categories = await prisma.customer_category.findMany({
    //               where: {
    //                 id: { in: categoryIds },
    //                 category_code: customer.type,
    //               },
    //               select: { id: true },
    //             });
    //             if (categories.length > 0) {
    //               isEligible = true;
    //             }
    //           }
    //         }
    //         if (!isEligible) {
    //           return res.status(400).json({
    //             success: false,
    //             message: 'Customer does not qualify for this promotion',
    //           });
    //         }
    //         if (promotion.promotion_condition_promotions.length === 0) {
    //           return res.status(400).json({
    //             success: false,
    //             message: 'Promotion has no conditions defined',
    //           });
    //         }
    //         const condition = promotion.promotion_condition_promotions[0];
    //         let totalQty = new Prisma.Decimal(0);
    //         let totalValue = new Prisma.Decimal(0);
    //         const productIds = items.map((item: any) => item.product_id);
    //         const products = await prisma.products.findMany({
    //           where: { id: { in: productIds } },
    //           select: { id: true, category_id: true },
    //         });
    //         const productCategoryMap = new Map(
    //           products.map(p => [p.id, p.category_id])
    //         );
    //         for (const item of items) {
    //           const productMatch = condition.promotion_condition_products.find(
    //             cp =>
    //               cp.product_id === item.product_id ||
    //               cp.category_id === productCategoryMap.get(item.product_id)
    //           );
    //           if (productMatch) {
    //             const lineQty = new Prisma.Decimal(item.quantity || 0);
    //             const linePrice = new Prisma.Decimal(
    //               item.price || item.unit_price || 0
    //             );
    //             const lineValue = lineQty.mul(linePrice);
    //             totalQty = totalQty.add(lineQty);
    //             totalValue = totalValue.add(lineValue);
    //           }
    //         }
    //         const minValue = new Prisma.Decimal(condition.min_value || 0);
    //         if (!totalValue.gte(minValue)) {
    //           return res.status(400).json({
    //             success: false,
    //             message: `Order value ${totalValue.toFixed(2)} does not meet minimum ${minValue.toFixed(2)}`,
    //           });
    //         }
    //         const applicableLevel = promotion.promotion_level_promotions.find(
    //           lvl => new Prisma.Decimal(lvl.threshold_value).lte(totalValue)
    //         );
    //         if (!applicableLevel) {
    //           return res.status(400).json({
    //             success: false,
    //             message: 'Order does not meet promotion threshold',
    //           });
    //         }
    //         let discountAmount = new Prisma.Decimal(0);
    //         if (applicableLevel.discount_type === 'PERCENTAGE') {
    //           const discountPercent = new Prisma.Decimal(
    //             applicableLevel.discount_value || 0
    //           );
    //           discountAmount = totalValue.mul(discountPercent).div(100);
    //         } else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
    //           discountAmount = new Prisma.Decimal(
    //             applicableLevel.discount_value || 0
    //           );
    //         }
    //         for (const benefit of applicableLevel.promotion_benefit_level) {
    //           if (benefit.benefit_type === 'FREE_PRODUCT') {
    //             freeProducts.push({
    //               product_id: benefit.product_id,
    //               product_name: benefit.promotion_benefit_products?.name || null,
    //               product_code: benefit.promotion_benefit_products?.code || null,
    //               quantity: benefit.benefit_value.toNumber(),
    //               gift_limit: benefit.gift_limit || 0,
    //             });
    //           }
    //         }
    //         appliedPromotion = {
    //           promotion_id: promotion.id,
    //           promotion_name: promotion.name,
    //           promotion_code: promotion.code,
    //           discount_amount: discountAmount.toNumber(),
    //           free_products: freeProducts,
    //         };
    //         promotionDiscount = discountAmount;
    //         console.log(appliedPromotion.promotion_name);
    //         console.log(appliedPromotion.discount_amount);
    //         console.log(freeProducts.length);
    //       } catch (error) {
    //         console.error(' Error applying promotion:', error);
    //         return res.status(400).json({
    //           success: false,
    //           message: 'Failed to apply selected promotion',
    //         });
    //       }
    //     }
    //     const subtotal = calculatedSubtotal;
    //     const discount_amount = promotionDiscount;
    //     const tax_amount = new Prisma.Decimal(orderData.tax_amount || 0);
    //     const shipping_amount = new Prisma.Decimal(
    //       orderData.shipping_amount || 0
    //     );
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
    //           }
    //         } else if (orderId) {
    //           isUpdate = true;
    //         }
    //         let orderNumber = orderData.order_number;
    //         if (!isUpdate && !orderNumber) {
    //           orderNumber = await generateOrderNumber(tx);
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
    //         }
    //         if (items && items.length > 0) {
    //           if (isUpdate && orderId) {
    //             await tx.order_items.deleteMany({
    //               where: { parent_id: orderId },
    //             });
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
    //           }
    //         }
    //         const finalOrder = await tx.orders.findUnique({
    //           where: { id: order.id },
    //           include: {
    //             orders_currencies: true,
    //             orders_customers: {
    //               include: {
    //                 customer_routes: true,
    //               },
    //             },
    //             orders_salesperson_users: true,
    //             order_items: true,
    //             invoices: true,
    //           },
    //         });
    //         return finalOrder;
    //       },
    //       {
    //         maxWait: 5000,
    //         timeout: 10000,
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
    //             comments: `Applied to order ${result?.order_number}`,
    //             is_active: 'Y',
    //           },
    //         });
    //       } catch (error) {
    //         console.error('Promotion tracking failed:', error);
    //       }
    //     }
    //     if (result && !orderId) {
    //       try {
    //         await createOrderNotification(
    //           result.createdby || userId,
    //           result.id,
    //           result.order_number || '',
    //           'created',
    //           userId
    //         );
    //         await createRequest({
    //           requester_id: result.salesperson_id,
    //           request_type: 'ORDER_APPROVAL',
    //           reference_id: result.id,
    //           createdby: userId,
    //           log_inst: 1,
    //         });
    //       } catch (error: any) {
    //         console.error(' Error creating approval request:', error);
    //       }
    //     }
    //     const response = {
    //       success: true,
    //       message: orderId
    //         ? 'Order updated successfully'
    //         : 'Order created successfully and sent for approval',
    //       data: {
    //         ...serializeOrder(result),
    //         promotion_applied: appliedPromotion,
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
    async createOrUpdateOrder(req, res) {
        const data = req.body;
        const userId = req.user?.id || 1;
        try {
            const { orderItems, order_items, selected_promotion_id, van_inventory_id, ...orderData } = data;
            const items = orderItems || order_items || [];
            let orderId = orderData.id;
            console.log(' Processing order with items:', {
                orderId,
                orderNumber: orderData.order_number,
                itemsCount: items.length,
                selected_promotion_id: selected_promotion_id || 'None',
                van_inventory_id: van_inventory_id || 'None',
            });
            let vanInventory = null;
            if (van_inventory_id) {
                vanInventory = await prisma_client_1.default.van_inventory.findUnique({
                    where: { id: Number(van_inventory_id) },
                    include: {
                        van_inventory_items_inventory: {
                            include: {
                                van_inventory_items_products: true,
                                van_inventory_items_batch_lot: true,
                            },
                        },
                    },
                });
                if (!vanInventory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Van inventory not found',
                    });
                }
            }
            let calculatedSubtotal = new client_1.Prisma.Decimal(0);
            for (const item of items) {
                const itemTotal = new client_1.Prisma.Decimal(item.quantity).mul(new client_1.Prisma.Decimal(item.price || item.unit_price || 0));
                calculatedSubtotal = calculatedSubtotal.add(itemTotal);
            }
            const customer = await prisma_client_1.default.customers.findUnique({
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
            let promotionDiscount = new client_1.Prisma.Decimal(0);
            let freeProducts = [];
            if (selected_promotion_id) {
                try {
                    const promotion = await prisma_client_1.default.promotions.findUnique({
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
                    if (promotion.is_active !== 'Y' ||
                        promotion.start_date > now ||
                        promotion.end_date < now) {
                        return res.status(400).json({
                            success: false,
                            message: 'Selected promotion is not active or has expired',
                        });
                    }
                    if (promotion.promotion_customer_exclusion_promotions.length > 0) {
                        const isExcluded = promotion.promotion_customer_exclusion_promotions.some(exc => exc.is_excluded === 'Y');
                        if (isExcluded) {
                            return res.status(400).json({
                                success: false,
                                message: 'Customer is excluded from this promotion',
                            });
                        }
                    }
                    let isEligible = false;
                    if (promotion.promotion_salesperson_promotions.length === 0 &&
                        promotion.promotion_routes_promotions.length === 0 &&
                        promotion.promotion_customer_category_promotions.length === 0) {
                        isEligible = true;
                    }
                    else {
                        if (promotion.promotion_salesperson_promotions.length > 0 &&
                            promotion.promotion_salesperson_promotions.some(s => s.salesperson_id === orderData.salesperson_id)) {
                            isEligible = true;
                        }
                        if (!isEligible &&
                            customer.route_id &&
                            promotion.promotion_routes_promotions.length > 0 &&
                            promotion.promotion_routes_promotions.some(r => r.route_id === customer.route_id)) {
                            isEligible = true;
                        }
                        if (!isEligible &&
                            customer.type &&
                            promotion.promotion_customer_category_promotions.length > 0) {
                            const categoryIds = promotion.promotion_customer_category_promotions.map(c => c.customer_category_id);
                            const categories = await prisma_client_1.default.customer_category.findMany({
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
                    let totalQty = new client_1.Prisma.Decimal(0);
                    let totalValue = new client_1.Prisma.Decimal(0);
                    const productIds = items.map((item) => item.product_id);
                    const products = await prisma_client_1.default.products.findMany({
                        where: { id: { in: productIds } },
                        select: { id: true, category_id: true },
                    });
                    const productCategoryMap = new Map(products.map(p => [p.id, p.category_id]));
                    for (const item of items) {
                        const productMatch = condition.promotion_condition_products.find(cp => cp.product_id === item.product_id ||
                            cp.category_id === productCategoryMap.get(item.product_id));
                        if (productMatch) {
                            const lineQty = new client_1.Prisma.Decimal(item.quantity || 0);
                            const linePrice = new client_1.Prisma.Decimal(item.price || item.unit_price || 0);
                            const lineValue = lineQty.mul(linePrice);
                            totalQty = totalQty.add(lineQty);
                            totalValue = totalValue.add(lineValue);
                        }
                    }
                    const minValue = new client_1.Prisma.Decimal(condition.min_value || 0);
                    if (!totalValue.gte(minValue)) {
                        return res.status(400).json({
                            success: false,
                            message: `Order value ${totalValue.toFixed(2)} does not meet minimum ${minValue.toFixed(2)}`,
                        });
                    }
                    const applicableLevel = promotion.promotion_level_promotions.find(lvl => new client_1.Prisma.Decimal(lvl.threshold_value).lte(totalValue));
                    if (!applicableLevel) {
                        return res.status(400).json({
                            success: false,
                            message: 'Order does not meet promotion threshold',
                        });
                    }
                    let discountAmount = new client_1.Prisma.Decimal(0);
                    if (applicableLevel.discount_type === 'PERCENTAGE') {
                        const discountPercent = new client_1.Prisma.Decimal(applicableLevel.discount_value || 0);
                        discountAmount = totalValue.mul(discountPercent).div(100);
                    }
                    else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
                        discountAmount = new client_1.Prisma.Decimal(applicableLevel.discount_value || 0);
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
                    console.log(' Promotion applied:', appliedPromotion.promotion_name);
                }
                catch (error) {
                    console.error(' Error applying promotion:', error);
                    return res.status(400).json({
                        success: false,
                        message: 'Failed to apply selected promotion',
                    });
                }
            }
            const subtotal = calculatedSubtotal;
            const discount_amount = promotionDiscount;
            const tax_amount = new client_1.Prisma.Decimal(orderData.tax_amount || 0);
            const shipping_amount = new client_1.Prisma.Decimal(orderData.shipping_amount || 0);
            const total_amount = subtotal
                .minus(discount_amount)
                .plus(tax_amount)
                .plus(shipping_amount);
            const result = await prisma_client_1.default.$transaction(async (tx) => {
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
                }
                else if (orderId) {
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
                }
                else {
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
                    for (const item of items) {
                        const product = await tx.products.findUnique({
                            where: { id: Number(item.product_id) },
                        });
                        if (!product) {
                            throw new Error(`Product ${item.product_id} not found`);
                        }
                        const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
                        const quantity = parseInt(item.quantity, 10);
                        if (trackingType === 'BATCH') {
                            console.log('Going to BATCH branch');
                            const batchData = item.batches || item.product_batches;
                            if (!batchData || !Array.isArray(batchData)) {
                                throw new Error(`Batches are required for product "${product.name}"`);
                            }
                            let totalOrderedQty = 0;
                            for (const batchOrder of batchData) {
                                const batchQty = parseInt(batchOrder.quantity, 10);
                                totalOrderedQty += batchQty;
                                if (vanInventory) {
                                    const vanItem = vanInventory.van_inventory_items_inventory.find(vi => vi.product_id === product.id &&
                                        vi.batch_lot_id === batchOrder.batch_lot_id);
                                    if (!vanItem) {
                                        throw new Error(`Batch ${batchOrder.batch_lot_id} not found in van inventory for product "${product.name}"`);
                                    }
                                    if (vanItem.quantity < batchQty) {
                                        throw new Error(`Insufficient quantity in van for batch. Available: ${vanItem.quantity}, Requested: ${batchQty}`);
                                    }
                                }
                                const batchLot = await tx.batch_lots.findUnique({
                                    where: { id: batchOrder.batch_lot_id },
                                });
                                if (!batchLot) {
                                    throw new Error(`Batch lot ${batchOrder.batch_lot_id} not found`);
                                }
                                if (batchLot.remaining_quantity < batchQty) {
                                    throw new Error(`Insufficient quantity in batch lot. Available: ${batchLot.remaining_quantity}, Requested: ${batchQty}`);
                                }
                                await tx.batch_lots.update({
                                    where: { id: batchOrder.batch_lot_id },
                                    data: {
                                        remaining_quantity: batchLot.remaining_quantity - batchQty,
                                        updatedate: new Date(),
                                    },
                                });
                                const productBatch = await tx.product_batches.findFirst({
                                    where: {
                                        product_id: product.id,
                                        batch_lot_id: batchOrder.batch_lot_id,
                                        is_active: 'Y',
                                    },
                                });
                                if (productBatch) {
                                    if (productBatch.quantity < batchQty) {
                                        throw new Error(`Insufficient quantity in product batch. Available: ${productBatch.quantity}, Requested: ${batchQty}`);
                                    }
                                    await tx.product_batches.update({
                                        where: { id: productBatch.id },
                                        data: {
                                            quantity: productBatch.quantity - batchQty,
                                            updatedate: new Date(),
                                        },
                                    });
                                }
                                const inventoryStock = await tx.inventory_stock.findFirst({
                                    where: {
                                        product_id: product.id,
                                        batch_id: batchOrder.batch_lot_id,
                                    },
                                });
                                if (inventoryStock) {
                                    const currentStock = inventoryStock.current_stock ?? 0;
                                    const availableStock = inventoryStock.available_stock ?? 0;
                                    if (currentStock < batchQty) {
                                        throw new Error(`Insufficient inventory stock for batch. Available: ${currentStock}, Requested: ${batchQty}`);
                                    }
                                    await tx.inventory_stock.update({
                                        where: { id: inventoryStock.id },
                                        data: {
                                            current_stock: currentStock - batchQty,
                                            available_stock: availableStock - batchQty,
                                            updatedate: new Date(),
                                            updatedby: userId,
                                        },
                                    });
                                }
                                else {
                                    throw new Error(`Inventory stock not found for product ${product.name} and batch ${batchOrder.batch_lot_id}`);
                                }
                                await tx.stock_movements.create({
                                    data: {
                                        product_id: product.id,
                                        batch_id: batchOrder.batch_lot_id,
                                        serial_id: null,
                                        movement_type: 'SALE',
                                        reference_type: 'ORDER',
                                        reference_id: order.id,
                                        from_location_id: vanInventory?.location_id || null,
                                        to_location_id: null,
                                        quantity: batchQty,
                                        movement_date: new Date(),
                                        remarks: `Sold via order ${order.order_number} - Batch: ${batchLot.batch_number}`,
                                        is_active: 'Y',
                                        createdate: new Date(),
                                        createdby: userId,
                                        log_inst: 1,
                                        van_inventory_id: van_inventory_id
                                            ? Number(van_inventory_id)
                                            : null,
                                    },
                                });
                                console.log(` Deducted ${batchQty} from batch ${batchLot.batch_number}`);
                            }
                            if (totalOrderedQty !== quantity) {
                                throw new Error(`Total batch quantity (${totalOrderedQty}) does not match ordered quantity (${quantity})`);
                            }
                            await tx.order_items.create({
                                data: {
                                    parent_id: order.id,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: item.unit || 'pcs',
                                    quantity: totalOrderedQty,
                                    unit_price: Number(item.unit_price || item.price),
                                    discount_amount: Number(item.discount_amount) || 0,
                                    tax_amount: Number(item.tax_amount) || 0,
                                    total_amount: totalOrderedQty * Number(item.unit_price || item.price),
                                    notes: `Batches: ${batchData.map((b) => b.batch_lot_id).join(', ')}`,
                                    is_free_gift: false,
                                },
                            });
                        }
                        else if (trackingType === 'SERIAL') {
                            console.log('🔹 Going to SERIAL branch');
                            const serialData = item.serials || item.product_serials;
                            if (!serialData ||
                                !Array.isArray(serialData) ||
                                serialData.length === 0) {
                                throw new Error(`Serial numbers required for "${product.name}"`);
                            }
                            for (const serialInput of serialData) {
                                const serialNumber = typeof serialInput === 'string'
                                    ? serialInput
                                    : serialInput.serial_number;
                                if (!serialNumber) {
                                    throw new Error('Serial number is required');
                                }
                                // ✅ FIND EXISTING SERIAL
                                const serial = await tx.serial_numbers.findUnique({
                                    where: { serial_number: serialNumber },
                                });
                                if (!serial) {
                                    throw new Error(`Serial number ${serialNumber} not found`);
                                }
                                // ✅ UPDATE SERIAL STATUS TO SOLD
                                await tx.serial_numbers.update({
                                    where: { id: serial.id },
                                    data: {
                                        status: 'sold',
                                        customer_id: customer?.id || null,
                                        sold_date: new Date(),
                                        updatedate: new Date(),
                                        updatedby: userId,
                                    },
                                });
                                console.log(`✅ Serial ${serialNumber} marked as SOLD`);
                                // ✅ DECREASE INVENTORY_STOCK (THIS IS THE MAIN FIX!)
                                const inventoryStock = await tx.inventory_stock.findFirst({
                                    where: {
                                        product_id: product.id,
                                        serial_number_id: serial.id,
                                    },
                                });
                                if (inventoryStock) {
                                    const oldCurrent = inventoryStock.current_stock || 0;
                                    const oldAvailable = inventoryStock.available_stock || 0;
                                    const newCurrentStock = Math.max(0, oldCurrent - 1);
                                    const newAvailableStock = Math.max(0, oldAvailable - 1);
                                    await tx.inventory_stock.update({
                                        where: { id: inventoryStock.id },
                                        data: {
                                            current_stock: newCurrentStock,
                                            available_stock: newAvailableStock,
                                            updatedate: new Date(),
                                            updatedby: userId,
                                        },
                                    });
                                    console.log(`✅ DECREASED inventory_stock for ${serialNumber}: current ${oldCurrent}→${newCurrentStock}, available ${oldAvailable}→${newAvailableStock}`);
                                }
                                else {
                                    console.warn(`⚠️ No inventory_stock found for serial ${serialNumber}`);
                                }
                                // ✅ DECREASE VAN INVENTORY IF PROVIDED
                                if (vanInventory) {
                                    const vanItem = await tx.van_inventory_items.findFirst({
                                        where: {
                                            parent_id: Number(van_inventory_id),
                                            product_id: product.id,
                                            serial_id: serial.id,
                                        },
                                    });
                                    if (vanItem && vanItem.quantity > 0) {
                                        await tx.van_inventory_items.update({
                                            where: { id: vanItem.id },
                                            data: { quantity: { decrement: 1 } },
                                        });
                                        console.log(`✅ DECREASED van_inventory_items for ${serialNumber}: ${vanItem.quantity}→${vanItem.quantity - 1}`);
                                    }
                                }
                                // ✅ CREATE STOCK MOVEMENT FOR SALE
                                await tx.stock_movements.create({
                                    data: {
                                        product_id: product.id,
                                        batch_id: null,
                                        serial_id: serial.id,
                                        movement_type: 'SALE',
                                        reference_type: 'ORDER',
                                        reference_id: order.id,
                                        from_location_id: vanInventory?.location_id || null,
                                        to_location_id: null,
                                        quantity: 1,
                                        movement_date: new Date(),
                                        remarks: `Sold via order ${order.order_number} - Serial ${serialNumber}`,
                                        is_active: 'Y',
                                        createdate: new Date(),
                                        createdby: userId,
                                        log_inst: 1,
                                        van_inventory_id: van_inventory_id
                                            ? Number(van_inventory_id)
                                            : null,
                                    },
                                });
                                console.log(`✅ SALE stock_movement created for ${serialNumber}`);
                            }
                            // ✅ CREATE ORDER ITEM FOR ALL SERIALS
                            await tx.order_items.create({
                                data: {
                                    parent_id: order.id,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: 'pcs',
                                    quantity: serialData.length,
                                    unit_price: Number(item.unit_price || item.price),
                                    discount_amount: Number(item.discount_amount || 0),
                                    tax_amount: Number(item.tax_amount || 0),
                                    total_amount: serialData.length * Number(item.unit_price || item.price),
                                    notes: `Serials: ${serialData.map((s) => (typeof s === 'string' ? s : s.serial_number)).join(', ')}`,
                                    is_free_gift: false,
                                },
                            });
                            console.log(`✅ Order item created for ${serialData.length} serials`);
                        }
                        else {
                            console.log(' Going to NONE branch');
                            if (vanInventory) {
                                const vanItem = vanInventory.van_inventory_items_inventory.find(vi => vi.product_id === product.id);
                                if (!vanItem) {
                                    throw new Error(`Product "${product.name}" not found in van inventory`);
                                }
                                if (vanItem.quantity < quantity) {
                                    throw new Error(`Insufficient quantity in van for "${product.name}". Available: ${vanItem.quantity}, Requested: ${quantity}`);
                                }
                            }
                            const inventoryStock = await tx.inventory_stock.findFirst({
                                where: {
                                    product_id: product.id,
                                    batch_id: null,
                                    serial_number_id: null,
                                },
                            });
                            if (inventoryStock) {
                                const newCurrentStock = Math.max(0, (inventoryStock.current_stock || 0) - 1);
                                const newAvailableStock = Math.max(0, (inventoryStock.available_stock || 0) - 1);
                                await tx.inventory_stock.update({
                                    where: { id: inventoryStock.id },
                                    data: {
                                        current_stock: newCurrentStock, // ✅ DECREASED!
                                        available_stock: newAvailableStock, // ✅ DECREASED!
                                        updatedate: new Date(),
                                        updatedby: userId,
                                    },
                                });
                            }
                            else {
                                throw new Error(`Inventory stock not found for product ${product.name}`);
                            }
                            await tx.stock_movements.create({
                                data: {
                                    product_id: product.id,
                                    batch_id: null,
                                    serial_id: null,
                                    movement_type: 'SALE',
                                    reference_type: 'ORDER',
                                    reference_id: order.id,
                                    from_location_id: vanInventory?.location_id || null,
                                    to_location_id: null,
                                    quantity: quantity,
                                    movement_date: new Date(),
                                    remarks: `Sold via order ${order.order_number}`,
                                    is_active: 'Y',
                                    createdate: new Date(),
                                    createdby: userId,
                                    log_inst: 1,
                                    van_inventory_id: van_inventory_id
                                        ? Number(van_inventory_id)
                                        : null,
                                },
                            });
                            await tx.order_items.create({
                                data: {
                                    parent_id: order.id,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: item.unit || 'pcs',
                                    quantity: quantity,
                                    unit_price: Number(item.unit_price || item.price),
                                    discount_amount: Number(item.discount_amount) || 0,
                                    tax_amount: Number(item.tax_amount) || 0,
                                    total_amount: quantity * Number(item.unit_price || item.price),
                                    notes: item.notes || null,
                                    is_free_gift: false,
                                },
                            });
                            console.log(` Sold ${quantity} units of ${product.name}`);
                        }
                    }
                    if (freeProducts.length > 0) {
                        for (const freeProduct of freeProducts) {
                            await tx.order_items.create({
                                data: {
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
                                },
                            });
                        }
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
            }, {
                maxWait: 10000,
                timeout: 20000,
            });
            if (appliedPromotion && !orderId) {
                try {
                    await prisma_client_1.default.promotion_tracking.create({
                        data: {
                            parent_id: appliedPromotion.promotion_id,
                            action_type: 'APPLIED',
                            action_date: new Date(),
                            user_id: userId,
                            comments: `Applied to order ${result?.order_number}`,
                            is_active: 'Y',
                        },
                    });
                }
                catch (error) {
                    console.error('Promotion tracking failed:', error);
                }
            }
            if (result && !orderId) {
                try {
                    await (0, helpers_1.createOrderNotification)(result.createdby || userId, result.id, result.order_number || '', 'created', userId);
                    await (0, requests_controller_1.createRequest)({
                        requester_id: result.salesperson_id,
                        request_type: 'ORDER_APPROVAL',
                        reference_id: result.id,
                        createdby: userId,
                        log_inst: 1,
                    });
                }
                catch (error) {
                    console.error('Error creating approval request:', error);
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
        }
        catch (error) {
            console.error(' Error processing order:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process order',
                error: error.message,
            });
        }
    },
    async approveOrRejectOrder(req, res) {
        try {
            const { id } = req.params; // Order ID
            const { action, comments, approvedby } = req.body; // action: 'approved' or 'rejected'
            const userId = req.user?.id || 1;
            // Validate action
            if (!['approved', 'rejected'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Must be "approved" or "rejected"',
                });
            }
            const order = await prisma_client_1.default.orders.findUnique({
                where: { id: Number(id) },
                include: {
                    orders_customers: true,
                    orders_salesperson_users: true,
                },
            });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }
            // Check if order is pending approval
            if (order.approval_status !== 'pending' &&
                order.approval_status !== 'submitted') {
                return res.status(400).json({
                    success: false,
                    message: `Order is already ${order.approval_status}`,
                });
            }
            // Update order with approval/rejection
            const updatedOrder = await prisma_client_1.default.orders.update({
                where: { id: Number(id) },
                data: {
                    approval_status: action, // 'approved' or 'rejected'
                    approved_by: approvedby || userId,
                    approved_at: new Date(),
                    status: action === 'approved' ? 'confirmed' : 'cancelled',
                    updatedate: new Date(),
                    updatedby: userId,
                    log_inst: { increment: 1 },
                    notes: comments
                        ? `${order.notes || ''}\n\nApproval Comments: ${comments}`
                        : order.notes,
                },
                include: {
                    orders_currencies: true,
                    orders_customers: true,
                    orders_salesperson_users: true,
                    order_items: true,
                    invoices: true,
                },
            });
            // Update approval workflow if exists
            const workflow = await prisma_client_1.default.approval_workflows.findFirst({
                where: {
                    reference_type: 'order',
                    reference_number: order.order_number,
                    status: { in: ['pending', 'inprogress'] },
                },
            });
            if (workflow) {
                // Update workflow with correct field names from schema
                await prisma_client_1.default.approval_workflows.update({
                    where: { id: workflow.id },
                    data: {
                        status: action === 'approved' ? 'approved' : 'rejected',
                        final_approved_by: action === 'approved' ? approvedby || userId : undefined,
                        final_approved_at: action === 'approved' ? new Date() : undefined,
                        rejected_by: action === 'rejected' ? approvedby || userId : undefined,
                        rejected_at: action === 'rejected' ? new Date() : undefined,
                        rejection_reason: action === 'rejected' ? comments : undefined,
                        updatedate: new Date(),
                        updatedby: userId,
                    },
                });
                // Update workflow steps - need to check workflow_steps schema for correct fields
                await prisma_client_1.default.workflow_steps.updateMany({
                    where: {
                        workflow_id: workflow.id,
                        status: 'pending',
                    },
                    data: {
                        status: action === 'approved' ? 'completed' : 'rejected',
                        // Remove completed_by and completed_at if they don't exist in schema
                        updatedate: new Date(),
                    },
                });
            }
            try {
                await (0, helpers_1.createOrderNotification)(order.createdby, order.id, order.order_number, action, userId);
                if (order.salesperson_id && order.salesperson_id !== order.createdby) {
                    await (0, helpers_1.createOrderNotification)(order.salesperson_id, order.id, order.order_number, action, userId);
                }
            }
            catch (notificationError) {
                console.error('Error sending approval notification:', notificationError);
            }
            return res.json({
                success: true,
                message: `Order ${action === 'approved' ? 'approved' : 'rejected'} successfully`,
                data: serializeOrder(updatedOrder),
            });
        }
        catch (error) {
            console.error('Approve/Reject Order Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process order approval',
                error: error.message,
            });
        }
    },
    async getAllOrders(req, res) {
        try {
            const { page, limit, search, sales_person_id, customer_id, status, isActive, route_id, route_ids, } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {};
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
                filters.salesperson_id = parseInt(sales_person_id, 10);
            }
            if (customer_id) {
                filters.parent_id = parseInt(customer_id, 10);
            }
            if (status) {
                filters.status = status;
            }
            if (route_ids) {
                const routeIdArray = route_ids
                    .split(',')
                    .map((id) => parseInt(id.trim(), 10))
                    .filter((id) => !isNaN(id));
                if (routeIdArray.length > 0) {
                    filters.orders_customers = {
                        ...filters.orders_customers,
                        route_id: {
                            in: routeIdArray,
                        },
                    };
                }
            }
            else if (route_id) {
                const parsedRouteId = parseInt(route_id, 10);
                if (!isNaN(parsedRouteId)) {
                    filters.orders_customers = {
                        ...filters.orders_customers,
                        route_id: parsedRouteId,
                    };
                }
            }
            if (isActive !== undefined && isActive !== '') {
                let activeValue = isActive.toString().toUpperCase();
                if (activeValue === 'TRUE' ||
                    activeValue === '1' ||
                    activeValue === 'ACTIVE') {
                    activeValue = 'Y';
                }
                else if (activeValue === 'FALSE' ||
                    activeValue === '0' ||
                    activeValue === 'INACTIVE') {
                    activeValue = 'N';
                }
                if (activeValue === 'Y' || activeValue === 'N') {
                    filters.is_active = activeValue;
                }
            }
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.orders,
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
            const enrichedOrders = data.map((order) => {
                const serialized = serializeOrder(order);
                if (order.promotion_id && order.orders_promotion) {
                    serialized.promotion_applied = {
                        promotion_id: order.orders_promotion.id,
                        promotion_name: order.orders_promotion.name,
                        promotion_code: order.orders_promotion.code,
                        discount_amount: order.discount_amount
                            ? Number(order.discount_amount)
                            : 0,
                        free_products: order.order_items
                            ?.filter((item) => item.is_free_gift === true)
                            .map((item) => ({
                            product_id: item.product_id,
                            product_name: item.product_name,
                            quantity: item.quantity,
                        })) || [],
                    };
                }
                return serialized;
            });
            const statsFilter = {};
            if (route_ids) {
                const routeIdArray = route_ids
                    .split(',')
                    .map((id) => parseInt(id.trim(), 10))
                    .filter((id) => !isNaN(id));
                if (routeIdArray.length > 0) {
                    statsFilter.orders_customers = {
                        route_id: { in: routeIdArray },
                    };
                }
            }
            else if (route_id) {
                const parsedRouteId = parseInt(route_id, 10);
                if (!isNaN(parsedRouteId)) {
                    statsFilter.orders_customers = {
                        route_id: parsedRouteId,
                    };
                }
            }
            if (customer_id) {
                statsFilter.parent_id = parseInt(customer_id, 10);
            }
            if (sales_person_id) {
                statsFilter.salesperson_id = parseInt(sales_person_id, 10);
            }
            if (status) {
                statsFilter.status = status;
            }
            const totalOrders = await prisma_client_1.default.orders.count({
                where: statsFilter,
            });
            const activeOrders = await prisma_client_1.default.orders.count({
                where: {
                    ...statsFilter,
                    is_active: 'Y',
                },
            });
            const inactiveOrders = await prisma_client_1.default.orders.count({
                where: {
                    ...statsFilter,
                    is_active: 'N',
                },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const ordersThisMonth = await prisma_client_1.default.orders.count({
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
                                .map((id) => parseInt(id.trim(), 10))
                                .filter((id) => !isNaN(id)),
                        },
                    }
                    : { route_id: parseInt(route_id, 10) };
                const customersInRoutes = await prisma_client_1.default.customers.count({
                    where: routeFilter,
                });
                const orderTotals = await prisma_client_1.default.orders.aggregate({
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
            res.success('Orders retrieved successfully', enrichedOrders, 200, pagination, {
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
            });
        }
        catch (error) {
            console.error('Get Orders Error:', error);
            res.status(500).json({
                message: 'Failed to retrieve orders',
                error: error.message,
            });
        }
    },
    async getOrdersById(req, res) {
        try {
            const { id } = req.params;
            const order = await prisma_client_1.default.orders.findUnique({
                where: { id: Number(id) },
                include: {
                    orders_currencies: true,
                    orders_customers: true,
                    orders_salesperson_users: true,
                    order_items: true,
                    invoices: true,
                },
            });
            if (!order)
                return res.status(404).json({ message: 'Order not found' });
            res.json({
                message: 'Order fetched successfully',
                data: serializeOrder(order),
            });
        }
        catch (error) {
            console.error('Get Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateOrders(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || 1;
            const { orderItems, order_items, ...orderData } = req.body;
            const items = orderItems || order_items || [];
            const existingOrder = await prisma_client_1.default.orders.findUnique({
                where: { id: Number(id) },
            });
            if (!existingOrder)
                return res.status(404).json({ message: 'Order not found' });
            const result = await prisma_client_1.default.$transaction(async (tx) => {
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
                    const itemsToCreate = items.map((item) => {
                        const unitPrice = parseFloat(item.unit_price || item.price || '0');
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
            }, {
                maxWait: 10000,
                timeout: 20000,
            });
            if (result) {
                try {
                    const orderCreatorId = result.createdby || userId;
                    const previousApprovalStatus = existingOrder.approval_status;
                    await (0, helpers_1.createOrderNotification)(orderCreatorId, result.id, result.order_number || '', 'updated', userId);
                    if (result.status === 'cancelled' ||
                        result.approval_status === 'rejected') {
                        await (0, helpers_1.createOrderNotification)(orderCreatorId, result.id, result.order_number || '', result.status === 'cancelled' ? 'cancelled' : 'rejected', userId);
                    }
                    if (previousApprovalStatus !== 'pending' &&
                        previousApprovalStatus !== 'submitted' &&
                        (result.approval_status === 'pending' ||
                            result.approval_status === 'submitted')) {
                        const existingWorkflow = await prisma_client_1.default.approval_workflows.findFirst({
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
                                let priority = 'medium';
                                if (result.total_amount) {
                                    const totalAmount = Number(result.total_amount);
                                    if (totalAmount >= 100000) {
                                        priority = 'urgent';
                                    }
                                    else if (totalAmount >= 50000) {
                                        priority = 'high';
                                    }
                                    else if (totalAmount >= 10000) {
                                        priority = 'medium';
                                    }
                                    else {
                                        priority = 'low';
                                    }
                                }
                                const workflow = await (0, helpers_1.createOrderApprovalWorkflow)(result.id, result.order_number || '', orderCreatorId, priority, {
                                    order_id: result.id,
                                    order_number: result.order_number,
                                    total_amount: result.total_amount,
                                    customer_id: result.parent_id,
                                    salesperson_id: result.salesperson_id,
                                }, userId);
                                if (workflow) {
                                    if (result.salesperson_id) {
                                        const salesperson = await prisma_client_1.default.users.findUnique({
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
                                        const approvers = [];
                                        if (salesperson?.parent_id) {
                                            approvers.push(salesperson.parent_id);
                                        }
                                        if (workflow.workflow_steps &&
                                            workflow.workflow_steps.length > 1) {
                                            const managerStep = workflow.workflow_steps.find(s => s.step_name === 'Manager Approval');
                                            if (managerStep && managerStep.assigned_role) {
                                                const managers = await prisma_client_1.default.users.findMany({
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
                                            await (0, helpers_1.createWorkflowNotification)(approverId, workflow.id, result.order_number || '', 'pending', userId);
                                        }
                                        await (0, helpers_1.createWorkflowNotification)(orderCreatorId, workflow.id, result.order_number || '', 'created', userId);
                                    }
                                }
                            }
                            catch (workflowError) {
                                console.error('Error creating approval workflow:', workflowError);
                            }
                        }
                    }
                }
                catch (notificationError) {
                    console.error('Error creating order notification:', notificationError);
                }
            }
            res.json({
                message: 'Order updated successfully',
                data: serializeOrder(result),
            });
        }
        catch (error) {
            console.error('Update Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteOrders(req, res) {
        try {
            const { id } = req.params;
            const existingOrder = await prisma_client_1.default.orders.findUnique({
                where: { id: Number(id) },
            });
            if (!existingOrder)
                return res.status(404).json({ message: 'Order not found' });
            await prisma_client_1.default.order_items.deleteMany({
                where: { parent_id: Number(id) },
            });
            await prisma_client_1.default.orders.delete({ where: { id: Number(id) } });
            res.json({ message: 'Order deleted successfully' });
        }
        catch (error) {
            console.error('Delete Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getOrdersOrderItemsByOrderId(req, res) {
        try {
            const { id } = req.params;
            const orderItems = await prisma_client_1.default.order_items.findMany({
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
        }
        catch (error) {
            console.error('Get Order Items Error:', error);
            res.status(500).json({
                message: 'Failed to retrieve order items',
                error: error.message,
            });
        }
    },
};
//# sourceMappingURL=orders.controller.js.map