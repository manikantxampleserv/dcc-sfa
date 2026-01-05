// async createOrUpdateOrder(req: Request, res: Response) {
//   const data = req.body;
//   const userId = (req as any).user?.id || 1;

//   try {
//     const { order_items, orderitems, selected_promotion_id, ...orderData } = data;
//     const items = order_items || orderitems;
//     let orderId = orderData.id;

//     console.log('Processing order:', {
//       orderId,
//       itemsCount: items.length,
//     });

//     // Calculate subtotal
//     let calculatedSubtotal = new Prisma.Decimal(0);
//     for (const item of items) {
//       const itemTotal = new Prisma.Decimal(item.quantity).mul(
//         new Prisma.Decimal(item.price || item.unit_price || 0)
//       );
//       calculatedSubtotal = calculatedSubtotal.add(itemTotal);
//     }

//     const customer = await prisma.customers.findUnique({
//       where: { id: orderData.parent_id },
//       select: { id: true, type: true, route_id: true },
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found',
//       });
//     }

//     // ... (promotion logic remains same) ...

//     const subtotal = calculatedSubtotal;
//     const discountamount = new Prisma.Decimal(0);
//     const taxamount = new Prisma.Decimal(orderData.tax_amount || 0);
//     const shippingamount = new Prisma.Decimal(orderData.shipping_amount || 0);
//     const totalamount = subtotal.minus(discountamount).plus(taxamount).plus(shippingamount);

//     const result = await prisma.$transaction(
//       async (tx) => {
//         let order;
//         let isUpdate = false;

//         // Create/Update order
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
//           order_date: orderData.order_date ? new Date(orderData.order_date) : undefined,
//           delivery_date: orderData.delivery_date ? new Date(orderData.delivery_date) : undefined,
//           status: orderData.status || 'draft',
//           priority: orderData.priority || 'medium',
//           order_type: orderData.order_type || 'regular',
//           payment_method: orderData.payment_method || 'credit',
//           payment_terms: orderData.payment_terms || 'Net 30',
//           subtotal: subtotal.toNumber(),
//           discount_amount: discountamount.toNumber(),
//           tax_amount: taxamount.toNumber(),
//           shipping_amount: shippingamount.toNumber(),
//           total_amount: totalamount.toNumber(),
//           notes: orderData.notes || null,
//           shipping_address: orderData.shipping_address || null,
//           approval_status: orderData.approval_status || 'pending',
//           is_active: orderData.is_active || 'Y',
//           promotion_id: null,
//         };

//         if (isUpdate && orderId) {
//           const updatePayload: any = { ...orderPayload };
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

//         // Delete existing order items if updating
//         if (isUpdate && orderId) {
//           await tx.order_items.deleteMany({
//             where: { parent_id: orderId },
//           });
//         }

//         // ✅ Process order items
//         if (items && items.length > 0) {
//           for (const item of items) {
//             const itemProductId = Number(item.product_id);
//             let quantity = parseInt(item.quantity, 10);

//             console.log(`\n🔍 Processing item: product_id=${itemProductId}, quantity=${quantity}`);

//             // ✅ Step 1: Check if it's a van_inventory_id
//             const vanInventory = await tx.van_inventory.findUnique({
//               where: { id: itemProductId },
//               include: {
//                 van_inventory_items_inventory: {
//                   include: {
//                     van_inventory_items_products: true,
//                     van_inventory_items_batch_lot: true,
//                     van_inventory_serial: true,
//                   },
//                 },
//                 van_inventory_users: true,
//                 vehicle: true,
//               },
//             });

//             if (vanInventory) {
//               // ✅ It's a van_inventory_id - Process all items from this van
//               console.log(`✅ Detected van_inventory_id: ${itemProductId}`);
//               console.log(`   - Van items count: ${vanInventory.van_inventory_items_inventory.length}`);

//               if (vanInventory.van_inventory_items_inventory.length === 0) {
//                 throw new Error(`Van inventory ${itemProductId} has no items`);
//               }

//               // Group van items by product_id
//               const productGroups = new Map();
//               for (const vanItem of vanInventory.van_inventory_items_inventory) {
//                 const prodId = vanItem.product_id;
//                 if (!productGroups.has(prodId)) {
//                   productGroups.set(prodId, []);
//                 }
//                 productGroups.get(prodId).push(vanItem);
//               }

//               console.log(`   - Unique products in van: ${productGroups.size}`);

//               // Process each product group
//               let remainingQty = quantity;
//               for (const [productId, vanItems] of productGroups) {
//                 if (remainingQty <= 0) break;

//                 const product = vanItems[0].van_inventory_items_products;
//                 const trackingType = product.tracking_type?.toUpperCase() || 'NONE';

//                 console.log(`\n   📦 Processing product: ${product.name} (${trackingType})`);

//                 // Calculate available quantity for this product
//                 const availableQty = vanItems.reduce((sum, vi) => sum + vi.quantity, 0);
//                 const qtyToSell = Math.min(remainingQty, availableQty);

//                 console.log(`      - Available: ${availableQty}, Selling: ${qtyToSell}`);

//                 if (trackingType === 'BATCH') {
//                   // Process BATCH
//                   let totalProcessed = 0;
//                   const batchesUsed = [];

//                   for (const vanItem of vanItems) {
//                     if (totalProcessed >= qtyToSell) break;

//                     const batchQty = Math.min(qtyToSell - totalProcessed, vanItem.quantity);
//                     const batchLot = vanItem.van_inventory_items_batch_lot;

//                     if (!batchLot) {
//                       console.log(`      ⚠️ Skipping van_item ${vanItem.id} - no batch_lot`);
//                       continue;
//                     }

//                     // Deduct from batch_lots
//                     await tx.batch_lots.update({
//                       where: { id: batchLot.id },
//                       data: {
//                         remaining_quantity: batchLot.remaining_quantity - batchQty,
//                         updatedate: new Date(),
//                       },
//                     });

//                     // Deduct from product_batches
//                     const productBatch = await tx.product_batches.findFirst({
//                       where: {
//                         product_id: product.id,
//                         batch_lot_id: batchLot.id,
//                         is_active: 'Y',
//                       },
//                     });

//                     if (productBatch) {
//                       await tx.product_batches.update({
//                         where: { id: productBatch.id },
//                         data: {
//                           quantity: productBatch.quantity - batchQty,
//                           updatedate: new Date(),
//                         },
//                       });
//                     }

//                     // Deduct from inventory_stock
//                     const inventoryStock = await tx.inventory_stock.findFirst({
//                       where: {
//                         product_id: product.id,
//                         batch_id: batchLot.id,
//                       },
//                     });

//                     if (inventoryStock) {
//                       await tx.inventory_stock.update({
//                         where: { id: inventoryStock.id },
//                         data: {
//                           current_stock: Math.max(0, (inventoryStock.current_stock ?? 0) - batchQty),
//                           available_stock: Math.max(0, (inventoryStock.available_stock ?? 0) - batchQty),
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                     }

//                     // Delete/Update van_inventory_items
//                     const newVanQty = vanItem.quantity - batchQty;
//                     if (newVanQty <= 0) {
//                       await tx.van_inventory_items.delete({
//                         where: { id: vanItem.id },
//                       });
//                       console.log(`      🗑️ Deleted van_item ${vanItem.id}`);
//                     } else {
//                       await tx.van_inventory_items.update({
//                         where: { id: vanItem.id },
//                         data: { quantity: newVanQty },
//                       });
//                       console.log(`      📉 Updated van_item ${vanItem.id}: ${vanItem.quantity} → ${newVanQty}`);
//                     }

//                     // Create stock movement
//                     await tx.stock_movements.create({
//                       data: {
//                         product_id: product.id,
//                         batch_id: batchLot.id,
//                         serial_id: null,
//                         movement_type: 'SALE',
//                         reference_type: 'ORDER',
//                         reference_id: order.id,
//                         from_location_id: vanInventory.location_id,
//                         to_location_id: null,
//                         quantity: batchQty,
//                         movement_date: new Date(),
//                         remarks: `Sold via order ${order.order_number} - Batch ${batchLot.batch_number}`,
//                         is_active: 'Y',
//                         createdate: new Date(),
//                         createdby: userId,
//                         log_inst: 1,
//                         van_inventory_id: vanInventory.id,
//                       },
//                     });

//                     totalProcessed += batchQty;
//                     batchesUsed.push(batchLot.id);
//                     console.log(`      ✅ Processed batch ${batchLot.batch_number}: ${batchQty} units`);
//                   }

//                   // Create order_item
//                   if (totalProcessed > 0) {
//                     await tx.order_items.create({
//                       data: {
//                         parent_id: order.id,
//                         product_id: product.id,
//                         product_name: product.name,
//                         unit: item.unit || 'pcs',
//                         quantity: totalProcessed,
//                         unit_price: Number(item.unit_price || item.price),
//                         discount_amount: Number(item.discount_amount || 0),
//                         tax_amount: Number(item.tax_amount || 0),
//                         total_amount: totalProcessed * Number(item.unit_price || item.price),
//                         notes: `Batches: ${batchesUsed.join(', ')}`,
//                         is_free_gift: false,
//                       },
//                     });

//                     remainingQty -= totalProcessed;
//                   }
//                 } else if (trackingType === 'SERIAL') {
//                   // Process SERIAL
//                   let totalProcessed = 0;
//                   const serialsUsed = [];

//                   for (const vanItem of vanItems) {
//                     if (totalProcessed >= qtyToSell) break;

//                     const serial = vanItem.van_inventory_serial;
//                     if (!serial) {
//                       console.log(`      ⚠️ Skipping van_item ${vanItem.id} - no serial`);
//                       continue;
//                     }

//                     // Update serial status to sold
//                     await tx.serial_numbers.update({
//                       where: { id: serial.id },
//                       data: {
//                         status: 'sold',
//                         customer_id: customer.id,
//                         sold_date: new Date(),
//                         updatedate: new Date(),
//                         updatedby: userId,
//                       },
//                     });

//                     // Deduct from inventory_stock
//                     const inventoryStock = await tx.inventory_stock.findFirst({
//                       where: {
//                         product_id: product.id,
//                         serial_number_id: serial.id,
//                       },
//                     });

//                     if (inventoryStock) {
//                       await tx.inventory_stock.update({
//                         where: { id: inventoryStock.id },
//                         data: {
//                           current_stock: Math.max(0, (inventoryStock.current_stock ?? 0) - 1),
//                           available_stock: Math.max(0, (inventoryStock.available_stock ?? 0) - 1),
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                     }

//                     // Delete van_inventory_items
//                     await tx.van_inventory_items.delete({
//                       where: { id: vanItem.id },
//                     });
//                     console.log(`      🗑️ Deleted van_item ${vanItem.id} (serial: ${serial.serial_number})`);

//                     // Create stock movement
//                     await tx.stock_movements.create({
//                       data: {
//                         product_id: product.id,
//                         batch_id: null,
//                         serial_id: serial.id,
//                         movement_type: 'SALE',
//                         reference_type: 'ORDER',
//                         reference_id: order.id,
//                         from_location_id: vanInventory.location_id,
//                         to_location_id: null,
//                         quantity: 1,
//                         movement_date: new Date(),
//                         remarks: `Sold via order ${order.order_number} - Serial ${serial.serial_number}`,
//                         is_active: 'Y',
//                         createdate: new Date(),
//                         createdby: userId,
//                         log_inst: 1,
//                         van_inventory_id: vanInventory.id,
//                       },
//                     });

//                     totalProcessed += 1;
//                     serialsUsed.push(serial.serial_number);
//                     console.log(`      ✅ Processed serial ${serial.serial_number}`);
//                   }

//                   // Create order_item
//                   if (totalProcessed > 0) {
//                     await tx.order_items.create({
//                       data: {
//                         parent_id: order.id,
//                         product_id: product.id,
//                         product_name: product.name,
//                         unit: item.unit || 'pcs',
//                         quantity: totalProcessed,
//                         unit_price: Number(item.unit_price || item.price),
//                         discount_amount: Number(item.discount_amount || 0),
//                         tax_amount: Number(item.tax_amount || 0),
//                         total_amount: totalProcessed * Number(item.unit_price || item.price),
//                         notes: `Serials: ${serialsUsed.join(', ')}`,
//                         is_free_gift: false,
//                       },
//                     });

//                     remainingQty -= totalProcessed;
//                   }
//                 } else {
//                   // Process NONE
//                   let totalProcessed = 0;

//                   for (const vanItem of vanItems) {
//                     if (totalProcessed >= qtyToSell) break;

//                     const deductQty = Math.min(qtyToSell - totalProcessed, vanItem.quantity);

//                     // Deduct from inventory_stock
//                     const inventoryStock = await tx.inventory_stock.findFirst({
//                       where: {
//                         product_id: product.id,
//                         batch_id: null,
//                         serial_number_id: null,
//                       },
//                     });

//                     if (inventoryStock) {
//                       await tx.inventory_stock.update({
//                         where: { id: inventoryStock.id },
//                         data: {
//                           current_stock: Math.max(0, (inventoryStock.current_stock ?? 0) - deductQty),
//                           available_stock: Math.max(0, (inventoryStock.available_stock ?? 0) - deductQty),
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                     }

//                     // Delete/Update van_inventory_items
//                     const newVanQty = vanItem.quantity - deductQty;
//                     if (newVanQty <= 0) {
//                       await tx.van_inventory_items.delete({
//                         where: { id: vanItem.id },
//                       });
//                       console.log(`      🗑️ Deleted van_item ${vanItem.id}`);
//                     } else {
//                       await tx.van_inventory_items.update({
//                         where: { id: vanItem.id },
//                         data: { quantity: newVanQty },
//                       });
//                       console.log(`      📉 Updated van_item ${vanItem.id}: ${vanItem.quantity} → ${newVanQty}`);
//                     }

//                     // Create stock movement
//                     await tx.stock_movements.create({
//                       data: {
//                         product_id: product.id,
//                         batch_id: null,
//                         serial_id: null,
//                         movement_type: 'SALE',
//                         reference_type: 'ORDER',
//                         reference_id: order.id,
//                         from_location_id: vanInventory.location_id,
//                         to_location_id: null,
//                         quantity: deductQty,
//                         movement_date: new Date(),
//                         remarks: `Sold via order ${order.order_number}`,
//                         is_active: 'Y',
//                         createdate: new Date(),
//                         createdby: userId,
//                         log_inst: 1,
//                         van_inventory_id: vanInventory.id,
//                       },
//                     });

//                     totalProcessed += deductQty;
//                     console.log(`      ✅ Processed ${deductQty} units`);
//                   }

//                   // Create order_item
//                   if (totalProcessed > 0) {
//                     await tx.order_items.create({
//                       data: {
//                         parent_id: order.id,
//                         product_id: product.id,
//                         product_name: product.name,
//                         unit: item.unit || 'pcs',
//                         quantity: totalProcessed,
//                         unit_price: Number(item.unit_price || item.price),
//                         discount_amount: Number(item.discount_amount || 0),
//                         tax_amount: Number(item.tax_amount || 0),
//                         total_amount: totalProcessed * Number(item.unit_price || item.price),
//                         notes: item.notes || null,
//                         is_free_gift: false,
//                       },
//                     });

//                     remainingQty -= totalProcessed;
//                   }
//                 }
//               }

//               if (remainingQty > 0) {
//                 throw new Error(
//                   `Could not fulfill complete order. Remaining quantity: ${remainingQty} from requested ${quantity}`
//                 );
//               }
//             } else {
//               // ✅ It's a regular product_id - Process normally
//               console.log(`✅ Detected regular product_id: ${itemProductId}`);

//               const product = await tx.products.findUnique({
//                 where: { id: itemProductId },
//               });

//               if (!product) {
//                 throw new Error(`Product ${itemProductId} not found`);
//               }

//               const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
//               console.log(`   - Product: ${product.name} (${trackingType})`);

//               // Process normally (existing code for regular products)
//               // ... (your existing batch/serial/none processing code here)

//               throw new Error('Regular product_id processing not implemented in this example. Use van_inventory_id.');
//             }
//           }
//         }

//         // Fetch final order
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

//     const response = {
//       success: true,
//       message: orderId ? 'Order updated successfully' : 'Order created successfully',
//       data: serializeOrder(result),
//     };

//     res.status(orderId ? 200 : 201).json(response);
//   } catch (error: any) {
//     console.error('Error processing order:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process order',
//       error: error.message,
//     });
//   }
// }
