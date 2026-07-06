"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableBatchesForProduct = getAvailableBatchesForProduct;
exports.updateInventoryStock = updateInventoryStock;
exports.createStockMovement = createStockMovement;
exports.processVanInventoryItems = processVanInventoryItems;
exports.getContainerOwnerAndSelf = getContainerOwnerAndSelf;
exports.validateAndGetLocationId = validateAndGetLocationId;
exports.getOrderedQuantities = getOrderedQuantities;
exports.calculateStockDeduction = calculateStockDeduction;
exports.getContainerGroupUsers = getContainerGroupUsers;
async function getAvailableBatchesForProduct(tx, productId, loadingType) {
    const productBatches = await tx.product_batches.findMany({
        where: {
            product_id: productId,
            is_active: 'Y',
        },
        include: {
            batch_lot_product_batches: true,
        },
    });
    const batches = productBatches
        .filter((pb) => {
        const bl = pb.batch_lot_product_batches;
        if (!bl || bl.is_active !== 'Y')
            return false;
        if (new Date(bl.expiry_date) <= new Date())
            return false;
        if (loadingType === 'L' && bl.remaining_quantity <= 0)
            return false;
        return true;
    })
        .map((pb) => pb.batch_lot_product_batches)
        .sort((a, b) => {
        return (new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
    });
    return batches;
}
async function updateInventoryStock(tx, productId, locationId, quantity, loadingType, batchId, serialId, userId, vanUserId) {
    let validLocationId = locationId;
    let salespersonId = vanUserId || null;
    if (validLocationId === null || validLocationId === undefined) {
        const moshiDepot = await tx.depots.findFirst({
            where: { name: { contains: 'MOSHI' } },
        });
        validLocationId = moshiDepot ? moshiDepot.id : 1;
    }
    const whereClause = {
        product_id: productId,
        location_id: validLocationId,
    };
    if (batchId !== null)
        whereClause.batch_id = batchId;
    if (serialId !== null)
        whereClause.serial_number_id = serialId;
    const existingStock = await tx.inventory_stock.findFirst({
        where: whereClause,
    });
    if (loadingType === 'L') {
        if (existingStock) {
            await tx.inventory_stock.update({
                where: { id: existingStock.id },
                data: {
                    current_stock: (existingStock.current_stock ?? 0) + quantity,
                    available_stock: (existingStock.available_stock ?? 0) + quantity,
                    updatedate: new Date(),
                    updatedby: userId,
                },
            });
        }
        else {
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
    }
    else if (loadingType === 'U') {
        if (existingStock) {
            const newCurrentStock = Math.max(0, (existingStock.current_stock ?? 0) - quantity);
            const newAvailableStock = Math.max(0, (existingStock.available_stock ?? 0) - quantity);
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
    }
    else {
        throw new Error(`Invalid loading type: ${loadingType}`);
    }
}
async function createStockMovement(tx, data) {
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
async function processVanInventoryItems(tx, inventory, items, userId, loadingType, inventoryData) {
    let defaultLocationId = inventoryData.location_id;
    if (!defaultLocationId) {
        const moshiDepot = await tx.depots.findFirst({
            where: { name: { contains: 'MOSHI' } },
        });
        defaultLocationId = moshiDepot ? moshiDepot.id : 1;
    }
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
            const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
            if (loadingType === 'L') {
                if (trackingType === 'BATCH') {
                    const batchData = item.batches || item.product_batches;
                    if (!batchData ||
                        !Array.isArray(batchData) ||
                        batchData.length === 0) {
                        throw new Error(`Batches are required for batch-tracked product ${product.name}`);
                    }
                    for (const batchInput of batchData) {
                        const batchQty = parseInt(batchInput.quantity, 10) || 0;
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
                                    remaining_quantity: batchLot.remaining_quantity + batchQty,
                                    updatedate: new Date(),
                                },
                            });
                            console.log(` Updated batch_lots: ${batchLot.batch_number}`);
                        }
                        else {
                            batchLot = await tx.batch_lots.create({
                                data: {
                                    batch_number: batchInput.batch_number,
                                    lot_number: batchInput.lot_number || `LOT-${Date.now()}`,
                                    manufacturing_date: batchInput.manufacturing_date
                                        ? new Date(batchInput.manufacturing_date)
                                        : new Date(),
                                    expiry_date: batchInput.expiry_date
                                        ? new Date(batchInput.expiry_date)
                                        : new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                                    quantity: batchQty,
                                    remaining_quantity: batchQty,
                                    supplier_name: batchInput.supplier_name || null,
                                    purchase_price: batchInput.purchase_price || null,
                                    quality_grade: batchInput.quality_grade || 'A',
                                    storage_location: batchInput.storage_location || null,
                                    is_active: 'Y',
                                    createdate: new Date(),
                                    createdby: userId,
                                    log_inst: 1,
                                    productsId: product.id,
                                },
                            });
                            console.log(` Created batch_lots: ${batchLot.batch_number}`);
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
                        }
                        else {
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
                        const existingVanItem = await tx.van_inventory_items.findFirst({
                            where: {
                                parent_id: inventory.id,
                                product_id: product.id,
                                batch_lot_id: batchLot.id,
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
                                    quantity: newQuantity,
                                    total_amount: newQuantity * Number(product.base_price || 0),
                                },
                            });
                            console.log(` Updated van_inventory_items (ID: ${existingVanItem.id}): ${existingVanItem.quantity} → ${newQuantity}`);
                        }
                        else {
                            await tx.van_inventory_items.create({
                                data: {
                                    parent_id: inventory.id,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: product.product_unit_of_measurement?.name || 'pcs',
                                    quantity: batchQty,
                                    unit_price: Number(product.base_price || 0),
                                    discount_amount: Number(item.discount_amount || 0),
                                    tax_amount: Number(item.tax_amount || 0),
                                    total_amount: batchQty * Number(product.base_price || 0),
                                    notes: item.notes || null,
                                    batch_lot_id: batchLot.id,
                                },
                            });
                            console.log(` Created van_inventory_items`);
                        }
                        await updateInventoryStock(tx, product.id, inventoryData.location_id || null, batchQty, 'L', batchLot.id, null, userId, inventoryData.user_id);
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
                }
                else if (trackingType === 'SERIAL') {
                    const serialData = item.serials || item.product_serials;
                    if (!serialData ||
                        !Array.isArray(serialData) ||
                        serialData.length === 0) {
                        throw new Error(`Serial numbers are required for serial-tracked product "${product.name}"`);
                    }
                    console.log(` Product: ${product.name}, ID: ${product.id}`);
                    for (const serialInput of serialData) {
                        const serialNumber = typeof serialInput === 'string'
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
                                throw new Error(`Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`);
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
                            console.log(` Updated serial ${serialNumber} status → in_van`);
                        }
                        else {
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
                        const existingVanItem = await tx.van_inventory_items.findFirst({
                            where: {
                                parent_id: inventory.id,
                                product_id: product.id,
                                serial_id: existingSerial.id,
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
                                    quantity: newQuantity,
                                    total_amount: newQuantity * Number(product.base_price || 0),
                                },
                            });
                            console.log(` Updated van_inventory_items ID: ${existingVanItem.id}, quantity: ${existingVanItem.quantity}→${newQuantity}`);
                        }
                        else {
                            await tx.van_inventory_items.create({
                                data: {
                                    parent_id: inventory.id,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: product.product_unit_of_measurement?.name || 'pcs',
                                    quantity: 1,
                                    unit_price: Number(product.base_price || 0),
                                    discount_amount: Number(item.discount_amount || 0),
                                    tax_amount: Number(item.tax_amount || 0),
                                    total_amount: 1 * Number(product.base_price || 0),
                                    notes: item.notes || null,
                                    serial_id: existingSerial.id,
                                },
                            });
                            console.log(`Created new van_inventory_items for serial ${serialNumber}`);
                        }
                        await updateInventoryStock(tx, product.id, inventoryData.location_id || null, 1, 'L', null, existingSerial.id, userId, inventoryData.user_id);
                        console.log(` INCREASED inventory_stock for serial ${serialNumber}`);
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
                        console.log(` Created VAN_LOAD stock movement for ${serialNumber}`);
                    }
                }
                else {
                    // NONE tracking type
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
                                quantity: existingVanItem.quantity + qty,
                                total_amount: (existingVanItem.quantity + qty) *
                                    Number(product.base_price || 0),
                            },
                        });
                        console.log(`    Updated van_inventory_items: ${existingVanItem.quantity} → ${existingVanItem.quantity + qty}`);
                    }
                    else {
                        await tx.van_inventory_items.create({
                            data: {
                                parent_id: inventory.id,
                                product_id: product.id,
                                product_name: product.name,
                                unit: product.product_unit_of_measurement?.name || 'pcs',
                                quantity: qty,
                                unit_price: Number(product.base_price || 0),
                                discount_amount: Number(item.discount_amount || 0),
                                tax_amount: Number(item.tax_amount || 0),
                                total_amount: qty * Number(product.base_price || 0),
                                notes: item.notes || null,
                                batch_lot_id: null,
                                serial_id: null,
                            },
                        });
                        console.log(`    Created van_inventory_items`);
                    }
                    await updateInventoryStock(tx, product.id, inventoryData.location_id || null, qty, 'L', null, null, userId, inventoryData.user_id);
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
                    console.log(` Loaded ${qty} units of NONE-tracked product ${product.name}\n`);
                }
            }
            else if (loadingType === 'U') {
                if (trackingType === 'BATCH') {
                    const batchData = item.batches || item.product_batches;
                    if (!batchData ||
                        !Array.isArray(batchData) ||
                        batchData.length === 0) {
                        throw new Error(`Batches are required for batch-tracked product ${product.name}`);
                    }
                    for (const batchInput of batchData) {
                        const batchQty = parseInt(batchInput.quantity, 10) || 0;
                        const batchLot = await tx.batch_lots.findFirst({
                            where: {
                                batch_number: batchInput.batch_number,
                                productsId: product.id,
                                is_active: 'Y',
                                createdby: Number(inventoryData.user_id),
                            },
                        });
                        if (!batchLot)
                            throw new Error(`Batch ${batchInput.batch_number} not found`);
                        const vanItem = await tx.van_inventory_items.findFirst({
                            where: {
                                product_id: product.id,
                                batch_lot_id: batchLot.id,
                                van_inventory_items_inventory: {
                                    user_id: Number(inventoryData.user_id),
                                    is_active: 'Y',
                                },
                            },
                        });
                        if (!vanItem)
                            throw new Error(`Batch not found in van`);
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
                                location_id: defaultLocationId,
                                batch_id: batchLot.id,
                            },
                        });
                        if (inventoryStock) {
                            await tx.inventory_stock.update({
                                where: { id: inventoryStock.id },
                                data: {
                                    current_stock: (inventoryStock.current_stock || 0) - batchQty,
                                    available_stock: (inventoryStock.available_stock || 0) - batchQty,
                                    updatedate: new Date(),
                                    updatedby: userId,
                                },
                            });
                        }
                        await tx.van_inventory_items.create({
                            data: {
                                parent_id: inventory.id,
                                product_id: product.id,
                                product_name: product.name,
                                unit: product.product_unit_of_measurement?.name || 'pcs',
                                quantity: batchQty,
                                unit_price: Number(product.base_price || 0),
                                discount_amount: Number(item.discount_amount || 0),
                                tax_amount: Number(item.tax_amount || 0),
                                total_amount: batchQty * Number(product.base_price || 0),
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
                }
                else if (trackingType === 'SERIAL') {
                    const serialData = item.serials || item.product_serials;
                    if (!serialData ||
                        !Array.isArray(serialData) ||
                        serialData.length === 0) {
                        throw new Error(`Serial numbers are required for serial-tracked product "${product.name}"`);
                    }
                    for (const serialInput of serialData) {
                        const serialNumber = typeof serialInput === 'string'
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
                            throw new Error(`Serial ${serialNumber} not found in any van inventory`);
                        }
                        console.log(` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`);
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
                                    current_stock: Math.max(0, (inventoryStock.current_stock || 0) - 1),
                                    available_stock: Math.max(0, (inventoryStock.available_stock || 0) - 1),
                                    updatedate: new Date(),
                                    updatedby: userId,
                                },
                            });
                            console.log(` DECREASED inventory_stock for ${serialNumber}`);
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
                                product_id: product.id,
                                product_name: product.name,
                                unit: product.product_unit_of_measurement?.name || 'pcs',
                                quantity: 1,
                                unit_price: Number(product.base_price || 0),
                                discount_amount: Number(item.discount_amount || 0),
                                tax_amount: Number(item.tax_amount || 0),
                                total_amount: 1 * Number(product.base_price || 0),
                                notes: item.notes || null,
                                serial_id: existingSerial.id,
                            },
                        });
                    }
                }
                else {
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
                    if (!vanItem)
                        throw new Error(`Product not found in van`);
                    if (vanItem.quantity < qty)
                        throw new Error(`Insufficient van quantity`);
                    const inventoryStock = await tx.inventory_stock.findFirst({
                        where: {
                            product_id: product.id,
                            location_id: defaultLocationId,
                            batch_id: null,
                            serial_number_id: null,
                        },
                    });
                    if (inventoryStock) {
                        await tx.inventory_stock.update({
                            where: { id: inventoryStock.id },
                            data: {
                                current_stock: (inventoryStock.current_stock || 0) - qty,
                                available_stock: (inventoryStock.available_stock || 0) - qty,
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
                            product_id: product.id,
                            product_name: product.name,
                            unit: product.product_unit_of_measurement?.name || 'pcs',
                            quantity: qty,
                            unit_price: Number(product.base_price || 0),
                            discount_amount: Number(item.discount_amount || 0),
                            tax_amount: Number(item.tax_amount || 0),
                            total_amount: qty * Number(product.base_price || 0),
                            notes: item.notes || null,
                            batch_lot_id: null,
                            serial_id: null,
                        },
                    });
                }
            }
        }
    }
}
async function getContainerOwnerAndSelf(tx, userId) {
    const containerSub = await tx.van_inventory_sub_users.findFirst({
        where: {
            user_id: userId,
            is_active: 'Y',
            van_inventory: {
                sale_type: 'container',
                is_active: 'Y',
                status: 'A',
            },
        },
        include: {
            van_inventory: {
                select: { user_id: true },
            },
        },
    });
    if (containerSub?.van_inventory) {
        return Array.from(new Set([containerSub.van_inventory.user_id, userId]));
    }
    return [userId];
}
async function validateAndGetLocationId(tx, locationId) {
    if (!locationId) {
        return null;
    }
    try {
        const locationExists = await tx.warehouses.findUnique({
            where: { id: locationId },
            select: { id: true },
        });
        if (!locationExists) {
            console.warn(`Location ID ${locationId} not found in warehouses, using null`);
            return null;
        }
        return locationId;
    }
    catch (error) {
        console.warn(`Error validating location ${locationId}, using null:`, error);
        return null;
    }
}
function getOrderedQuantities(item) {
    const conversionFactor = Number(item.conversion_factor) || 1;
    const rawUnit = (item.uom || 'CASE').toUpperCase().trim();
    const PCS_VARIANTS = [
        'UNIT',
        'PC',
        'PIECE',
        'PIECES',
        'PSC',
        'PEC',
        'PCE',
        'PICS',
    ];
    const CASE_VARIANTS = [
        'CASE',
        'CASES',
        'CS',
        'CTN',
        'CARTON',
        'BOX',
        'BOXES',
    ];
    let normalizedUnit;
    if (PCS_VARIANTS.includes(rawUnit)) {
        normalizedUnit = 'UNIT';
    }
    else if (CASE_VARIANTS.includes(rawUnit)) {
        normalizedUnit = 'CASE';
    }
    else {
        console.warn(` Unknown unit "${rawUnit}" — defaulting to CASE`);
        normalizedUnit = 'CASE';
    }
    const quantityInCases = Number(item.quantity) || 0;
    const baseQuantityInPcs = Number(item.base_quantity) || 0;
    const isPcsUnit = normalizedUnit === 'UNIT';
    console.log(`Unit normalize: "${rawUnit}" → "${normalizedUnit}" | ` +
        `Cases: ${quantityInCases}, Pcs: ${baseQuantityInPcs}, CF: ${conversionFactor}`);
    if (isPcsUnit) {
        return {
            orderedQty: 0,
            orderedPieces: baseQuantityInPcs,
            conversionFactor,
            uom: normalizedUnit,
        };
    }
    else {
        return {
            orderedQty: quantityInCases,
            orderedPieces: quantityInCases * conversionFactor,
            conversionFactor,
            uom: normalizedUnit,
        };
    }
}
function calculateStockDeduction(currentCases, currentPcs, piecesToDeduct, conversionFactor, unit, orderedCases) {
    const cf = conversionFactor || 1;
    const unitUpper = (unit || 'CASE').toUpperCase();
    const isPcsUnit = ['UNIT', 'PC', 'PIECE', 'PIECES'].includes(unitUpper);
    const totalAvailablePieces = currentCases * cf + currentPcs;
    if (isPcsUnit) {
        if (piecesToDeduct > totalAvailablePieces) {
            return {
                newQuantity: -1,
                newBaseQuantity: 0,
                totalAvailablePieces,
                deductedPieces: piecesToDeduct,
            };
        }
        const remainingPieces = totalAvailablePieces - piecesToDeduct;
        const newCases = Math.floor(remainingPieces / cf);
        const newPcs = remainingPieces % cf;
        return {
            newQuantity: newCases,
            newBaseQuantity: newPcs,
            totalAvailablePieces,
            deductedPieces: piecesToDeduct,
        };
    }
    else {
        const casesToDeduct = orderedCases ?? Math.floor(piecesToDeduct / cf);
        if (casesToDeduct > currentCases) {
            return {
                newQuantity: -1,
                newBaseQuantity: currentPcs,
                totalAvailablePieces,
                deductedPieces: piecesToDeduct,
            };
        }
        return {
            newQuantity: currentCases - casesToDeduct,
            newBaseQuantity: currentPcs,
            totalAvailablePieces,
            deductedPieces: piecesToDeduct,
        };
    }
}
async function getContainerGroupUsers(tx, userId) {
    // 1. Check if userId is the main user of an active container van inventory
    const activeContainerAsMain = await tx.van_inventory.findFirst({
        where: {
            user_id: userId,
            sale_type: 'container',
            is_active: 'Y',
            status: 'A', // Confirmed/Approved
        },
        include: {
            van_inventory_sub_users: {
                where: { is_active: 'Y' },
                select: { user_id: true },
            },
        },
    });
    if (activeContainerAsMain) {
        const subUserIds = activeContainerAsMain.van_inventory_sub_users.map((su) => su.user_id);
        return [userId, ...subUserIds];
    }
    // 2. Check if userId is a sub-user in an active container van inventory
    const activeContainerAsSub = await tx.van_inventory_sub_users.findFirst({
        where: {
            user_id: userId,
            is_active: 'Y',
            van_inventory: {
                sale_type: 'container',
                is_active: 'Y',
                status: 'A',
            },
        },
        include: {
            van_inventory: {
                include: {
                    van_inventory_sub_users: {
                        where: { is_active: 'Y' },
                        select: { user_id: true },
                    },
                },
            },
        },
    });
    if (activeContainerAsSub?.van_inventory) {
        const mainUserId = activeContainerAsSub.van_inventory.user_id;
        const subUserIds = activeContainerAsSub.van_inventory.van_inventory_sub_users.map((su) => su.user_id);
        return [mainUserId, ...subUserIds];
    }
    // If not part of any container group, return just the userId
    return [userId];
}
//# sourceMappingURL=inventory.utils.js.map