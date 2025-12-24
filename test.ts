// // Add this helper function at the top of the controller file
// async function createDefaultInventoryStock(
//   tx: any,
//   productId: number,
//   locationId: number | null,
//   userId: number
// ): Promise<void> {
//   await tx.inventory_stock.create({
//     data: {
//       product_id: productId,
//       location_id: locationId || 1, // Default warehouse/depot
//       current_stock: 0,
//       reserved_stock: 0,
//       available_stock: 0,
//       minimum_stock: 0,
//       maximum_stock: 0,
//       reorder_point: 0,
//       batch_id: null,
//       serial_id: null,
//       is_active: 'Y',
//       createdate: new Date(),
//       createdby: userId,
//       log_inst: 1,
//     },
//   });
// }

// // Update the createProduct method
// async createProduct(req: Request, res: Response) {
//   try {
//     const data = req.body;
//     const userId = req.user?.id || 1;
//     const batchLots: BatchLotInput[] = data.batch_lots || [];

//     let productCode =
//       data.code && data.code.trim() !== '' ? data.code.trim() : null;

//     if (!productCode) {
//       productCode = await generateProductsCode(data.name);
//       let attempts = 0;
//       while (attempts < 10) {
//         const existing = await prisma.products.findUnique({
//           where: { code: productCode },
//         });
//         if (!existing) break;
//         productCode = await generateProductsCode(data.name);
//         attempts++;
//       }
//     } else {
//       const existingProduct = await prisma.products.findUnique({
//         where: { code: productCode },
//       });

//       if (existingProduct) {
//         return res
//           .status(400)
//           .json({ message: 'Product code already exists' });
//       }
//     }

//     if (batchLots.length > 0) {
//       const batchLotIds = batchLots.map(b => b.batch_lot_id);

//       const uniqueIds = new Set(batchLotIds);
//       if (uniqueIds.size !== batchLotIds.length) {
//         return res.status(400).json({
//           message: 'Duplicate batch_lot_id found in the request',
//         });
//       }

//       const existingBatchLots = await prisma.batch_lots.findMany({
//         where: { id: { in: batchLotIds } },
//         select: { id: true, batch_number: true, lot_number: true },
//       });

//       const foundIds = existingBatchLots.map(b => b.id);
//       const missingIds = batchLotIds.filter(id => !foundIds.includes(id));

//       if (missingIds.length > 0) {
//         return res.status(400).json({
//           message: `Batch lots with IDs ${missingIds.join(', ')} not found`,
//         });
//       }
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       const product = await tx.products.create({
//         data: {
//           name: data.name,
//           code: productCode,
//           description: data.description || null,
//           category_id: data.category_id,
//           sub_category_id: data.sub_category_id,
//           brand_id: data.brand_id,
//           unit_of_measurement: data.unit_of_measurement,
//           base_price: data.base_price || null,
//           tax_rate: data.tax_rate || null,
//           tax_id: data.tax_id || null,
//           is_active: data.is_active || 'Y',
//           route_type_id: data.route_type_id || null,
//           outlet_group_id: data.outlet_group_id || null,
//           tracking_type: data.tracking_type || 'none',
//           product_type_id: data.product_type_id || null,
//           product_target_group_id: data.product_target_group_id || null,
//           product_web_order_id: data.product_web_order_id || null,
//           volume_id: data.volume_id || null,
//           flavour_id: data.flavour_id || null,
//           shelf_life_id: data.shelf_life_id || null,
//           vat_percentage: data.vat_percentage || null,
//           weight_in_grams: data.weight_in_grams || null,
//           volume_in_liters: data.volume_in_liters || null,
//           createdate: new Date(),
//           createdby: userId,
//           log_inst: data.log_inst || 1,
//         },
//       });

//       if (batchLots.length > 0) {
//         for (const batchLot of batchLots) {
//           await tx.product_batches.create({
//             data: {
//               product_id: product.id,
//               batch_lot_id: batchLot.batch_lot_id,
//               quantity: batchLot.quantity,
//               is_active: 'Y',
//               createdate: new Date(),
//               createdby: userId,
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       // Create default inventory stock if tracking_type is 'none'
//       if (product.tracking_type === 'none') {
//         await createDefaultInventoryStock(
//           tx,
//           product.id,
//           data.location_id || null,
//           userId
//         );
//       }

//       return product;
//     });

//     const completeProduct = await prisma.products.findUnique({
//       where: { id: result.id },
//       include: productInclude,
//     });

//     res.status(201).json({
//       message: 'Product created successfully',
//       data: serializeProduct(completeProduct),
//     });
//   } catch (error: any) {
//     console.error('Create Product Error:', error);
//     res.status(500).json({ message: error.message });
//   }
// },

// Add these helper functions at the top of vanInventory.controller.ts

async function createOrGetBatchForProduct(
  tx: any,
  productId: number,
  userId: number,
  batchData?: {
    batch_number?: string;
    lot_number?: string;
    manufacturing_date?: Date;
    expiry_date?: Date;
    supplier_name?: string;
  }
): Promise<any> {
  // Check if product already has a batch
  const existingBatch = await tx.batch_lots.findFirst({
    where: {
      productsId: productId,
      is_active: 'Y',
    },
  });

  if (existingBatch) {
    return existingBatch;
  }

  // Generate batch number
  const product = await tx.products.findUnique({
    where: { id: productId },
    select: { code: true, name: true },
  });

  const batchNumber =
    batchData?.batch_number || `${product.code}-${Date.now()}`;

  // Create new batch
  const newBatch = await tx.batch_lots.create({
    data: {
      batch_number: batchNumber,
      lot_number: batchData?.lot_number || `LOT-${Date.now()}`,
      manufacturing_date: batchData?.manufacturing_date || new Date(),
      expiry_date:
        batchData?.expiry_date ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      quantity: 0,
      remaining_quantity: 0,
      supplier_name: batchData?.supplier_name || null,
      purchase_price: null,
      quality_grade: 'A',
      storage_location: null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
      productsId: productId,
    },
  });

  // Create product_batches entry
  await tx.product_batches.create({
    data: {
      product_id: productId,
      batch_lot_id: newBatch.id,
      quantity: 0,
      is_active: 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    },
  });

  return newBatch;
}

async function updateInventoryStock(
  tx: any,
  productId: number,
  locationId: number | null,
  quantity: number,
  loadingType: string,
  batchId?: number | null,
  serialId?: number | null,
  userId?: number
): Promise<void> {
  const whereClause: any = {
    product_id: productId,
    location_id: locationId || 1,
  };

  if (batchId) {
    whereClause.batch_id = batchId;
  }
  if (serialId) {
    whereClause.serial_id = serialId;
  }

  const existingStock = await tx.inventory_stock.findFirst({
    where: whereClause,
  });

  let newCurrentStock: number;

  if (loadingType === 'L') {
    // Loading: increase inventory
    newCurrentStock = existingStock
      ? existingStock.current_stock + quantity
      : quantity;
  } else if (loadingType === 'U') {
    // Unloading: decrease inventory
    newCurrentStock = existingStock
      ? existingStock.current_stock - quantity
      : -quantity;

    if (newCurrentStock < 0) {
      throw new Error(
        `Insufficient inventory stock. Available: ${existingStock?.current_stock || 0}, Requested: ${quantity}`
      );
    }
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }

  if (existingStock) {
    await tx.inventory_stock.update({
      where: { id: existingStock.id },
      data: {
        current_stock: newCurrentStock,
        available_stock: newCurrentStock,
        updatedate: new Date(),
        updatedby: userId,
      },
    });
  } else {
    await tx.inventory_stock.create({
      data: {
        product_id: productId,
        location_id: locationId || 1,
        current_stock: newCurrentStock,
        reserved_stock: 0,
        available_stock: newCurrentStock,
        minimum_stock: 0,
        maximum_stock: 0,
        reorder_point: 0,
        batch_id: batchId || null,
        serial_id: serialId || null,
        is_active: 'Y',
        createdate: new Date(),
        createdby: userId || 1,
        log_inst: 1,
      },
    });
  }
}

async function createStockMovement(
  tx: any,
  data: {
    product_id: number;
    batch_id?: number | null;
    serial_id?: number | null;
    movement_type: string; // 'load' or 'unload'
    reference_type: string; // 'van_inventory'
    reference_id: number;
    from_location_id?: number | null;
    to_location_id?: number | null;
    quantity: number;
    remarks?: string;
    van_inventory_id?: number;
    createdby: number;
  }
): Promise<void> {
  await tx.stock_movements.create({
    data: {
      product_id: data.product_id,
      batch_id: data.batch_id || null,
      serial_id: data.serial_id || null,
      movement_type: data.movement_type,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      from_location_id: data.from_location_id || null,
      to_location_id: data.to_location_id || null,
      quantity: data.quantity,
      movement_date: new Date(),
      remarks: data.remarks || null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: data.createdby,
      log_inst: 1,
      van_inventory_id: data.van_inventory_id || null,
    },
  });
}

async function createOrUpdateSerialNumber(
  tx: any,
  productId: number,
  serialNumber: string,
  batchId: number | null,
  locationId: number | null,
  loadingType: string,
  userId: number
): Promise<any> {
  const existingSerial = await tx.serial_numbers.findUnique({
    where: { serial_number: serialNumber },
  });

  if (loadingType === 'L') {
    // Load: Create new serial
    if (existingSerial) {
      throw new Error(`Serial number ${serialNumber} already exists`);
    }

    return await tx.serial_numbers.create({
      data: {
        product_id: productId,
        serial_number: serialNumber,
        batch_id: batchId,
        status: 'in_van',
        location_id: locationId || null,
        is_active: 'Y',
        createdate: new Date(),
        createdby: userId,
        log_inst: 1,
      },
    });
  } else if (loadingType === 'U') {
    // Unload: Update existing serial
    if (!existingSerial) {
      throw new Error(`Serial number ${serialNumber} not found`);
    }

    if (existingSerial.status !== 'in_van') {
      throw new Error(
        `Serial number ${serialNumber} is not available for unloading. Status: ${existingSerial.status}`
      );
    }

    return await tx.serial_numbers.update({
      where: { serial_number: serialNumber },
      data: {
        status: 'available',
        location_id: locationId,
        updatedate: new Date(),
        updatedby: userId,
      },
    });
  }
}

// Replace the existing updateBatchLotQuantity function
async function updateBatchLotQuantity(
  tx: any,
  batchLotId: number,
  quantity: number,
  loadingType: string
): Promise<void> {
  const batchLot = await tx.batch_lots.findUnique({
    where: { id: batchLotId },
  });

  if (!batchLot) {
    throw new Error(`Batch lot with ID ${batchLotId} not found`);
  }

  if (batchLot.is_active !== 'Y') {
    throw new Error(`Batch lot ${batchLot.batch_number} is not active`);
  }

  if (new Date(batchLot.expiry_date) < new Date()) {
    throw new Error(`Batch lot ${batchLot.batch_number} has expired`);
  }

  let newRemainingQuantity: number;
  let newTotalQuantity: number;

  if (loadingType === 'L') {
    // Load: increase batch quantity
    newRemainingQuantity = batchLot.remaining_quantity + quantity;
    newTotalQuantity = batchLot.quantity + quantity;
  } else if (loadingType === 'U') {
    // Unload: decrease batch quantity
    newRemainingQuantity = batchLot.remaining_quantity - quantity;
    newTotalQuantity = batchLot.quantity - quantity;

    if (newRemainingQuantity < 0) {
      throw new Error(
        `Insufficient quantity in batch ${batchLot.batch_number}. Available: ${batchLot.remaining_quantity}, Requested: ${quantity}`
      );
    }
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }

  await tx.batch_lots.update({
    where: { id: batchLotId },
    data: {
      quantity: newTotalQuantity,
      remaining_quantity: newRemainingQuantity,
      updatedate: new Date(),
    },
  });
}

// Replace the existing updateProductBatchQuantity function
async function updateProductBatchQuantity(
  tx: any,
  productId: number,
  batchLotId: number,
  quantity: number,
  loadingType: string
): Promise<void> {
  const productBatch = await tx.product_batches.findFirst({
    where: {
      product_id: productId,
      batch_lot_id: batchLotId,
      is_active: 'Y',
    },
  });

  if (!productBatch) {
    throw new Error(
      `Product batch not found for product ${productId} and batch ${batchLotId}`
    );
  }

  let newQuantity: number;

  if (loadingType === 'L') {
    // Load: increase quantity
    newQuantity = productBatch.quantity + quantity;
  } else if (loadingType === 'U') {
    // Unload: decrease quantity
    newQuantity = productBatch.quantity - quantity;
    if (newQuantity < 0) {
      throw new Error(
        `Insufficient quantity in product batch. Available: ${productBatch.quantity}, Requested: ${quantity}`
      );
    }
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }

  await tx.product_batches.update({
    where: { id: productBatch.id },
    data: {
      quantity: newQuantity,
      updatedate: new Date(),
    },
  });
}

// REPLACE the entire createOrUpdateVanInventory method with this:
export const vanInventoryController = {
  async createOrUpdateVanInventory(req: Request, res: Response) {
    const data = req.body;
    const userId = (req as any).user?.id || 1;
    const { van_inventory_items, inventoryItems, ...inventoryData } = data;
    const items = van_inventory_items || inventoryItems || [];
    let inventoryId = inventoryData.id;

    try {
      const result = await prisma.$transaction(
        async tx => {
          let inventory;
          let isUpdate = false;

          if (inventoryId) {
            const existing = await tx.van_inventory.findUnique({
              where: { id: Number(inventoryId) },
            });
            if (existing) {
              isUpdate = true;
            }
          }

          if (!inventoryData.user_id) {
            throw new Error('user_id is required');
          }

          const userExists = await tx.users.findUnique({
            where: { id: Number(inventoryData.user_id) },
          });
          if (!userExists) {
            throw new Error(`User ${inventoryData.user_id} not found`);
          }

          if (inventoryData.vehicle_id) {
            const vehicleExists = await tx.vehicles.findUnique({
              where: { id: Number(inventoryData.vehicle_id) },
            });
            if (!vehicleExists) {
              throw new Error(`Vehicle ${inventoryData.vehicle_id} not found`);
            }
          }

          const loadingType = inventoryData.loading_type || 'L';

          const payload = {
            user_id: Number(inventoryData.user_id),
            status: inventoryData.status || 'A',
            loading_type: loadingType,
            document_date:
              inventoryData.document_date &&
              inventoryData.document_date.trim() !== ''
                ? new Date(inventoryData.document_date)
                : new Date(),
            vehicle_id: inventoryData.vehicle_id
              ? Number(inventoryData.vehicle_id)
              : null,
            location_type: inventoryData.location_type || 'van',
            location_id: inventoryData.location_id
              ? Number(inventoryData.location_id)
              : null,
            is_active: inventoryData.is_active || 'Y',
          };

          if (isUpdate && inventoryId) {
            inventory = await tx.van_inventory.update({
              where: { id: Number(inventoryId) },
              data: {
                ...payload,
                updatedby: userId,
                updatedate: new Date(),
                log_inst: { increment: 1 },
              },
            });
          } else {
            inventory = await tx.van_inventory.create({
              data: {
                ...payload,
                createdby: userId,
                createdate: new Date(),
                log_inst: 1,
              },
            });
            inventoryId = inventory.id;
          }

          const processedItemIds: number[] = [];

          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              const qty = parseInt(item.quantity, 10) || 0;

              if (qty <= 0) {
                throw new Error('Quantity must be greater than 0');
              }

              if (!item.product_id) {
                throw new Error('product_id is required for each item');
              }

              const product = await tx.products.findUnique({
                where: { id: Number(item.product_id) },
                include: { product_unit_of_measurement: true },
              });

              if (!product) {
                throw new Error(`Product ${item.product_id} not found`);
              }

              const trackingType = product.tracking_type || 'none';
              let batchId: number | null = null;
              let serialId: number | null = null;

              // Handle based on tracking type
              if (trackingType === 'batch') {
                // BATCH TRACKING
                let batch;

                if (loadingType === 'L') {
                  // Load: Create or get batch
                  batch = await createOrGetBatchForProduct(
                    tx,
                    product.id,
                    userId,
                    item.batch_data // Optional batch metadata from frontend
                  );
                  batchId = batch.id;

                  // Update batch quantities
                  await updateBatchLotQuantity(tx, batchId, qty, loadingType);
                  await updateProductBatchQuantity(
                    tx,
                    product.id,
                    batchId,
                    qty,
                    loadingType
                  );
                } else if (loadingType === 'U') {
                  // Unload: Must provide batch_lot_id
                  if (!item.batch_lot_id) {
                    throw new Error(
                      `batch_lot_id is required for unloading product ${product.name}`
                    );
                  }
                  batchId = Number(item.batch_lot_id);

                  // Update batch quantities
                  await updateBatchLotQuantity(tx, batchId, qty, loadingType);
                  await updateProductBatchQuantity(
                    tx,
                    product.id,
                    batchId,
                    qty,
                    loadingType
                  );
                }

                // Update inventory stock
                await updateInventoryStock(
                  tx,
                  product.id,
                  payload.location_id,
                  qty,
                  loadingType,
                  batchId,
                  null,
                  userId
                );

                // Create stock movement
                await createStockMovement(tx, {
                  product_id: product.id,
                  batch_id: batchId,
                  movement_type: loadingType === 'L' ? 'load' : 'unload',
                  reference_type: 'van_inventory',
                  reference_id: inventory.id,
                  from_location_id:
                    loadingType === 'L' ? payload.location_id : null,
                  to_location_id:
                    loadingType === 'U' ? payload.location_id : null,
                  quantity: qty,
                  remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'}`,
                  van_inventory_id: inventory.id,
                  createdby: userId,
                });
              } else if (trackingType === 'serial') {
                // SERIAL TRACKING
                if (
                  !item.serial_numbers ||
                  !Array.isArray(item.serial_numbers)
                ) {
                  throw new Error(
                    `serial_numbers array is required for product ${product.name}`
                  );
                }

                if (item.serial_numbers.length !== qty) {
                  throw new Error(
                    `Number of serial numbers (${item.serial_numbers.length}) must match quantity (${qty})`
                  );
                }

                for (const serialNum of item.serial_numbers) {
                  const serial = await createOrUpdateSerialNumber(
                    tx,
                    product.id,
                    serialNum,
                    item.batch_lot_id || null,
                    payload.location_id,
                    loadingType,
                    userId
                  );

                  serialId = serial.id;

                  // Update inventory stock for each serial
                  await updateInventoryStock(
                    tx,
                    product.id,
                    payload.location_id,
                    1, // Each serial is 1 unit
                    loadingType,
                    null,
                    serialId,
                    userId
                  );

                  // Create stock movement for each serial
                  await createStockMovement(tx, {
                    product_id: product.id,
                    serial_id: serialId,
                    movement_type: loadingType === 'L' ? 'load' : 'unload',
                    reference_type: 'van_inventory',
                    reference_id: inventory.id,
                    from_location_id:
                      loadingType === 'L' ? payload.location_id : null,
                    to_location_id:
                      loadingType === 'U' ? payload.location_id : null,
                    quantity: 1,
                    remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'} - Serial: ${serialNum}`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });
                }
              } else {
                // NONE TRACKING (Simple quantity)
                await updateInventoryStock(
                  tx,
                  product.id,
                  payload.location_id,
                  qty,
                  loadingType,
                  null,
                  null,
                  userId
                );

                // Create stock movement
                await createStockMovement(tx, {
                  product_id: product.id,
                  movement_type: loadingType === 'L' ? 'load' : 'unload',
                  reference_type: 'van_inventory',
                  reference_id: inventory.id,
                  from_location_id:
                    loadingType === 'L' ? payload.location_id : null,
                  to_location_id:
                    loadingType === 'U' ? payload.location_id : null,
                  quantity: qty,
                  remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'}`,
                  van_inventory_id: inventory.id,
                  createdby: userId,
                });
              }

              // Create van_inventory_items entry
              const itemData = {
                parent_id: inventory.id,
                product_id: Number(item.product_id),
                product_name: product.name,
                unit:
                  product.product_unit_of_measurement?.name ||
                  product.product_unit_of_measurement?.symbol ||
                  'pcs',
                quantity: qty,
                unit_price: Number(item.unit_price) || 0,
                discount_amount: Number(item.discount_amount) || 0,
                tax_amount: Number(item.tax_amount) || 0,
                total_amount:
                  qty * (Number(item.unit_price) || 0) -
                  (Number(item.discount_amount) || 0) +
                  (Number(item.tax_amount) || 0),
                notes: item.notes || null,
                batch_lot_id: batchId,
              };

              if (item.id) {
                const existingItem = await tx.van_inventory_items.findFirst({
                  where: { id: Number(item.id), parent_id: inventory.id },
                });

                if (existingItem) {
                  await tx.van_inventory_items.update({
                    where: { id: Number(item.id) },
                    data: itemData,
                  });
                  processedItemIds.push(Number(item.id));
                } else {
                  const newItem = await tx.van_inventory_items.create({
                    data: itemData,
                  });
                  processedItemIds.push(newItem.id);
                }
              } else {
                const newItem = await tx.van_inventory_items.create({
                  data: itemData,
                });
                processedItemIds.push(newItem.id);
              }

              console.log(
                `Processed: Product ${item.product_id}, Type ${trackingType}, Batch ${batchId}, Serial ${serialId}, Qty ${qty}, Loading ${loadingType}`
              );
            }

            // Delete items not in the processed list
            if (isUpdate) {
              await tx.van_inventory_items.deleteMany({
                where: {
                  parent_id: inventory.id,
                  ...(processedItemIds.length > 0
                    ? { id: { notIn: processedItemIds } }
                    : {}),
                },
              });
            }
          } else if (isUpdate) {
            await tx.van_inventory_items.deleteMany({
              where: { parent_id: inventory.id },
            });
          }

          const finalInventory = await tx.van_inventory.findUnique({
            where: { id: inventory.id },
            include: {
              van_inventory_users: true,
              vehicle: true,
              van_inventory_depot: true,
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: {
                    include: {
                      product_unit_of_measurement: true,
                      product_product_batches: {
                        include: {
                          batch_lot_product_batches: true,
                        },
                      },
                    },
                  },
                  van_inventory_items_batch_lot: true,
                },
              },
              van_inventory_stock_movements: true,
            },
          });

          return { finalInventory, wasUpdate: isUpdate };
        },
        { maxWait: 15000, timeout: 45000 }
      );

      const finalInventory = (result as any).finalInventory;
      const wasUpdate = (result as any).wasUpdate === true;

      res.status(wasUpdate ? 200 : 201).json({
        message: wasUpdate
          ? 'Van Inventory updated successfully'
          : 'Van Inventory created successfully',
        data: serializeVanInventory(finalInventory),
      });
    } catch (error: any) {
      console.error('Create/Update Van Inventory Error:', error);

      const badRequestKeywords = [
        'required',
        'not found',
        'Insufficient',
        'expired',
        'not active',
        'Invalid',
        'must be',
        'not associated',
        'already exists',
      ];

      if (badRequestKeywords.some(kw => error.message?.includes(kw))) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: 'Failed to process van inventory',
        error: error.message,
      });
    }
  },

  // ... keep all other existing methods (getAllVanInventory, getVanInventoryById, etc.)
};
