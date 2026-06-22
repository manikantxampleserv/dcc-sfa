import prisma from '../../configs/prisma.client';

async function updateInventoryStock(
  tx: any,
  productId: number,
  locationId: number | null,
  quantity: number,
  loadingType: string,
  batchId?: number | null,
  serialId?: number | null,
  userId?: number,
  vanUserId?: number | null
): Promise<void> {
  let validLocationId = locationId;
  let salespersonId: number | null = vanUserId || null;
  if (!validLocationId) {
    const targetUserId = vanUserId || userId || 1;
    const user = await tx.users.findUnique({ where: { id: targetUserId } });
    const depotName = `Van - ${user?.name || targetUserId}`;
    let vanDepot = await tx.depots.findFirst({ where: { name: depotName } });

    if (!vanDepot) {
      const parentDepot = await tx.depots.findFirst({ orderBy: { id: 'asc' } });
      vanDepot = await tx.depots.create({
        data: {
          parent_id: parentDepot ? parentDepot.parent_id : 1,
          name: depotName,
          code: `VAN-${targetUserId}`,
          is_active: 'Y',
          createdby: userId || 1,
        },
      });
    }
    validLocationId = vanDepot.id;
  }

  const whereClause: any = {
    product_id: productId,
    location_id: validLocationId,
  };

  if (batchId !== null) whereClause.batch_id = batchId;
  if (serialId !== null) whereClause.serial_number_id = serialId;

  const existingStock = await tx.inventory_stock.findFirst({
    where: whereClause,
  });

  if (loadingType === 'L') {
    if (existingStock) {
      const prevCurrent = existingStock.current_stock ?? 0;
      const prevAvailable = existingStock.available_stock ?? 0;
      const newCurrent = prevCurrent + quantity;
      const newAvailable = prevAvailable + quantity;
      console.log(
        `updateInventoryStock LOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} +${quantity} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
      );
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          current_stock: newCurrent,
          available_stock: newAvailable,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    } else {
      console.log(
        `updateInventoryStock CREATE: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} set current ${quantity} available ${quantity}`
      );
      await tx.inventory_stock.create({
        data: {
          product_id: productId,
          location_id: validLocationId,
          salesperson_id: salespersonId,
          current_stock: quantity,
          reserved_stock: 0,
          available_stock: quantity,
          minimum_stock: 0,
          maximum_stock: 0,
          batch_id: batchId || null,
          serial_number_id: serialId || null,
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId || 1,
          log_inst: 1,
        },
      });
    }
  } else if (loadingType === 'U') {
    if (existingStock) {
      const prevCurrent = existingStock.current_stock ?? 0;
      const prevAvailable = existingStock.available_stock ?? 0;
      const newCurrentStock = Math.max(0, prevCurrent - quantity);
      const newAvailableStock = Math.max(0, prevAvailable - quantity);
      console.log(
        `updateInventoryStock UNLOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} -${quantity} current ${prevCurrent}→${newCurrentStock} available ${prevAvailable}→${newAvailableStock}`
      );
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          current_stock: newCurrentStock,
          available_stock: newAvailableStock,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    }
    return;
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }
}

async function createStockMovement(
  tx: any,
  data: {
    product_id: number;
    batch_id?: number | null;
    serial_id?: number | null;
    movement_type: string;
    reference_type: string;
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
      batch_id: data.batch_id ?? null,
      serial_id: data.serial_id ?? null,
      movement_type: data.movement_type,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      from_location_id: data.from_location_id ?? null,
      to_location_id: data.to_location_id ?? null,
      quantity: data.quantity,
      movement_date: new Date(),
      remarks: data.remarks || null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: data.createdby,
      log_inst: 1,
      van_inventory_id: data.van_inventory_id ?? null,
    },
  });
}

export const sapService = {
  async createOrUpdateVanInventorySAP(payload: any, userId: number = 1) {
    const { van_inventory_items, inventoryItems, ...inventoryData } = payload;

    const items = van_inventory_items || inventoryItems || payload.items || [];
    let inventoryId = inventoryData.id;

    return await prisma.$transaction(
      async tx => {
        if (!inventoryData.sap_docentry) {
          throw new Error('sap_docentry is required');
        }

        const existingSapDoc = await tx.van_inventory.findFirst({
          where: {
            sap_docentry: inventoryData.sap_docentry,
          },
        });

        if (existingSapDoc) {
          throw new Error(
            `SAP document ${inventoryData.sap_docentry} already imported`
          );
        }

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

        if (!inventoryData.salesman_sap_code) {
          throw new Error('salesman_sap_code is required');
        }

        const spUser = await tx.users.findFirst({
          where: { sap_code: inventoryData.salesman_sap_code },
        });

        if (!spUser) {
          throw new Error(
            `Salesman with SAP code ${inventoryData.salesman_sap_code} not found`
          );
        }
        inventoryData.user_id = spUser.id;

        if (!inventoryData.depot_sap_code) {
          throw new Error('depot_sap_code is required');
        }

        const depot = await tx.depots.findFirst({
          where: { sap_code: inventoryData.depot_sap_code },
        });

        if (!depot) {
          throw new Error(
            `Depot with SAP code ${inventoryData.depot_sap_code} not found`
          );
        }
        inventoryData.location_id = depot.id;

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
          sap_docentry: inventoryData.sap_docentry,
          source_system: 'SAP',
          status: inventoryData.status || 'A',
          loading_type: loadingType,
          document_date: inventoryData.document_date
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

        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            const qty = parseInt(item.quantity, 10) || 0;

            if (!item.product_sap_code) {
              throw new Error('product_sap_code is required for each item');
            }

            const product = await tx.products.findFirst({
              where: { sap_code: item.product_sap_code },
              include: { product_unit_of_measurement: true },
            });

            if (!product) {
              throw new Error(
                `Product with SAP code ${item.product_sap_code} not found`
              );
            }

            const trackingType = product.tracking_type?.toUpperCase() || 'NONE';

            if (loadingType === 'L') {
              if (trackingType === 'BATCH') {
                const batchData = item.batches || item.product_batches;

                if (
                  !batchData ||
                  !Array.isArray(batchData) ||
                  batchData.length === 0
                ) {
                  throw new Error(
                    `Batches are required for batch-tracked product ${product.name}`
                  );
                }

                const totalBatchQty = (batchData || []).reduce(
                  (acc: number, b: any) =>
                    acc + (parseInt(b.quantity, 10) || 0),
                  0
                );
                if (
                  typeof item.quantity === 'undefined' ||
                  item.quantity === null
                ) {
                  throw new Error(
                    `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
                  );
                }
                const declaredQty = parseInt(item.quantity, 10);
                if (
                  Number.isNaN(declaredQty) ||
                  declaredQty !== totalBatchQty
                ) {
                  throw new Error(
                    `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQty}`
                  );
                }

                for (const batchInput of batchData) {
                  const batchQty = parseInt(batchInput.quantity, 10) || 0;

                  if (batchQty <= 0) {
                    throw new Error('Batch quantity must be greater than 0');
                  }

                  if (batchQty <= 0) {
                    throw new Error('Batch quantity must be greater than 0');
                  }

                  if (batchQty <= 0) {
                    throw new Error('Batch quantity must be greater than 0');
                  }

                  let batchLot = await tx.batch_lots.findFirst({
                    where: {
                      batch_number: batchInput.batch_number,
                      productsId: product.id,
                      is_active: 'Y',
                      createdby: Number(inventoryData.user_id),
                    },
                  });

                  if (batchLot) {
                    await tx.batch_lots.update({
                      where: { id: batchLot.id },
                      data: {
                        quantity: batchLot.quantity + batchQty,
                        remaining_quantity:
                          batchLot.remaining_quantity + batchQty,
                        updatedate: new Date(),
                      },
                    });
                    console.log(
                      ` Updated batch_lots: ${batchLot.batch_number}`
                    );
                  } else {
                    batchLot = await tx.batch_lots.create({
                      data: {
                        batch_number: batchInput.batch_number,
                        lot_number:
                          batchInput.lot_number || `LOT-${Date.now()}`,
                        manufacturing_date: batchInput.manufacturing_date
                          ? new Date(batchInput.manufacturing_date)
                          : new Date(),
                        expiry_date: batchInput.expiry_date
                          ? new Date(batchInput.expiry_date)
                          : new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() + 2
                              )
                            ),
                        quantity: batchQty,
                        remaining_quantity: batchQty,
                        supplier_name: batchInput.supplier_name || null,
                        purchase_price: batchInput.purchase_price || null,
                        quality_grade: batchInput.quality_grade || 'A',
                        storage_location: batchInput.storage_location || null,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: Number(inventoryData.user_id),
                        log_inst: 1,
                        productsId: product.id,
                      },
                    });
                    console.log(
                      ` Created batch_lots: ${batchLot.batch_number}`
                    );
                  }

                  let productBatch = await tx.product_batches.findFirst({
                    where: {
                      product_id: product.id,
                      batch_lot_id: batchLot.id,
                      is_active: 'Y',
                    },
                  });

                  if (productBatch) {
                    await tx.product_batches.update({
                      where: { id: productBatch.id },
                      data: {
                        quantity: productBatch.quantity + batchQty,
                        updatedate: new Date(),
                      },
                    });
                    console.log(` Updated product_batches: +${batchQty}`);
                  } else {
                    await tx.product_batches.create({
                      data: {
                        product_id: product.id,
                        batch_lot_id: batchLot.id,
                        quantity: batchQty,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                      },
                    });
                    console.log(` Created product_batches`);
                  }

                  const existingVanItem =
                    await tx.van_inventory_items.findFirst({
                      where: {
                        product_id: product.id,
                        batch_lot_id: batchLot.id,
                        van_inventory_items_inventory: {
                          user_id: inventoryData.user_id,
                          is_active: 'Y',
                        },
                      },
                      include: {
                        van_inventory_items_inventory: true,
                      },
                    });

                  if (existingVanItem) {
                    const newQuantity = existingVanItem.quantity + batchQty;
                    await tx.van_inventory_items.update({
                      where: { id: existingVanItem.id },
                      data: {
                        sap_lineid:
                          item.sap_lineid || existingVanItem.sap_lineid,
                        quantity: newQuantity,
                        total_amount:
                          newQuantity * Number(item.unit_price || 0),
                      },
                    });
                    console.log(
                      ` Updated van_inventory_items (ID: ${existingVanItem.id}): ${existingVanItem.quantity} → ${newQuantity}`
                    );
                  } else {
                    await tx.van_inventory_items.create({
                      data: {
                        parent_id: inventory.id,
                        sap_lineid: item.sap_lineid || null,
                        product_id: product.id,
                        product_name: product.name,
                        unit:
                          product.product_unit_of_measurement?.name || 'pcs',
                        quantity: batchQty,
                        unit_price: Number(item.unit_price || 0),
                        discount_amount: Number(item.discount_amount || 0),
                        tax_amount: Number(item.tax_amount || 0),
                        total_amount: batchQty * Number(item.unit_price || 0),
                        notes: item.notes || null,
                        batch_lot_id: batchLot.id,
                      },
                    });
                    console.log(` Created van_inventory_items`);
                  }

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventoryData.location_id || null,
                    batchQty,
                    'L',
                    batchLot.id,
                    null,
                    userId,
                    inventoryData.user_id
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: batchLot.id,
                    serial_id: null,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: batchQty,
                    remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });
                }
              } else if (trackingType === 'SERIAL') {
                const serialData = item.serials || item.product_serials;

                if (
                  !serialData ||
                  !Array.isArray(serialData) ||
                  serialData.length === 0
                ) {
                  throw new Error(
                    `Serial numbers are required for serial-tracked product "${product.name}"`
                  );
                }

                if (
                  typeof item.quantity !== 'undefined' &&
                  item.quantity !== null
                ) {
                  const declaredQty = parseInt(item.quantity, 10);
                  if (
                    !Number.isNaN(declaredQty) &&
                    declaredQty !== serialData.length
                  ) {
                    throw new Error(
                      `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
                    );
                  }
                }

                console.log(` Product: ${product.name}, ID: ${product.id}`);

                for (const serialInput of serialData) {
                  const serialNumber =
                    typeof serialInput === 'string'
                      ? serialInput
                      : serialInput.serial_number;

                  if (!serialNumber) {
                    throw new Error('Serial number is required');
                  }

                  let existingSerial = await tx.serial_numbers.findUnique({
                    where: { serial_number: serialNumber },
                  });

                  if (existingSerial) {
                    if (existingSerial.status === 'in_van') {
                      throw new Error(
                        `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
                      );
                    }

                    await tx.serial_numbers.update({
                      where: { id: existingSerial.id },
                      data: {
                        status: 'in_van',
                        location_id: null,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });
                    console.log(
                      ` Updated serial ${serialNumber} status → in_van`
                    );
                  } else {
                    existingSerial = await tx.serial_numbers.create({
                      data: {
                        product_id: product.id,
                        serial_number: serialNumber,
                        batch_id: serialInput.batch_id || null,
                        status: 'in_van',
                        location_id: null,
                        warranty_expiry: serialInput.warranty_expiry
                          ? new Date(serialInput.warranty_expiry)
                          : null,
                        customer_id: serialInput.customer_id || null,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                      },
                    });
                    console.log(` Created new serial ${serialNumber}`);
                  }

                  const existingVanItem =
                    await tx.van_inventory_items.findFirst({
                      where: {
                        product_id: product.id,
                        serial_id: existingSerial.id,
                        van_inventory_items_inventory: {
                          user_id: inventoryData.user_id,
                          is_active: 'Y',
                        },
                      },
                      include: {
                        van_inventory_items_inventory: true,
                      },
                    });

                  if (existingVanItem) {
                    const newQuantity = existingVanItem.quantity + 1;
                    await tx.van_inventory_items.update({
                      where: { id: existingVanItem.id },
                      data: {
                        sap_lineid:
                          item.sap_lineid || existingVanItem.sap_lineid,
                        quantity: newQuantity,
                        total_amount:
                          newQuantity * Number(item.unit_price || 0),
                      },
                    });
                    console.log(
                      ` Updated van_inventory_items ID: ${existingVanItem.id}, quantity: ${existingVanItem.quantity}→${newQuantity}`
                    );
                  } else {
                    await tx.van_inventory_items.create({
                      data: {
                        parent_id: inventory.id,
                        sap_lineid: item.sap_lineid || null,
                        product_id: product.id,
                        product_name: product.name,
                        unit:
                          product.product_unit_of_measurement?.name || 'pcs',
                        quantity: 1,
                        unit_price: Number(item.unit_price || 0),
                        discount_amount: Number(item.discount_amount || 0),
                        tax_amount: Number(item.tax_amount || 0),
                        total_amount: 1 * Number(item.unit_price || 0),
                        notes: item.notes || null,
                        serial_id: existingSerial.id,
                      },
                    });
                    console.log(
                      `Created new van_inventory_items for serial ${serialNumber}`
                    );
                  }

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventoryData.location_id || null,
                    1,
                    'L',
                    null,
                    existingSerial.id,
                    userId,
                    inventoryData.user_id
                  );
                  console.log(
                    ` INCREASED inventory_stock for serial ${serialNumber}`
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: existingSerial.id,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: 1,
                    remarks: `Loaded serial ${serialNumber} to van`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });
                  console.log(
                    ` Created VAN_LOAD stock movement for ${serialNumber}`
                  );
                }
              } else {
                // NONE tracking type
                if (qty <= 0) {
                  throw new Error(
                    'Quantity must be greater than 0 for NONE-tracked product'
                  );
                }
                const existingVanItem = await tx.van_inventory_items.findFirst({
                  where: {
                    parent_id: inventory.id,
                    product_id: product.id,
                    batch_lot_id: null,
                    serial_id: null,
                  },
                });

                if (existingVanItem) {
                  await tx.van_inventory_items.update({
                    where: { id: existingVanItem.id },
                    data: {
                      sap_lineid: item.sap_lineid || existingVanItem.sap_lineid,
                      quantity: existingVanItem.quantity + qty,
                      total_amount:
                        (existingVanItem.quantity + qty) *
                        Number(item.unit_price || 0),
                    },
                  });
                  console.log(
                    `    Updated van_inventory_items: ${existingVanItem.quantity} → ${existingVanItem.quantity + qty}`
                  );
                } else {
                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: qty,
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: qty * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      batch_lot_id: null,
                      serial_id: null,
                    },
                  });
                  console.log(`    Created van_inventory_items`);
                }

                await updateInventoryStock(
                  tx,
                  product.id,
                  inventoryData.location_id || null,
                  qty,
                  'L',
                  null,
                  null,
                  userId,
                  inventoryData.user_id
                );
                console.log(`    Updated inventory_stock`);

                await createStockMovement(tx, {
                  product_id: product.id,
                  batch_id: null,
                  serial_id: null,
                  movement_type: 'VAN_LOAD',
                  reference_type: 'VAN_INVENTORY',
                  reference_id: inventory.id,
                  from_location_id: null,
                  to_location_id: null,
                  quantity: qty,
                  remarks: `Loaded ${qty} units to van`,
                  van_inventory_id: inventory.id,
                  createdby: userId,
                });

                console.log(
                  ` Loaded ${qty} units of NONE-tracked product ${product.name}\n`
                );
              }
            } else if (loadingType === 'U') {
              if (trackingType === 'BATCH') {
                const batchData = item.batches || item.product_batches;

                if (
                  !batchData ||
                  !Array.isArray(batchData) ||
                  batchData.length === 0
                ) {
                  throw new Error(
                    `Batches are required for batch-tracked product ${product.name}`
                  );
                }

                const totalBatchQtyUnload = (batchData || []).reduce(
                  (acc: number, b: any) =>
                    acc + (parseInt(b.quantity, 10) || 0),
                  0
                );
                if (
                  typeof item.quantity === 'undefined' ||
                  item.quantity === null
                ) {
                  throw new Error(
                    `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
                  );
                }
                const declaredQtyUnload = parseInt(item.quantity, 10);
                if (
                  Number.isNaN(declaredQtyUnload) ||
                  declaredQtyUnload !== totalBatchQtyUnload
                ) {
                  throw new Error(
                    `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQtyUnload}`
                  );
                }

                for (const batchInput of batchData) {
                  const batchQty = parseInt(batchInput.quantity, 10) || 0;

                  const batchLot = await tx.batch_lots.findFirst({
                    where: {
                      batch_number: batchInput.batch_number,
                      productsId: product.id,
                      is_active: 'Y',
                    },
                  });

                  if (!batchLot)
                    throw new Error(
                      `Batch ${batchInput.batch_number} not found`
                    );

                  const vanItem = await tx.van_inventory_items.findFirst({
                    where: {
                      product_id: product.id,
                      batch_lot_id: batchLot.id,
                      van_inventory_items_inventory: {
                        user_id: Number(inventoryData.user_id),
                        is_active: 'Y',
                        loading_type: 'L',
                      },
                    },
                  });
                  if (!vanItem)
                    throw new Error(
                      `Batch ${batchInput.batch_number} for product ${product.id} not found in van inventory for user ${inventoryData.user_id}`
                    );
                  if (vanItem.quantity < batchQty)
                    throw new Error(`Insufficient van quantity`);

                  // await tx.van_inventory_items.update({
                  //   where: { id: vanItem.id },
                  //   data: {
                  //     quantity: vanItem.quantity - batchQty,
                  //     total_amount:
                  //       (vanItem.quantity - batchQty) *
                  //       Number(vanItem.unit_price || 0),
                  //   },
                  // });

                  // await tx.batch_lots.update({
                  //   where: { id: batchLot.id },
                  //   data: {
                  //     remaining_quantity:
                  //       batchLot.remaining_quantity - batchQty,
                  //     updatedate: new Date(),
                  //   },
                  // });

                  // const productBatch = await tx.product_batches.findFirst({
                  //   where: {
                  //     product_id: product.id,
                  //     batch_lot_id: batchLot.id,
                  //     is_active: 'Y',
                  //   },
                  // });

                  // if (productBatch) {
                  //   await tx.product_batches.update({
                  //     where: { id: productBatch.id },
                  //     data: {
                  //       quantity: productBatch.quantity - batchQty,
                  //       updatedate: new Date(),
                  //     },
                  //   });
                  // }

                  const inventoryStock = await tx.inventory_stock.findFirst({
                    where: {
                      product_id: product.id,
                      location_id: inventoryData.location_id || 1,
                      batch_id: batchLot.id,
                    },
                  });

                  if (inventoryStock) {
                    const prevCurrent = inventoryStock.current_stock ?? 0;
                    const prevAvailable = inventoryStock.available_stock ?? 0;
                    const newCurrent = Math.max(0, prevCurrent - batchQty);
                    const newAvailable = Math.max(0, prevAvailable - batchQty);
                    console.log(
                      `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} batch=${batchLot.id} -${batchQty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
                    );
                    await tx.inventory_stock.update({
                      where: { id: inventoryStock.id },
                      data: {
                        current_stock: newCurrent,
                        available_stock: newAvailable,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });
                  }

                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: batchQty,
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: batchQty * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      batch_lot_id: batchLot.id,
                    },
                  });

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: batchLot.id,
                    serial_id: null,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: batchQty,
                    remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });
                }
              } else if (trackingType === 'SERIAL') {
                const serialData = item.serials || item.product_serials;

                // If item.quantity is provided, ensure it matches number of serials
                if (
                  typeof item.quantity !== 'undefined' &&
                  item.quantity !== null
                ) {
                  const declaredQty = parseInt(item.quantity, 10);
                  if (
                    !Number.isNaN(declaredQty) &&
                    declaredQty !== serialData.length
                  ) {
                    throw new Error(
                      `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
                    );
                  }
                }

                for (const serialInput of serialData) {
                  const serialNumber =
                    typeof serialInput === 'string'
                      ? serialInput
                      : serialInput.serial_number;

                  const existingSerial = await tx.serial_numbers.findUnique({
                    where: { serial_number: serialNumber },
                  });

                  if (!existingSerial)
                    throw new Error(`Serial ${serialNumber} not found`);

                  const vanItem = await tx.van_inventory_items.findFirst({
                    where: {
                      product_id: product.id,
                      serial_id: existingSerial.id,
                      quantity: { gt: 0 },
                      van_inventory_items_inventory: {
                        user_id: Number(inventoryData.user_id),
                        is_active: 'Y',
                      },
                    },
                  });

                  if (!vanItem) {
                    throw new Error(
                      `Serial ${serialNumber} not found in any van inventory`
                    );
                  }

                  console.log(
                    ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
                  );

                  const vanInventoryId = vanItem.parent_id;

                  // Decrement the original van inventory item quantity (remove this serial)
                  try {
                    const newVanQty = Math.max(0, (vanItem.quantity || 0) - 1);
                    await tx.van_inventory_items.update({
                      where: { id: vanItem.id },
                      data: {
                        quantity: newVanQty,
                        total_amount:
                          newVanQty * Number(vanItem.unit_price || 0),
                      },
                    });
                    console.log(
                      ` Updated van_inventory_items ID: ${vanItem.id}, quantity: ${vanItem.quantity}→${newVanQty}`
                    );
                  } catch (err) {
                    console.log(
                      ` Failed updating van_inventory_items ID ${vanItem.id}:`,
                      err
                    );
                  }

                  // Update serial status to available (or set appropriate status)
                  try {
                    await tx.serial_numbers.update({
                      where: { id: existingSerial.id },
                      data: {
                        status: 'available',
                        location_id: inventoryData.location_id || null,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });
                    console.log(
                      ` Updated serial ${serialNumber} status → available`
                    );
                  } catch (err) {
                    console.log(
                      ` Failed updating serial ${serialNumber} status:`,
                      err
                    );
                  }

                  const inventoryStock = await tx.inventory_stock.findFirst({
                    where: {
                      product_id: product.id,
                      serial_number_id: existingSerial.id,
                    },
                  });

                  if (inventoryStock) {
                    await tx.inventory_stock.update({
                      where: { id: inventoryStock.id },
                      data: {
                        current_stock: Math.max(
                          0,
                          (inventoryStock.current_stock || 0) - 1
                        ),
                        available_stock: Math.max(
                          0,
                          (inventoryStock.available_stock || 0) - 1
                        ),
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });
                    console.log(
                      ` DECREASED inventory_stock for ${serialNumber}`
                    );
                  }

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: existingSerial.id,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: 1,
                    remarks: `Sold serial ${serialNumber}`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });

                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: 1,
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: 1 * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      serial_id: existingSerial.id,
                    },
                  });
                }
              } else {
                //   const vanItem = await tx.van_inventory_items.findFirst({
                //     where: {
                //       parent_id: inventory.id,
                //       product_id: product.id,
                //       batch_lot_id: null,
                //       serial_id: null,
                //     },
                //   });

                const vanItem = await tx.van_inventory_items.findFirst({
                  where: {
                    product_id: product.id,
                    batch_lot_id: null,
                    serial_id: null,
                    van_inventory_items_inventory: {
                      user_id: Number(inventoryData.user_id),
                      is_active: 'Y',
                      loading_type: 'L',
                    },
                  },
                });

                if (!vanItem) throw new Error(`Product not found in van`);
                if (vanItem.quantity < qty)
                  throw new Error(`Insufficient van quantity`);

                // await tx.van_inventory_items.update({
                //   where: { id: vanItem.id },
                //   data: {
                //     quantity: vanItem.quantity - qty,
                //     total_amount:
                //       (vanItem.quantity - qty) *
                //       Number(vanItem.unit_price || 0),
                //   },
                // });

                const inventoryStock = await tx.inventory_stock.findFirst({
                  where: {
                    product_id: product.id,
                    location_id: inventoryData.location_id || 1,
                    batch_id: null,
                    serial_number_id: null,
                  },
                });

                if (inventoryStock) {
                  const prevCurrent = inventoryStock.current_stock ?? 0;
                  const prevAvailable = inventoryStock.available_stock ?? 0;
                  const newCurrent = Math.max(0, prevCurrent - qty);
                  const newAvailable = Math.max(0, prevAvailable - qty);
                  console.log(
                    `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} -${qty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
                  );
                  await tx.inventory_stock.update({
                    where: { id: inventoryStock.id },
                    data: {
                      current_stock: newCurrent,
                      available_stock: newAvailable,
                      updatedate: new Date(),
                      updatedby: userId,
                    },
                  });
                }

                await createStockMovement(tx, {
                  product_id: product.id,
                  batch_id: null,
                  serial_id: null,
                  movement_type: 'VAN_UNLOAD',
                  reference_type: 'VAN_INVENTORY',
                  reference_id: inventory.id,
                  from_location_id: null,
                  to_location_id: null,
                  quantity: qty,
                  remarks: `Sold ${qty} units from van`,
                  van_inventory_id: inventory.id,
                  createdby: userId,
                });

                await tx.van_inventory_items.create({
                  data: {
                    parent_id: inventory.id,
                    sap_lineid: item.sap_lineid || null,
                    product_id: product.id,
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name || 'pcs',
                    quantity: qty,
                    unit_price: Number(item.unit_price || 0),
                    discount_amount: Number(item.discount_amount || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    total_amount: qty * Number(item.unit_price || 0),
                    notes: item.notes || null,
                    batch_lot_id: null,
                    serial_id: null,
                  },
                });
              }
            }
          }
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
                    product_tax_master: true,
                    product_product_batches: {
                      include: {
                        batch_lot_product_batches: true,
                      },
                    },
                    serial_numbers_products: {
                      include: {
                        serial_numbers_customers: true,
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
      {
        maxWait: 60000,
        timeout: 1200000,
      }
    );
  },
};
