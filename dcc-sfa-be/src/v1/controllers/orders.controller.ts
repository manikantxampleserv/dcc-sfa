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
  pricelist_id?: number | null;
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
    unit?: 'CASE' | 'PIECE';
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
  pricelist_id: order.pricelist_id ?? null,
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
      tracking_type: oi.products?.tracking_type || null,
      product_batches: oi.product_batches || [],
      product_serials: oi.product_serials || [],
    })) || [],

  invoices:
    order.invoices?.map((inv: any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: inv.amount,
    })) || [],

  promotion_applied: order.promotion_applied || null,
});

function calculateUnitConversion(
  currentQuantity: number,
  currentBaseQuantity: number,
  conversionFactor: number,
  usedQuantity: number,
  unit: string,
  movementType: 'SALE' | 'RETURN'
): { newQuantity: number; newBaseQuantity: number } {
  const factor = conversionFactor || 1;

  if (unit === 'PCS') {
    const totalCurrentPCS = currentQuantity * factor + currentBaseQuantity;

    let newTotalPCS: number;
    if (movementType === 'SALE') {
      newTotalPCS = totalCurrentPCS - usedQuantity;
    } else {
      newTotalPCS = totalCurrentPCS + usedQuantity;
    }

    if (newTotalPCS < 0) {
      throw new Error(
        `Insufficient stock. Available: ${totalCurrentPCS} PCS (${currentQuantity} cases + ${currentBaseQuantity} pcs), Requested: ${usedQuantity} PCS`
      );
    }

    const newQuantity = Math.floor(newTotalPCS / factor);
    const newBaseQuantity = newTotalPCS % factor;

    console.log(
      `PCS conversion: ${currentQuantity} cases + ${currentBaseQuantity} pcs = ${totalCurrentPCS} PCS`
    );
    console.log(
      `After ${movementType}: ${newTotalPCS} PCS = ${newQuantity} cases + ${newBaseQuantity} pcs`
    );

    return { newQuantity, newBaseQuantity };
  } else {
    let newQuantity: number;
    if (movementType === 'SALE') {
      newQuantity = currentQuantity - usedQuantity;
    } else {
      newQuantity = currentQuantity + usedQuantity;
    }

    if (newQuantity < 0) {
      throw new Error(
        `Insufficient stock. Available: ${currentQuantity} cases, Requested: ${usedQuantity} cases`
      );
    }

    return { newQuantity, newBaseQuantity: currentBaseQuantity };
  }
}

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
        console.log('Generated unique order number:', newOrderNumber);
        return newOrderNumber;
      }

      console.log('Order number exists, retrying...', newOrderNumber);
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

async function processOrderItems(
  tx: any,
  params: {
    items: any[];
    originalOrderItems: any[];
    order: any;
    vanInventory: any;
    van_inventory_id: any;
    userId: number;
    isUpdate: boolean;
    customer: any;
  }
) {
  const {
    items,
    originalOrderItems,
    order,
    vanInventory,
    van_inventory_id,
    userId,
    isUpdate,
    customer,
  } = params;

  console.log('Processing order items with delta update:', {
    isUpdate,
    newItemsCount: items.length,
    originalItemsCount: originalOrderItems.length,
  });

  if (!isUpdate) {
    for (const item of items) {
      await processSingleItem(tx, {
        item,
        order,
        vanInventory,
        van_inventory_id,
        userId,
        customer,
        isNewItem: true,
      });
    }
    return;
  }

  console.log(
    'Original order items:',
    originalOrderItems.map(oi => ({
      id: oi.id,
      product_id: oi.product_id,
      unit: oi.unit,
      quantity: oi.quantity,
      key: `${oi.product_id}_${oi.unit}`,
    }))
  );

  console.log(
    'New order items:',
    items.map(ni => ({
      product_id: ni.product_id,
      unit: ni.unit || 'CASE',
      quantity: ni.quantity,
      key: `${ni.product_id}_${ni.unit || 'CASE'}`,
    }))
  );

  const originalItemsMap = new Map(
    originalOrderItems.map(oi => [`${oi.product_id}_${oi.unit}`, oi])
  );

  const newItemsMap = new Map(
    items.map(ni => [`${ni.product_id}_${ni.unit || 'CASE'}`, ni])
  );

  const itemsToRemove: any[] = [];
  for (const [key, originalItem] of originalItemsMap) {
    if (!newItemsMap.has(key)) {
      itemsToRemove.push(originalItem);
    }
  }

  const itemsToAdd: any[] = [];
  for (const [key, newItem] of newItemsMap) {
    if (!originalItemsMap.has(key)) {
      itemsToAdd.push(newItem);
    }
  }

  const itemsToUpdate: any[] = [];
  for (const [key, newItem] of newItemsMap) {
    const originalItem = originalItemsMap.get(key);
    if (originalItem) {
      let needsUpdate = false;
      let updateReason = '';

      if (parseInt(newItem.quantity) !== originalItem.quantity) {
        needsUpdate = true;
        updateReason += `quantity: ${originalItem.quantity}→${newItem.quantity} `;
      }

      const newPrice = Number(newItem.unit_price || newItem.price) || 0;
      const originalPrice = Number(originalItem.unit_price) || 0;
      if (newPrice !== originalPrice) {
        needsUpdate = true;
        updateReason += `price: ${originalPrice}→${newPrice} `;
      }

      const newBatches = newItem.batches || newItem.product_batches || [];
      const originalBatches = originalItem.product_batches || [];

      if (newBatches.length !== originalBatches.length) {
        needsUpdate = true;
        updateReason += `batches count: ${originalBatches.length}→${newBatches.length} `;
      } else {
        const newBatchMap = new Map(
          newBatches.map((b: any) => [b.batch_lot_id, parseInt(b.quantity)])
        );
        const originalBatchMap = new Map(
          originalBatches.map((b: any) => [b.batch_lot_id, b.quantity])
        );

        for (const [batchId, newQty] of newBatchMap) {
          const originalQty = originalBatchMap.get(batchId);
          if (originalQty !== newQty) {
            needsUpdate = true;
            updateReason += `batch ${batchId}: ${originalQty}→${newQty} `;
          }
        }
      }

      const newSerials = newItem.serials || newItem.product_serials || [];
      const originalSerials = originalItem.product_serials || [];

      if (newSerials.length !== originalSerials.length) {
        needsUpdate = true;
        updateReason += `serials count: ${originalSerials.length}→${newSerials.length} `;
      } else {
        const newSerialSet = new Set(
          newSerials.map((s: any) =>
            typeof s === 'string' ? s : s.serial_number
          )
        );
        const originalSerialSet = new Set(
          originalSerials.map((s: any) => s.serial_number)
        );

        if (
          newSerialSet.size !== originalSerialSet.size ||
          ![...newSerialSet].every(serial => originalSerialSet.has(serial))
        ) {
          needsUpdate = true;
          updateReason += 'serials changed ';
        }
      }

      if (needsUpdate) {
        console.log(
          `Item ${originalItem.product_id} needs update: ${updateReason}`
        );
        itemsToUpdate.push({
          originalItem,
          newItem,
          quantityDiff: parseInt(newItem.quantity) - originalItem.quantity,
          priceChanged: newPrice !== originalPrice,
          batchesChanged:
            JSON.stringify(newBatches) !== JSON.stringify(originalBatches),
          serialsChanged:
            JSON.stringify(newSerials) !== JSON.stringify(originalSerials),
        });
      }
    }
  }

  console.log('Delta analysis:', {
    itemsToRemove: itemsToRemove.length,
    itemsToAdd: itemsToAdd.length,
    itemsToUpdate: itemsToUpdate.length,
  });

  for (const removedItem of itemsToRemove) {
    await restoreInventoryForItem(tx, {
      item: removedItem,
      order,
      vanInventory,
      van_inventory_id,
      userId,
      customer,
    });

    await tx.order_items.delete({
      where: { id: removedItem.id },
    });

    console.log(
      `Removed item: ${removedItem.product_name}, restored ${removedItem.quantity} units`
    );
  }

  for (const addedItem of itemsToAdd) {
    await processSingleItem(tx, {
      item: addedItem,
      order,
      vanInventory,
      van_inventory_id,
      userId,
      customer,
      isNewItem: true,
    });

    console.log(
      `Added item: ${addedItem.product_id}, quantity: ${addedItem.quantity}`
    );
  }

  for (const {
    originalItem,
    newItem,
    quantityDiff,
    priceChanged,
    batchesChanged,
    serialsChanged,
  } of itemsToUpdate) {
    const product = await tx.products.findUnique({
      where: { id: Number(newItem.product_id) },
    });

    if (!product) {
      throw new Error(`Product ${newItem.product_id} not found`);
    }

    const trackingType = product.tracking_type?.toUpperCase() || 'NONE';

    if (quantityDiff > 0) {
      console.log(`Increasing quantity for ${product.name} by ${quantityDiff}`);
      await processInventoryChange(tx, {
        product,
        trackingType,
        quantity: quantityDiff,
        item: newItem,
        order,
        van_inventory_id,
        userId,
        customer,
        movementType: 'SALE',
      });
    } else if (quantityDiff < 0) {
      console.log(
        `Decreasing quantity for ${product.name} by ${Math.abs(quantityDiff)}`
      );
      await processInventoryChange(tx, {
        product,
        trackingType,
        quantity: Math.abs(quantityDiff),
        item: originalItem,
        order,
        van_inventory_id,
        userId,
        customer,
        movementType: 'RETURN',
      });
    }

    if (batchesChanged || serialsChanged) {
      console.log(
        `Restoring original inventory for ${product.name} due to batch/serial changes`
      );

      if (batchesChanged && trackingType === 'BATCH') {
        const originalBatchData = originalItem.product_batches || [];

        for (const originalBatch of originalBatchData) {
          await processInventoryChange(tx, {
            product,
            trackingType,
            quantity: originalBatch.quantity,
            item: { ...originalItem, batches: [originalBatch] },
            order,
            van_inventory_id,
            userId,
            customer,
            movementType: 'RETURN',
          });
        }

        const newBatchData = newItem.batches || newItem.product_batches || [];
        for (const newBatch of newBatchData) {
          await processInventoryChange(tx, {
            product,
            trackingType,
            quantity: parseInt(newBatch.quantity),
            item: { ...newItem, batches: [newBatch] },
            order,
            van_inventory_id,
            userId,
            customer,
            movementType: 'SALE',
          });
        }
      } else if (serialsChanged && trackingType === 'SERIAL') {
        const originalSerialData = originalItem.product_serials || [];
        for (const originalSerial of originalSerialData) {
          await processInventoryChange(tx, {
            product,
            trackingType,
            quantity: 1,
            item: { ...originalItem, serials: [originalSerial.serial_number] },
            order,
            van_inventory_id,
            userId,
            customer,
            movementType: 'RETURN',
          });
        }

        const newSerialData = newItem.serials || newItem.product_serials || [];
        for (const newSerial of newSerialData) {
          const serialNumber =
            typeof newSerial === 'string' ? newSerial : newSerial.serial_number;
          await processInventoryChange(tx, {
            product,
            trackingType,
            quantity: 1,
            item: { ...newItem, serials: [serialNumber] },
            order,
            van_inventory_id,
            userId,
            customer,
            movementType: 'SALE',
          });
        }
      } else {
        await processInventoryChange(tx, {
          product,
          trackingType,
          quantity: originalItem.quantity,
          item: originalItem,
          order,
          van_inventory_id,
          userId,
          customer,
          movementType: 'RETURN',
        });

        await processInventoryChange(tx, {
          product,
          trackingType,
          quantity: parseInt(newItem.quantity),
          item: newItem,
          order,
          van_inventory_id,
          userId,
          customer,
          movementType: 'SALE',
        });
      }
    }

    await tx.order_items.update({
      where: { id: originalItem.id },
      data: {
        quantity: parseInt(newItem.quantity),
        unit_price: Number(newItem.unit_price || newItem.price) || 0,
        discount_amount: Number(newItem.discount_amount) || 0,
        tax_amount: Number(newItem.tax_amount) || 0,
        total_amount:
          parseInt(newItem.quantity) *
          (Number(newItem.unit_price || newItem.price) || 0),
        notes: newItem.notes || originalItem.notes,
      },
    });

    console.log(
      `Updated item ${originalItem.product_id}: qty=${originalItem.quantity}→${newItem.quantity}, price=${Number(originalItem.unit_price)}→${Number(newItem.unit_price || newItem.price)}`
    );
  }
}

async function processSingleItem(
  tx: any,
  params: {
    item: any;
    order: any;
    vanInventory: any;
    van_inventory_id: any;
    userId: number;
    customer: any;
    isNewItem: boolean;
  }
) {
  const {
    item,
    order,
    vanInventory,
    van_inventory_id,
    userId,
    customer,
    isNewItem,
  } = params;

  const product = await tx.products.findUnique({
    where: { id: Number(item.product_id) },
    select: {
      id: true,
      name: true,
      tracking_type: true,
    },
  });

  if (!product) {
    throw new Error(`Product ${item.product_id} not found`);
  }

  const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
  const quantity = parseInt(item.quantity, 10);
  const unit = (item.unit || 'CASE').toUpperCase();

  const conversionFactor =
    Number(item.conversion_factor) || Number(item.conversion_rate) || 1;
  let orderItemBaseQuantity = 0;
  if (unit === 'PCS') {
    orderItemBaseQuantity = quantity;
  }

  await processInventoryChange(tx, {
    product,
    trackingType,
    quantity,
    item,
    order,
    userId,
    customer,
    movementType: 'SALE',
    unit,
    conversionFactor,
  });

  await tx.order_items.create({
    data: {
      parent_id: order.id,
      product_id: product.id,
      product_name: product.name,
      unit: unit,
      quantity: unit === 'PCS' ? 0 : quantity,
      base_quantity: unit === 'PCS' ? quantity : 0,
      conversion_factor: conversionFactor,
      unit_price: Number(item.unit_price || item.price) || 0,
      discount_amount: Number(item.discount_amount) || 0,
      tax_amount: Number(item.tax_amount) || 0,
      total_amount: quantity * (Number(item.unit_price || item.price) || 0),
      notes: item.notes || null,
      is_free_gift: false,
    },
  });

  console.log(
    `Created order item: product=${product.name}, unit=${unit}, quantity=${quantity}, conversion_factor=${conversionFactor}, base_quantity=${orderItemBaseQuantity}`
  );
}

async function restoreInventoryForItem(
  tx: any,
  params: {
    item: any;
    order: any;
    vanInventory: any;
    van_inventory_id: any;
    userId: number;
    customer: any;
  }
) {
  const { item, order, vanInventory, van_inventory_id, userId, customer } =
    params;

  const product = await tx.products.findUnique({
    where: { id: Number(item.product_id) },
    select: {
      id: true,
      name: true,
      tracking_type: true,
    },
  });

  if (!product) {
    throw new Error(`Product ${item.product_id} not found`);
  }

  const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
  const unit = (item.unit || 'CASE').toUpperCase();

  const conversionFactor =
    Number(item.conversion_factor) || Number(product.conversion_factor) || 1;

  const restoreQuantity =
    unit === 'PCS' ? item.base_quantity || item.quantity : item.quantity;

  await processInventoryChange(tx, {
    product,
    trackingType,
    quantity: restoreQuantity,
    item,
    order,
    van_inventory_id,
    userId,
    customer,
    movementType: 'RETURN',
    unit,
    conversionFactor,
  });
}

// async function processInventoryChange(
//   tx: any,
//   params: {
//     product: any;
//     trackingType: string;
//     quantity: number;
//     item: any;
//     order: any;
//     vanInventory: any;
//     van_inventory_id: any;
//     userId: number;
//     customer: any;
//     movementType: 'SALE' | 'RETURN';
//   }
// ) {
//   const {
//     product,
//     trackingType,
//     quantity,
//     item,
//     order,
//     vanInventory,
//     van_inventory_id,
//     userId,
//     customer,
//     movementType,
//   } = params;

//   console.log(
//     `Processing ${movementType} for ${product.name}, quantity: ${quantity}, tracking: ${trackingType}`
//   );

//   if (trackingType === 'BATCH') {
//     const batchData = item.batches || item.product_batches;

//     if (!batchData || !Array.isArray(batchData)) {
//       throw new Error(`Batches are required for product "${product.name}"`);
//     }

//     for (const batchOrder of batchData) {
//       const batchQty = parseInt(batchOrder.quantity, 10);

//       const batchLot = await tx.batch_lots.findUnique({
//         where: { id: batchOrder.batch_lot_id },
//       });

//       if (!batchLot) {
//         throw new Error(`Batch lot ${batchOrder.batch_lot_id} not found`);
//       }

//       // Update batch lot remaining quantity
//       const quantityChange = movementType === 'SALE' ? -batchQty : batchQty;
//       await tx.batch_lots.update({
//         where: { id: batchOrder.batch_lot_id },
//         data: {
//           remaining_quantity: batchLot.remaining_quantity + quantityChange,
//           updatedate: new Date(),
//         },
//       });

//       // Update product batches
//       const productBatch = await tx.product_batches.findFirst({
//         where: {
//           product_id: product.id,
//           batch_lot_id: batchOrder.batch_lot_id,
//           is_active: 'Y',
//         },
//       });

//       if (productBatch) {
//         await tx.product_batches.update({
//           where: { id: productBatch.id },
//           data: {
//             quantity: productBatch.quantity + quantityChange,
//             updatedate: new Date(),
//           },
//         });
//       }

//       // Update van inventory items
//       const vanItem = await tx.van_inventory_items.findFirst({
//         where: {
//           product_id: product.id,
//           batch_lot_id: batchOrder.batch_lot_id,
//           van_inventory_items_inventory: {
//             is_active: 'Y',
//           },
//         },
//       });

//       if (vanItem) {
//         const newVanItemQuantity = vanItem.quantity + quantityChange;
//         if (newVanItemQuantity > 0) {
//           await tx.van_inventory_items.update({
//             where: { id: vanItem.id },
//             data: { quantity: newVanItemQuantity },
//           });
//         } else if (newVanItemQuantity === 0) {
//           await tx.van_inventory_items.delete({
//             where: { id: vanItem.id },
//           });
//         } else {
//           throw new Error(
//             `Insufficient quantity in van for batch ${batchLot.batch_number}`
//           );
//         }
//       } else if (movementType === 'SALE') {
//         throw new Error(
//           `Batch ${batchOrder.batch_lot_id} not found in van inventory`
//         );
//       }

//       // Update inventory stock
//       const inventoryStock = await tx.inventory_stock.findFirst({
//         where: {
//           product_id: product.id,
//           batch_id: batchOrder.batch_lot_id,
//         },
//       });

//       if (inventoryStock) {
//         await tx.inventory_stock.update({
//           where: { id: inventoryStock.id },
//           data: {
//             current_stock: inventoryStock.current_stock + quantityChange,
//             available_stock: inventoryStock.available_stock + quantityChange,
//             updatedate: new Date(),
//             updatedby: userId,
//           },
//         });
//       }

//       // Create stock movement
//       await tx.stock_movements.create({
//         data: {
//           product_id: product.id,
//           batch_id: batchOrder.batch_lot_id,
//           serial_id: null,
//           movement_type: movementType,
//           reference_type: 'ORDER',
//           reference_id: order.id,
//           from_location_id:
//             movementType === 'SALE' ? vanInventory?.location_id || null : null,
//           to_location_id:
//             movementType === 'RETURN'
//               ? vanInventory?.location_id || null
//               : null,
//           quantity: Math.abs(quantityChange),
//           movement_date: new Date(),
//           remarks: `${movementType === 'SALE' ? 'Sold via' : 'Returned from'} order ${order.order_number} - Batch: ${batchLot.batch_number}`,
//           is_active: 'Y',
//           createdate: new Date(),
//           createdby: userId,
//           log_inst: 1,
//           van_inventory_id: van_inventory_id ? Number(van_inventory_id) : null,
//         },
//       });
//     }
//   } else if (trackingType === 'SERIAL') {
//     const serialData = item.serials || item.product_serials;

//     if (!serialData || !Array.isArray(serialData) || serialData.length === 0) {
//       throw new Error(`Serial numbers required for "${product.name}"`);
//     }

//     for (const serialInput of serialData) {
//       const serialNumber =
//         typeof serialInput === 'string'
//           ? serialInput
//           : serialInput.serial_number;

//       if (!serialNumber) {
//         throw new Error('Serial number is required');
//       }

//       const serial = await tx.serial_numbers.findUnique({
//         where: { serial_number: serialNumber },
//       });

//       if (!serial) {
//         throw new Error(`Serial number ${serialNumber} not found`);
//       }

//       // Update serial status
//       await tx.serial_numbers.update({
//         where: { id: serial.id },
//         data: {
//           status: movementType === 'SALE' ? 'sold' : 'available',
//           customer_id: movementType === 'SALE' ? customer?.id || null : null,
//           sold_date: movementType === 'SALE' ? new Date() : null,
//           updatedate: new Date(),
//           updatedby: userId,
//         },
//       });

//       // Update inventory stock
//       const inventoryStock = await tx.inventory_stock.findFirst({
//         where: {
//           product_id: product.id,
//           serial_number_id: serial.id,
//         },
//       });

//       if (inventoryStock) {
//         const quantityChange = movementType === 'SALE' ? -1 : 1;
//         await tx.inventory_stock.update({
//           where: { id: inventoryStock.id },
//           data: {
//             current_stock: inventoryStock.current_stock + quantityChange,
//             available_stock: inventoryStock.available_stock + quantityChange,
//             updatedate: new Date(),
//             updatedby: userId,
//           },
//         });
//       }

//       // Update van inventory items
//       const vanItem = await tx.van_inventory_items.findFirst({
//         where: {
//           product_id: product.id,
//           serial_id: serial.id,
//           van_inventory_items_inventory: {
//             is_active: 'Y',
//           },
//         },
//       });

//       if (vanItem) {
//         const quantityChange = movementType === 'SALE' ? -1 : 1;
//         const newVanItemQuantity = vanItem.quantity + quantityChange;

//         if (newVanItemQuantity > 0) {
//           await tx.van_inventory_items.update({
//             where: { id: vanItem.id },
//             data: { quantity: newVanItemQuantity },
//           });
//         } else if (newVanItemQuantity === 0) {
//           await tx.van_inventory_items.delete({
//             where: { id: vanItem.id },
//           });
//         } else if (movementType === 'SALE') {
//           throw new Error(`Insufficient quantity for serial ${serialNumber}`);
//         }
//       } else if (movementType === 'SALE') {
//         throw new Error(`Serial ${serialNumber} not found in van inventory`);
//       }

//       // Create stock movement
//       await tx.stock_movements.create({
//         data: {
//           product_id: product.id,
//           batch_id: null,
//           serial_id: serial.id,
//           movement_type: movementType,
//           reference_type: 'ORDER',
//           reference_id: order.id,
//           from_location_id:
//             movementType === 'SALE' ? vanInventory?.location_id || null : null,
//           to_location_id:
//             movementType === 'RETURN'
//               ? vanInventory?.location_id || null
//               : null,
//           quantity: 1,
//           movement_date: new Date(),
//           remarks: `${movementType === 'SALE' ? 'Sold via' : 'Returned from'} order ${order.order_number} - Serial ${serialNumber}`,
//           is_active: 'Y',
//           createdate: new Date(),
//           createdby: userId,
//           log_inst: 1,
//           van_inventory_id: van_inventory_id ? Number(van_inventory_id) : null,
//         },
//       });
//     }
//   } else {
//     // NONE tracking type
//     if (vanInventory) {
//       const vanItem = vanInventory.van_inventory_items_inventory.find(
//         (vi: any) => vi.product_id === product.id
//       );

//       if (vanItem) {
//         const quantityChange = movementType === 'SALE' ? -quantity : quantity;
//         const newVanItemQuantity = vanItem.quantity + quantityChange;

//         if (newVanItemQuantity > 0) {
//           await tx.van_inventory_items.update({
//             where: { id: vanItem.id },
//             data: { quantity: newVanItemQuantity },
//           });
//         } else if (newVanItemQuantity === 0) {
//           await tx.van_inventory_items.delete({
//             where: { id: vanItem.id },
//           });
//         } else if (movementType === 'SALE') {
//           throw new Error(`Insufficient quantity in van for "${product.name}"`);
//         }
//       } else if (movementType === 'SALE') {
//         throw new Error(`Product "${product.name}" not found in van inventory`);
//       }
//     }

//     // Update inventory stock
//     const inventoryStock = await tx.inventory_stock.findFirst({
//       where: {
//         product_id: product.id,
//         batch_id: null,
//         serial_number_id: null,
//       },
//     });

//     if (inventoryStock) {
//       const quantityChange = movementType === 'SALE' ? -quantity : quantity;
//       await tx.inventory_stock.update({
//         where: { id: inventoryStock.id },
//         data: {
//           current_stock: inventoryStock.current_stock + quantityChange,
//           available_stock: inventoryStock.available_stock + quantityChange,
//           updatedate: new Date(),
//           updatedby: userId,
//         },
//       });
//     }

//     // Create stock movement
//     await tx.stock_movements.create({
//       data: {
//         product_id: product.id,
//         batch_id: null,
//         serial_id: null,
//         movement_type: movementType,
//         reference_type: 'ORDER',
//         reference_id: order.id,
//         from_location_id:
//           movementType === 'SALE' ? vanInventory?.location_id || null : null,
//         to_location_id:
//           movementType === 'RETURN' ? vanInventory?.location_id || null : null,
//         quantity: Math.abs(quantity),
//         movement_date: new Date(),
//         remarks: `${movementType === 'SALE' ? 'Sold via' : 'Returned from'} order ${order.order_number}`,
//         is_active: 'Y',
//         createdate: new Date(),
//         createdby: userId,
//         log_inst: 1,
//         van_inventory_id: van_inventory_id ? Number(van_inventory_id) : null,
//       },
//     });
//   }
// }

async function processInventoryChange(
  tx: any,
  params: {
    product: any;
    trackingType: string;
    quantity: number;
    item: any;
    order: any;
    van_inventory_id?: any;
    userId: number;
    customer: any;
    movementType: 'SALE' | 'RETURN';
    unit?: string;
    conversionFactor?: number;
  }
) {
  const {
    product,
    trackingType,
    quantity,
    item,
    order,
    van_inventory_id,
    userId,
    customer,
    movementType,
  } = params;

  const unit = (params.unit || item.unit || 'CASE').toUpperCase();

  const conversionFactor =
    params.conversionFactor ||
    Number(item.conversion_factor) ||
    Number(item.conversion_rate) ||
    1;

  console.log(`Processing ${movementType} for ${product.name}`, {
    unit,
    quantity,
    conversionFactor,
  });

  if (trackingType !== 'BATCH') {
    throw new Error('This optimized version handles only BATCH logic');
  }

  const batchData = item.batches || item.product_batches;

  if (!batchData || !Array.isArray(batchData) || batchData.length === 0) {
    throw new Error(`Batches are required for "${product.name}"`);
  }

  const seen = new Set<number>();
  const uniqueBatches = batchData.filter((b: any) => {
    if (seen.has(b.batch_lot_id)) return false;
    seen.add(b.batch_lot_id);
    return true;
  });

  for (const batch of uniqueBatches) {
    const batchQty = parseInt(batch.quantity, 10);

    const batchLot = await tx.batch_lots.findUnique({
      where: { id: batch.batch_lot_id },
    });

    if (!batchLot) {
      throw new Error(`Batch ${batch.batch_lot_id} not found`);
    }

    if (unit === 'PCS') {
      const updateAll = async (currentQty: number, currentBase: number) => {
        return calculateUnitConversion(
          currentQty,
          currentBase,
          conversionFactor,
          batchQty,
          'PCS',
          movementType
        );
      };

      const batchRes = await updateAll(
        Number(batchLot.remaining_quantity) || 0,
        Number(batchLot.base_quantity) || 0
      );

      await tx.batch_lots.update({
        where: { id: batch.batch_lot_id },
        data: {
          remaining_quantity: batchRes.newQuantity,
          base_quantity: batchRes.newBaseQuantity,
          updatedate: new Date(),
        },
      });

      const productBatch = await tx.product_batches.findFirst({
        where: {
          product_id: product.id,
          batch_lot_id: batch.batch_lot_id,
          is_active: 'Y',
        },
      });

      if (productBatch) {
        const pbRes = await updateAll(
          Number(productBatch.quantity) || 0,
          Number(productBatch.base_quantity) || 0
        );

        await tx.product_batches.update({
          where: { id: productBatch.id },
          data: {
            quantity: pbRes.newQuantity,
            base_quantity: pbRes.newBaseQuantity,
            updatedate: new Date(),
          },
        });
      }

      const vanItem = await tx.van_inventory_items.findFirst({
        where: {
          product_id: product.id,
          batch_lot_id: batch.batch_lot_id,
          van_inventory_items_inventory: { is_active: 'Y' },
        },
      });

      if (!vanItem && movementType === 'SALE') {
        throw new Error(
          `No van stock for ${product.name}, batch ${batch.batch_lot_id}`
        );
      }

      if (vanItem) {
        const vanRes = await updateAll(
          Number(vanItem.quantity) || 0,
          Number(vanItem.base_quantity) || 0
        );

        if (vanRes.newQuantity === 0 && vanRes.newBaseQuantity === 0) {
          await tx.van_inventory_items.delete({
            where: { id: vanItem.id },
          });
        } else {
          await tx.van_inventory_items.update({
            where: { id: vanItem.id },
            data: {
              quantity: vanRes.newQuantity,
              base_quantity: vanRes.newBaseQuantity,
            },
          });
        }

        console.log(
          ` VAN PCS → cases=${vanRes.newQuantity}, pcs=${vanRes.newBaseQuantity}`
        );
      }

      const stock = await tx.inventory_stock.findFirst({
        where: {
          product_id: product.id,
          batch_id: batch.batch_lot_id,
        },
      });

      if (stock) {
        const stockRes = await updateAll(
          Number(stock.current_stock) || 0,
          Number(stock.base_quantity) || 0
        );

        await tx.inventory_stock.update({
          where: { id: stock.id },
          data: {
            current_stock: stockRes.newQuantity,
            available_stock: stockRes.newQuantity,
            base_quantity: stockRes.newBaseQuantity,
            updatedate: new Date(),
            updatedby: userId,
          },
        });
      }
    } else {
      const change = movementType === 'SALE' ? -batchQty : batchQty;

      await tx.batch_lots.update({
        where: { id: batch.batch_lot_id },
        data: {
          remaining_quantity: Number(batchLot.remaining_quantity) + change,
        },
      });

      const productBatch = await tx.product_batches.findFirst({
        where: {
          product_id: product.id,
          batch_lot_id: batch.batch_lot_id,
          is_active: 'Y',
        },
      });

      if (productBatch) {
        await tx.product_batches.update({
          where: { id: productBatch.id },
          data: {
            quantity: Number(productBatch.quantity) + change,
          },
        });
      }

      const vanItem = await tx.van_inventory_items.findFirst({
        where: {
          product_id: product.id,
          batch_lot_id: batch.batch_lot_id,
          van_inventory_items_inventory: { is_active: 'Y' },
        },
      });

      if (!vanItem && movementType === 'SALE') {
        throw new Error(`No van stock for ${product.name}`);
      }

      if (vanItem) {
        const newQty = Number(vanItem.quantity) + change;

        if (newQty === 0) {
          await tx.van_inventory_items.delete({
            where: { id: vanItem.id },
          });
        } else if (newQty > 0) {
          await tx.van_inventory_items.update({
            where: { id: vanItem.id },
            data: { quantity: newQty },
          });
        } else {
          throw new Error(`Insufficient van stock`);
        }

        console.log(`VAN CASE → cases=${newQty}`);
      }

      const stock = await tx.inventory_stock.findFirst({
        where: {
          product_id: product.id,
          batch_id: batch.batch_lot_id,
        },
      });

      if (stock) {
        await tx.inventory_stock.update({
          where: { id: stock.id },
          data: {
            current_stock: Number(stock.current_stock) + change,
            available_stock: Number(stock.available_stock) + change,
          },
        });
      }
    }

    await tx.stock_movements.create({
      data: {
        product_id: product.id,
        batch_id: batch.batch_lot_id,
        movement_type: movementType,
        reference_type: 'ORDER',
        reference_id: order.id,
        quantity: batchQty,
        movement_date: new Date(),
        remarks: `${movementType} ${batchQty} ${unit}`,
        createdby: userId,
        createdate: new Date(),
        is_active: 'Y',
        van_inventory_id: van_inventory_id ? Number(van_inventory_id) : null,
      },
    });
  }
}
export const ordersController = {
  // 1. Old updation logic
  // async createOrUpdateOrder(req: Request, res: Response) {
  //   const data = req.body;
  //   const userId = req.user?.id || 1;

  //   try {
  //     const {
  //       orderItems,
  //       order_items,
  //       selected_promotion_id,
  //       van_inventory_id,
  //       ...orderData
  //     } = data;
  //     const items = orderItems || order_items || [];
  //     let orderId = orderData.id;

  //     console.log(' Processing order with items:', {
  //       orderId,
  //       orderNumber: orderData.order_number,
  //       itemsCount: items.length,
  //       selected_promotion_id: selected_promotion_id || 'None',
  //       van_inventory_id: van_inventory_id || 'None',
  //     });

  //     let vanInventory = null;
  //     if (van_inventory_id) {
  //       vanInventory = await prisma.van_inventory.findUnique({
  //         where: { id: Number(van_inventory_id) },
  //         include: {
  //           van_inventory_items_inventory: {
  //             include: {
  //               van_inventory_items_products: true,
  //               van_inventory_items_batch_lot: true,
  //             },
  //           },
  //         },
  //       });

  //       if (!vanInventory) {
  //         return res.status(404).json({
  //           success: false,
  //           message: 'Van inventory not found',
  //         });
  //       }
  //     }

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

  //         console.log(' Promotion applied:', appliedPromotion.promotion_name);
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
  //           pricelist_id: orderData.pricelist_id
  //             ? Number(orderData.pricelist_id)
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

  //           for (const item of items) {
  //             const product = await tx.products.findUnique({
  //               where: { id: Number(item.product_id) },
  //             });

  //             console.log('Product', product);
  //             console.log('items', item.unit);
  //             if (!product) {
  //               throw new Error(`Product ${item.product_id} not found`);
  //             }

  //             const trackingType =
  //               product.tracking_type?.toUpperCase() || 'NONE';
  //             const quantity = parseInt(item.quantity, 10);

  //             if (trackingType === 'BATCH') {
  //               console.log('Going to BATCH branch');

  //               const batchData = item.batches || item.product_batches;

  //               if (!batchData || !Array.isArray(batchData)) {
  //                 throw new Error(
  //                   `Batches are required for product "${product.name}"`
  //                 );
  //               }

  //               let totalOrderedQty = 0;
  //               for (const batchOrder of batchData) {
  //                 const batchQty = parseInt(batchOrder.quantity, 10);
  //                 totalOrderedQty += batchQty;

  //                 const batchLot = await tx.batch_lots.findUnique({
  //                   where: { id: batchOrder.batch_lot_id },
  //                 });

  //                 if (!batchLot) {
  //                   throw new Error(
  //                     `Batch lot ${batchOrder.batch_lot_id} not found`
  //                   );
  //                 }

  //                 const vanItem = await tx.van_inventory_items.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     batch_lot_id: batchOrder.batch_lot_id,
  //                     van_inventory_items_inventory: {
  //                       is_active: 'Y',
  //                     },
  //                   },
  //                   include: {
  //                     van_inventory_items_inventory: true,
  //                   },
  //                 });

  //                 if (!vanItem) {
  //                   throw new Error(
  //                     `Batch ${batchOrder.batch_lot_id} not found in any van inventory for product "${product.name}"`
  //                   );
  //                 }

  //                 if (vanItem.quantity < batchQty) {
  //                   throw new Error(
  //                     `Insufficient quantity in van for batch. Available: ${vanItem.quantity}, Requested: ${batchQty}`
  //                   );
  //                 }

  //                 const newVanItemQuantity = vanItem.quantity - batchQty;
  //                 if (newVanItemQuantity > 0) {
  //                   await tx.van_inventory_items.update({
  //                     where: { id: vanItem.id },
  //                     data: { quantity: newVanItemQuantity },
  //                   });
  //                   console.log(
  //                     ` Updated van_inventory_items for batch ${batchLot.batch_number}: ${vanItem.quantity}→${newVanItemQuantity}`
  //                   );
  //                 } else {
  //                   await tx.van_inventory_items.delete({
  //                     where: { id: vanItem.id },
  //                   });
  //                   console.log(
  //                     ` Deleted van_inventory_items for batch ${batchLot.batch_number} (quantity reached zero)`
  //                   );
  //                 }

  //                 if (batchLot.remaining_quantity < batchQty) {
  //                   throw new Error(
  //                     `Insufficient quantity in batch lot. Available: ${batchLot.remaining_quantity}, Requested: ${batchQty}`
  //                   );
  //                 }

  //                 await tx.batch_lots.update({
  //                   where: { id: batchOrder.batch_lot_id },
  //                   data: {
  //                     remaining_quantity:
  //                       batchLot.remaining_quantity - batchQty,
  //                     updatedate: new Date(),
  //                   },
  //                 });

  //                 const productBatch = await tx.product_batches.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     batch_lot_id: batchOrder.batch_lot_id,
  //                     is_active: 'Y',
  //                   },
  //                 });

  //                 if (productBatch) {
  //                   if (productBatch.quantity < batchQty) {
  //                     throw new Error(
  //                       `Insufficient quantity in product batch. Available: ${productBatch.quantity}, Requested: ${batchQty}`
  //                     );
  //                   }

  //                   await tx.product_batches.update({
  //                     where: { id: productBatch.id },
  //                     data: {
  //                       quantity: productBatch.quantity - batchQty,
  //                       updatedate: new Date(),
  //                     },
  //                   });
  //                 }

  //                 const inventoryStock = await tx.inventory_stock.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     batch_id: batchOrder.batch_lot_id,
  //                   },
  //                 });

  //                 if (inventoryStock) {
  //                   const currentStock = inventoryStock.current_stock ?? 0;
  //                   const availableStock = inventoryStock.available_stock ?? 0;
  //                   const baseQuantity = inventoryStock.base_quantity ?? 0;

  //                   if (currentStock < batchQty) {
  //                     throw new Error(
  //                       `Insufficient inventory stock for batch. Available: ${currentStock}, Requested: ${batchQty}`
  //                     );
  //                   }

  //                   await tx.inventory_stock.update({
  //                     where: { id: inventoryStock.id },
  //                     data: {
  //                       current_stock: currentStock - batchQty,
  //                       available_stock: availableStock - batchQty,
  //                       updatedate: new Date(),
  //                       updatedby: userId,
  //                     },
  //                   });
  //                 } else {
  //                   throw new Error(
  //                     `Inventory stock not found for product ${product.name} and batch ${batchOrder.batch_lot_id}`
  //                   );
  //                 }

  //                 await tx.stock_movements.create({
  //                   data: {
  //                     product_id: product.id,
  //                     batch_id: batchOrder.batch_lot_id,
  //                     serial_id: null,
  //                     movement_type: 'SALE',
  //                     reference_type: 'ORDER',
  //                     reference_id: order.id,
  //                     from_location_id: vanInventory?.location_id || null,
  //                     to_location_id: null,
  //                     quantity: batchQty,
  //                     movement_date: new Date(),
  //                     remarks: `Sold via order ${order.order_number} - Batch: ${batchLot.batch_number}`,
  //                     is_active: 'Y',
  //                     createdate: new Date(),
  //                     createdby: userId,
  //                     log_inst: 1,
  //                     van_inventory_id: van_inventory_id
  //                       ? Number(van_inventory_id)
  //                       : null,
  //                   },
  //                 });

  //                 console.log(
  //                   ` Deducted ${batchQty} from batch ${batchLot.batch_number}`
  //                 );
  //               }

  //               if (totalOrderedQty !== quantity) {
  //                 throw new Error(
  //                   `Total batch quantity (${totalOrderedQty}) does not match ordered quantity (${quantity})`
  //                 );
  //               }

  //               await tx.order_items.create({
  //                 data: {
  //                   parent_id: order.id,
  //                   product_id: product.id,
  //                   product_name: product.name,
  //                   unit: item.unit || 'CASE',
  //                   quantity: totalOrderedQty,
  //                   unit_price: Number(item.unit_price || item.price) || 0,
  //                   discount_amount: Number(item.discount_amount) || 0,
  //                   tax_amount: Number(item.tax_amount) || 0,
  //                   total_amount:
  //                     totalOrderedQty *
  //                     (Number(item.unit_price || item.price) || 0),
  //                   notes: `Batches: ${batchData.map((b: any) => b.batch_lot_id).join(', ')}`,
  //                   is_free_gift: false,
  //                 },
  //               });
  //             } else if (trackingType === 'SERIAL') {
  //               console.log(' Going to SERIAL branch');
  //               const serialData = item.serials || item.product_serials;
  //               if (
  //                 !serialData ||
  //                 !Array.isArray(serialData) ||
  //                 serialData.length === 0
  //               ) {
  //                 throw new Error(
  //                   `Serial numbers required for "${product.name}"`
  //                 );
  //               }

  //               for (const serialInput of serialData) {
  //                 const serialNumber =
  //                   typeof serialInput === 'string'
  //                     ? serialInput
  //                     : serialInput.serial_number;

  //                 if (!serialNumber) {
  //                   throw new Error('Serial number is required');
  //                 }

  //                 const serial = await tx.serial_numbers.findUnique({
  //                   where: { serial_number: serialNumber },
  //                 });

  //                 if (!serial) {
  //                   throw new Error(`Serial number ${serialNumber} not found`);
  //                 }

  //                 await tx.serial_numbers.update({
  //                   where: { id: serial.id },
  //                   data: {
  //                     status: 'sold',
  //                     customer_id: customer?.id || null,
  //                     sold_date: new Date(),
  //                     updatedate: new Date(),
  //                     updatedby: userId,
  //                   },
  //                 });
  //                 console.log(` Serial ${serialNumber} marked as SOLD`);

  //                 const inventoryStock = await tx.inventory_stock.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     serial_number_id: serial.id,
  //                   },
  //                 });

  //                 if (inventoryStock) {
  //                   const oldCurrent = inventoryStock.current_stock || 0;
  //                   const oldAvailable = inventoryStock.available_stock || 0;
  //                   const newCurrentStock = Math.max(0, oldCurrent - 1);
  //                   const newAvailableStock = Math.max(0, oldAvailable - 1);

  //                   await tx.inventory_stock.update({
  //                     where: { id: inventoryStock.id },
  //                     data: {
  //                       current_stock: newCurrentStock,
  //                       available_stock: newAvailableStock,
  //                       updatedate: new Date(),
  //                       updatedby: userId,
  //                     },
  //                   });
  //                   console.log(
  //                     ` DECREASED inventory_stock for ${serialNumber}: current ${oldCurrent}→${newCurrentStock}, available ${oldAvailable}→${newAvailableStock}`
  //                   );
  //                 } else {
  //                   console.warn(
  //                     ` No inventory_stock found for serial ${serialNumber}`
  //                   );
  //                 }

  //                 const vanItem = await tx.van_inventory_items.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     serial_id: serial.id,
  //                     van_inventory_items_inventory: {
  //                       is_active: 'Y',
  //                     },
  //                   },
  //                   include: {
  //                     van_inventory_items_inventory: true,
  //                   },
  //                 });

  //                 if (vanItem && vanItem.quantity > 0) {
  //                   const newVanItemQuantity = vanItem.quantity - 1;
  //                   if (newVanItemQuantity > 0) {
  //                     await tx.van_inventory_items.update({
  //                       where: { id: vanItem.id },
  //                       data: { quantity: newVanItemQuantity },
  //                     });
  //                     console.log(
  //                       ` DECREASED van_inventory_items for ${serialNumber}: ${vanItem.quantity}→${newVanItemQuantity}`
  //                     );
  //                   } else {
  //                     await tx.van_inventory_items.delete({
  //                       where: { id: vanItem.id },
  //                     });
  //                     console.log(
  //                       ` DELETED van_inventory_items for ${serialNumber} (quantity reached zero)`
  //                     );
  //                   }
  //                 }

  //                 await tx.stock_movements.create({
  //                   data: {
  //                     product_id: product.id,
  //                     batch_id: null,
  //                     serial_id: serial.id,
  //                     movement_type: 'SALE',
  //                     reference_type: 'ORDER',
  //                     reference_id: order.id,
  //                     from_location_id: vanInventory?.location_id || null,
  //                     to_location_id: null,
  //                     quantity: 1,
  //                     movement_date: new Date(),
  //                     remarks: `Sold via order ${order.order_number} - Serial ${serialNumber}`,
  //                     is_active: 'Y',
  //                     createdate: new Date(),
  //                     createdby: userId,
  //                     log_inst: 1,
  //                     van_inventory_id: van_inventory_id
  //                       ? Number(van_inventory_id)
  //                       : null,
  //                   },
  //                 });
  //                 console.log(
  //                   ` SALE stock_movement created for ${serialNumber}`
  //                 );
  //               }

  //               await tx.order_items.create({
  //                 data: {
  //                   parent_id: order.id,
  //                   product_id: product.id,
  //                   product_name: product.name,
  //                   unit: 'PIECE',
  //                   quantity: serialData.length,
  //                   unit_price: Number(item.unit_price || item.price) || 0,
  //                   discount_amount: Number(item.discount_amount || 0),
  //                   tax_amount: Number(item.tax_amount || 0),
  //                   total_amount:
  //                     serialData.length *
  //                     (Number(item.unit_price || item.price) || 0),
  //                   notes: `Serials: ${serialData.map((s: any) => (typeof s === 'string' ? s : s.serial_number)).join(', ')}`,
  //                   is_free_gift: false,
  //                 },
  //               });
  //               console.log(
  //                 `Order item created for ${serialData.length} serials`
  //               );
  //             } else {
  //               console.log(' Going to NONE branch');

  //               if (vanInventory) {
  //                 const vanItem =
  //                   vanInventory.van_inventory_items_inventory.find(
  //                     vi => vi.product_id === product.id
  //                   );

  //                 if (!vanItem) {
  //                   throw new Error(
  //                     `Product "${product.name}" not found in van inventory`
  //                   );
  //                 }

  //                 if (vanItem.quantity < quantity) {
  //                   throw new Error(
  //                     `Insufficient quantity in van for "${product.name}". Available: ${vanItem.quantity}, Requested: ${quantity}`
  //                   );
  //                 }

  //                 // Update van inventory item quantity
  //                 const newVanItemQuantity = vanItem.quantity - quantity;
  //                 if (newVanItemQuantity > 0) {
  //                   await tx.van_inventory_items.update({
  //                     where: { id: vanItem.id },
  //                     data: { quantity: newVanItemQuantity },
  //                   });
  //                   console.log(
  //                     ` Updated van_inventory_items for ${product.name}: ${vanItem.quantity}→${newVanItemQuantity}`
  //                   );
  //                 } else {
  //                   // Delete van inventory item if quantity becomes zero
  //                   await tx.van_inventory_items.delete({
  //                     where: { id: vanItem.id },
  //                   });
  //                   console.log(
  //                     ` Deleted van_inventory_items for ${product.name} (quantity reached zero)`
  //                   );
  //                 }
  //               }

  //               const inventoryStock = await tx.inventory_stock.findFirst({
  //                 where: {
  //                   product_id: product.id,
  //                   batch_id: null,
  //                   serial_number_id: null,
  //                 },
  //               });

  //               if (inventoryStock) {
  //                 const newCurrentStock = Math.max(
  //                   0,
  //                   (inventoryStock.current_stock || 0) - 1
  //                 );
  //                 const newAvailableStock = Math.max(
  //                   0,
  //                   (inventoryStock.available_stock || 0) - 1
  //                 );

  //                 await tx.inventory_stock.update({
  //                   where: { id: inventoryStock.id },
  //                   data: {
  //                     current_stock: newCurrentStock,
  //                     available_stock: newAvailableStock,
  //                     updatedate: new Date(),
  //                     updatedby: userId,
  //                   },
  //                 });
  //               } else {
  //                 throw new Error(
  //                   `Inventory stock not found for product ${product.name}`
  //                 );
  //               }

  //               await tx.stock_movements.create({
  //                 data: {
  //                   product_id: product.id,
  //                   batch_id: null,
  //                   serial_id: null,
  //                   movement_type: 'SALE',
  //                   reference_type: 'ORDER',
  //                   reference_id: order.id,
  //                   from_location_id: vanInventory?.location_id || null,
  //                   to_location_id: null,
  //                   quantity: quantity,
  //                   movement_date: new Date(),
  //                   remarks: `Sold via order ${order.order_number}`,
  //                   is_active: 'Y',
  //                   createdate: new Date(),
  //                   createdby: userId,
  //                   log_inst: 1,
  //                   van_inventory_id: van_inventory_id
  //                     ? Number(van_inventory_id)
  //                     : null,
  //                 },
  //               });

  //               await tx.order_items.create({
  //                 data: {
  //                   parent_id: order.id,
  //                   product_id: product.id,
  //                   product_name: product.name,
  //                   unit: item.unit || 'CASE',
  //                   quantity: quantity,
  //                   unit_price: Number(item.unit_price || item.price) || 0,
  //                   discount_amount: Number(item.discount_amount) || 0,
  //                   tax_amount: Number(item.tax_amount) || 0,
  //                   total_amount:
  //                     quantity * (Number(item.unit_price || item.price) || 0),
  //                   notes: item.notes || null,
  //                   is_free_gift: false,
  //                 },
  //               });
  //             }
  //           }

  //           if (freeProducts.length > 0) {
  //             for (const freeProduct of freeProducts) {
  //               await tx.order_items.create({
  //                 data: {
  //                   parent_id: order.id,
  //                   product_id: freeProduct.product_id,
  //                   product_name: freeProduct.product_name || null,
  //                   unit: freeProduct.unit || 'CASE',
  //                   quantity: freeProduct.quantity,
  //                   unit_price: 0,
  //                   discount_amount: 0,
  //                   tax_amount: 0,
  //                   total_amount: 0,
  //                   notes: `Free gift from promotion: ${appliedPromotion?.promotion_name}`,
  //                   is_free_gift: true,
  //                 },
  //               });
  //             }
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

  //         // Check if approval workflow exists before creating request
  //         const salesperson = await prisma.users.findUnique({
  //           where: { id: result.salesperson_id },
  //           select: {
  //             id: true,
  //             zone_id: true,
  //             depot_id: true,
  //           },
  //         });

  //         if (salesperson) {
  //           let workflowSteps = null;

  //           // Check for workflow in the same order as createRequest function
  //           if (salesperson.zone_id && salesperson.depot_id) {
  //             workflowSteps = await prisma.approval_work_flow.findMany({
  //               where: {
  //                 request_type: 'ORDER_APPROVAL',
  //                 zone_id: salesperson.zone_id,
  //                 depot_id: salesperson.depot_id,
  //                 is_active: 'Y',
  //               },
  //             });
  //           }

  //           if (
  //             (!workflowSteps || workflowSteps.length === 0) &&
  //             salesperson.zone_id
  //           ) {
  //             workflowSteps = await prisma.approval_work_flow.findMany({
  //               where: {
  //                 request_type: 'ORDER_APPROVAL',
  //                 zone_id: salesperson.zone_id,
  //                 depot_id: null,
  //                 is_active: 'Y',
  //               },
  //             });
  //           }

  //           if (
  //             (!workflowSteps || workflowSteps.length === 0) &&
  //             salesperson.depot_id
  //           ) {
  //             workflowSteps = await prisma.approval_work_flow.findMany({
  //               where: {
  //                 request_type: 'ORDER_APPROVAL',
  //                 depot_id: salesperson.depot_id,
  //                 zone_id: null,
  //                 is_active: 'Y',
  //               },
  //             });
  //           }

  //           if (!workflowSteps || workflowSteps.length === 0) {
  //             workflowSteps = await prisma.approval_work_flow.findMany({
  //               where: {
  //                 request_type: 'ORDER_APPROVAL',
  //                 zone_id: null,
  //                 depot_id: null,
  //                 is_active: 'Y',
  //               },
  //             });
  //           }

  //           // Only create approval request if workflow exists
  //           if (workflowSteps && workflowSteps.length > 0) {
  //             await createRequest({
  //               requester_id: result.salesperson_id,
  //               request_type: 'ORDER_APPROVAL',
  //               reference_id: result.id,
  //               createdby: userId,
  //               log_inst: 1,
  //             });
  //             console.log('Approval request created - workflow found');
  //           } else {
  //             console.log(
  //               'No approval workflow found - order processed without approval'
  //             );
  //           }
  //         }
  //       } catch (error: any) {
  //         console.error('Error checking approval workflow:', error);
  //       }
  //     }
  //     const response = {
  //       success: true,
  //       message: orderId
  //         ? 'Order updated successfully'
  //         : 'Order created successfully',
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

  async createOrUpdateOrder(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      const {
        orderItems,
        order_items,
        selected_promotion_id,
        van_inventory_id,
        ...orderData
      } = data;
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
        vanInventory = await prisma.van_inventory.findUnique({
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

          console.log(' Promotion applied:', appliedPromotion.promotion_name);
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
            pricelist_id: orderData.pricelist_id
              ? Number(orderData.pricelist_id)
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
            // DELTA UPDATE: Compare original vs new items
            let originalOrderItems: any[] = [];

            if (isUpdate && orderId) {
              originalOrderItems = await tx.order_items.findMany({
                where: { parent_id: orderId },
                include: {
                  products: true,
                },
              });
            }

            // Process items based on tracking type
            await processOrderItems(tx, {
              items,
              originalOrderItems,
              order,
              vanInventory,
              van_inventory_id,
              userId,
              isUpdate,
              customer,
            });

            // Add free products from promotion
            if (freeProducts.length > 0) {
              for (const freeProduct of freeProducts) {
                await tx.order_items.create({
                  data: {
                    parent_id: order.id,
                    product_id: freeProduct.product_id,
                    product_name: freeProduct.product_name || null,
                    unit: freeProduct.unit || 'CASE',
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
        },
        {
          maxWait: 200000000,
          timeout: 200000000,
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

          // Check if approval workflow exists before creating request
          const salesperson = await prisma.users.findUnique({
            where: { id: result.salesperson_id },
            select: {
              id: true,
              zone_id: true,
              depot_id: true,
            },
          });

          if (salesperson) {
            let workflowSteps = null;

            // Check for workflow in the same order as createRequest function
            if (salesperson.zone_id && salesperson.depot_id) {
              workflowSteps = await prisma.approval_work_flow.findMany({
                where: {
                  request_type: 'ORDER_APPROVAL',
                  zone_id: salesperson.zone_id,
                  depot_id: salesperson.depot_id,
                  is_active: 'Y',
                },
              });
            }

            if (
              (!workflowSteps || workflowSteps.length === 0) &&
              salesperson.zone_id
            ) {
              workflowSteps = await prisma.approval_work_flow.findMany({
                where: {
                  request_type: 'ORDER_APPROVAL',
                  zone_id: salesperson.zone_id,
                  depot_id: null,
                  is_active: 'Y',
                },
              });
            }

            if (
              (!workflowSteps || workflowSteps.length === 0) &&
              salesperson.depot_id
            ) {
              workflowSteps = await prisma.approval_work_flow.findMany({
                where: {
                  request_type: 'ORDER_APPROVAL',
                  depot_id: salesperson.depot_id,
                  zone_id: null,
                  is_active: 'Y',
                },
              });
            }

            if (!workflowSteps || workflowSteps.length === 0) {
              workflowSteps = await prisma.approval_work_flow.findMany({
                where: {
                  request_type: 'ORDER_APPROVAL',
                  zone_id: null,
                  depot_id: null,
                  is_active: 'Y',
                },
              });
            }

            // Only create approval request if workflow exists
            if (workflowSteps && workflowSteps.length > 0) {
              await createRequest({
                requester_id: result.salesperson_id,
                request_type: 'ORDER_APPROVAL',
                reference_id: result.id,
                createdby: userId,
                log_inst: 1,
              });
              console.log('Approval request created - workflow found');
            } else {
              console.log(
                'No approval workflow found - order processed without approval'
              );
            }
          }
        } catch (error: any) {
          console.error('Error checking approval workflow:', error);
        }
      }
      const response = {
        success: true,
        message: orderId
          ? 'Order updated successfully'
          : 'Order created successfully',
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

  async approveOrRejectOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action, comments, approvedby } = req.body;
      const userId = req.user?.id || 1;

      if (!['A', 'R'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "approved" or "rejected"',
        });
      }

      const order = await prisma.orders.findUnique({
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

      if (
        order.approval_status !== 'P' &&
        order.approval_status !== 'submitted'
      ) {
        return res.status(400).json({
          success: false,
          message: `Order is already ${order.approval_status}`,
        });
      }

      const updatedOrder = await prisma.orders.update({
        where: { id: Number(id) },
        data: {
          approval_status: action,
          approved_by: approvedby || userId,
          approved_at: new Date(),
          status: action === 'A' ? 'C' : 'D',
          updatedate: new Date(),
          updatedby: userId,
          log_inst: { increment: 1 },
          notes: comments
            ? `${order.notes || ''}\n\nApproval Comments: ${comments}`
            : order.notes,
        },
        include: {
          orders_currencies: true,
          orders_customers: {
            include: {
              customer_routes: true,
            },
          },
          orders_salesperson_users: true,
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  tracking_type: true,
                },
              },
            },
          },
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

      const workflow = await prisma.approval_workflows.findFirst({
        where: {
          reference_type: 'order',
          reference_number: order.order_number,
          status: { in: ['P'] },
        },
      });

      if (workflow) {
        await prisma.approval_workflows.update({
          where: { id: workflow.id },
          data: {
            status: action === 'A' ? 'C' : 'D',
            final_approved_by:
              action === 'A' ? approvedby || userId : undefined,
            final_approved_at: action === 'A' ? new Date() : undefined,
            rejected_by: action === 'R' ? approvedby || userId : undefined,
            rejected_at: action === 'R' ? new Date() : undefined,
            rejection_reason: action === 'R' ? comments : undefined,
            updatedate: new Date(),
            updatedby: userId,
          },
        });

        await prisma.workflow_steps.updateMany({
          where: {
            workflow_id: workflow.id,
            status: 'P',
          },
          data: {
            status: action === 'A' ? 'A' : 'R',
            updatedate: new Date(),
          },
        });
      }

      try {
        await createOrderNotification(
          order.createdby,
          order.id,
          order.order_number,
          action,
          userId
        );

        if (order.salesperson_id && order.salesperson_id !== order.createdby) {
          await createOrderNotification(
            order.salesperson_id,
            order.id,
            order.order_number,
            action,
            userId
          );
        }
      } catch (notificationError) {
        console.error(
          'Error sending approval notification:',
          notificationError
        );
      }

      return res.json({
        success: true,
        message: `Order ${action === 'A' ? 'A' : 'R'} successfully`,
        data: (() => {
          const serialized = serializeOrder(updatedOrder);

          if (updatedOrder.promotion_id && updatedOrder.orders_promotion) {
            serialized.promotion_applied = {
              promotion_id: updatedOrder.orders_promotion.id,
              promotion_name: updatedOrder.orders_promotion.name,
              promotion_code: updatedOrder.orders_promotion.code,
              discount_amount: updatedOrder.discount_amount
                ? Number(updatedOrder.discount_amount)
                : 0,
              free_products:
                updatedOrder.order_items
                  ?.filter((item: any) => item.is_free_gift === true)
                  .map((item: any) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                  })) || [],
            };
          }

          return serialized;
        })(),
      });
    } catch (error: any) {
      console.error('Approve/Reject Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process order approval',
        error: error.message,
      });
    }
  },

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
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  tracking_type: true,
                },
              },
            },
          },
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
          orders_customers: {
            include: {
              customer_routes: true,
            },
          },
          orders_salesperson_users: true,
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  tracking_type: true,
                },
              },
            },
          },
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

      if (!order) return res.status(404).json({ message: 'Order not found' });

      const stockMovements = await prisma.stock_movements.findMany({
        where: {
          reference_type: 'ORDER',
          reference_id: order.id,
        },
        include: {
          batch_lots: true,
          serial_numbers: true,
        },
      });

      if (stockMovements.length > 0 && order.order_items) {
        order.order_items = order.order_items.map((item: any) => {
          const itemMovements = stockMovements.filter(
            (sm: any) => sm.product_id === item.product_id
          );

          const batches = itemMovements
            .filter((sm: any) => sm.batch_id != null && sm.batch_lots)
            .map((sm: any) => ({
              batch_lot_id: sm.batch_id,
              batch_number: sm.batch_lots.batch_number,
              lot_number: sm.batch_lots.lot_number,
              manufacturing_date: sm.batch_lots.manufacturing_date,
              expiry_date: sm.batch_lots.expiry_date,
              quantity: sm.quantity,
              batch_remaining_quantity: sm.batch_lots.remaining_quantity,
            }));

          const serials = itemMovements
            .filter((sm: any) => sm.serial_id != null && sm.serial_numbers)
            .map((sm: any) => ({
              id: sm.serial_id,
              serial_number: sm.serial_numbers.serial_number,
              selected: true,
            }));

          return {
            ...item,
            product_batches: batches.length > 0 ? batches : undefined,
            product_serials: serials.length > 0 ? serials : undefined,
          };
        }) as any;
      }

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

      res.json({
        message: 'Order fetched successfully',
        data: serialized,
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
            pricelist_id: orderData.pricelist_id
              ? Number(orderData.pricelist_id)
              : null,
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
              const unitPrice =
                parseFloat(item.unit_price || item.price || '0') || 0;
              const quantity = parseInt(item.quantity) || 1;
              const discountAmount =
                parseFloat(item.discount_amount || '0') || 0;
              const taxAmount = parseFloat(item.tax_amount || '0') || 0;
              const totalAmount = item.total_amount
                ? parseFloat(item.total_amount) || 0
                : unitPrice * quantity - discountAmount + taxAmount;

              return {
                parent_id: order.id,
                product_id: item.product_id,
                product_name: item.product_name || null,
                unit: item.unit || 'CASE',
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
              orders_customers: {
                include: {
                  customer_routes: true,
                },
              },
              orders_salesperson_users: true,
              order_items: {
                include: {
                  products: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      tracking_type: true,
                    },
                  },
                },
              },
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
        data: (() => {
          const serialized = serializeOrder(result);

          if (result?.promotion_id && result?.orders_promotion) {
            serialized.promotion_applied = {
              promotion_id: result.orders_promotion.id,
              promotion_name: result.orders_promotion.name,
              promotion_code: result.orders_promotion.code,
              discount_amount: result.discount_amount
                ? Number(result.discount_amount)
                : 0,
              free_products:
                result.order_items
                  ?.filter((item: any) => item.is_free_gift === true)
                  .map((item: any) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                  })) || [],
            };
          }

          return serialized;
        })(),
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
