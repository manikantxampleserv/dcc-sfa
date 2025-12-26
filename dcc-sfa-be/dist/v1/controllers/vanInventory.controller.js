"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vanInventoryController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeVanInventory = (item) => {
    return {
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        loading_type: item.loading_type,
        document_date: item.document_date,
        last_updated: item.last_updated,
        is_active: item.is_active,
        createdate: item.createdate,
        createdby: item.createdby,
        updatedate: item.updatedate,
        updatedby: item.updatedby,
        log_inst: item.log_inst,
        vehicle_id: item.vehicle_id,
        location_id: item.location_id,
        location_type: item.location_type,
        user: item.van_inventory_users
            ? {
                id: item.van_inventory_users.id,
                name: item.van_inventory_users.name,
                email: item.van_inventory_users.email,
            }
            : null,
        vehicle: item.vehicle
            ? {
                id: item.vehicle.id,
                vehicle_number: item.vehicle.vehicle_number,
                type: item.vehicle.type,
            }
            : null,
        depot: item.van_inventory_depot
            ? {
                id: item.van_inventory_depot.id,
                name: item.van_inventory_depot.name,
                code: item.van_inventory_depot.code,
            }
            : null,
        items: item.van_inventory_items_inventory?.map((it) => {
            let productBatch = null;
            let batchLot = null;
            let serialNumbers = null;
            if (it.batch_lot_id &&
                it.van_inventory_items_products?.product_product_batches) {
                productBatch =
                    it.van_inventory_items_products.product_product_batches.find((pb) => pb.batch_lot_id === it.batch_lot_id);
                if (productBatch?.batch_lot_product_batches) {
                    batchLot = productBatch.batch_lot_product_batches;
                }
            }
            if (it.van_inventory_items_products?.serial_numbers_products) {
                const serials = it.van_inventory_items_products.serial_numbers_products;
                if (serials && serials.length > 0) {
                    serialNumbers = serials.map((sn) => ({
                        id: sn.id,
                        serial_number: sn.serial_number,
                        status: sn.status,
                        warranty_expiry: sn.warranty_expiry || null,
                        batch_id: sn.batch_id || null,
                        customer_id: sn.customer_id || null,
                        customer: sn.serial_numbers_customers
                            ? {
                                id: sn.serial_numbers_customers.id,
                                name: sn.serial_numbers_customers.name,
                                email: sn.serial_numbers_customers.email,
                            }
                            : null,
                        sold_date: sn.sold_date || null,
                        created_date: sn.createdate || null,
                    }));
                }
            }
            const result = {
                id: it.id,
                parent_id: it.parent_id,
                product_id: it.product_id,
                product_name: it.product_name,
                unit: it.unit,
                quantity: it.quantity,
                unit_price: it.unit_price ? String(it.unit_price) : null,
                discount_amount: it.discount_amount
                    ? String(it.discount_amount)
                    : null,
                tax_amount: it.tax_amount ? String(it.tax_amount) : null,
                total_amount: it.total_amount ? String(it.total_amount) : null,
                notes: it.notes,
                batch_lot_id: it.batch_lot_id,
                batch_number: batchLot?.batch_number || null,
                lot_number: batchLot?.lot_number || null,
                expiry_date: batchLot?.expiry_date || null,
                product_remaining_quantity: productBatch?.quantity ?? null,
                batch_total_remaining_quantity: batchLot?.remaining_quantity ?? null,
                serial_numbers: serialNumbers && serialNumbers.length > 0 ? serialNumbers : null,
            };
            return result;
        }) || [],
    };
};
// async function updateBatchLotQuantity(
//   tx: any,
//   batchLotId: number,
//   quantity: number,
//   loadingType: string
// ): Promise<void> {
//   const batchLot = await tx.batch_lots.findUnique({
//     where: { id: batchLotId },
//   });
//   if (!batchLot) {
//     throw new Error(`Batch lot with ID ${batchLotId} not found`);
//   }
//   if (batchLot.is_active !== 'Y') {
//     throw new Error(`Batch lot ${batchLot.batch_number} is not active`);
//   }
//   if (new Date(batchLot.expiry_date) < new Date()) {
//     throw new Error(`Batch lot ${batchLot.batch_number} has expired`);
//   }
//   let newRemainingQuantity: number;
//   if (loadingType === 'L') {
//     newRemainingQuantity = batchLot.remaining_quantity - quantity;
//     if (newRemainingQuantity < 0) {
//       throw new Error(
//         `Insufficient quantity in batch ${batchLot.batch_number}. Available: ${batchLot.remaining_quantity}, Requested: ${quantity}`
//       );
//     }
//   } else if (loadingType === 'U') {
//     newRemainingQuantity = batchLot.remaining_quantity + quantity;
//     if (newRemainingQuantity > batchLot.quantity) {
//       throw new Error(
//         `Cannot return more than original quantity. Original: ${batchLot.quantity}, Attempted: ${newRemainingQuantity}`
//       );
//     }
//   } else {
//     throw new Error(`Invalid loading type: ${loadingType}`);
//   }
//   await tx.batch_lots.update({
//     where: { id: batchLotId },
//     data: {
//       remaining_quantity: newRemainingQuantity,
//       updatedate: new Date(),
//     },
//   });
// }
async function updateBatchLotQuantity(tx, batchLotId, // ← Allow null
quantity, loadingType) {
    if (!batchLotId) {
        throw new Error('batchLotId is required');
    }
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
    let newRemainingQuantity;
    if (loadingType === 'L') {
        newRemainingQuantity = batchLot.remaining_quantity + quantity;
    }
    else if (loadingType === 'U') {
        newRemainingQuantity = batchLot.remaining_quantity - quantity;
        if (newRemainingQuantity < 0) {
            throw new Error(`Insufficient quantity in batch ${batchLot.batch_number}. Available: ${batchLot.remaining_quantity}, Requested: ${quantity}`);
        }
    }
    else {
        throw new Error(`Invalid loading type: ${loadingType}`);
    }
    await tx.batch_lots.update({
        where: { id: batchLotId },
        data: {
            remaining_quantity: newRemainingQuantity,
            updatedate: new Date(),
        },
    });
}
async function reverseBatchLotQuantity(tx, batchLotId, quantity, loadingType) {
    const batchLot = await tx.batch_lots.findUnique({
        where: { id: batchLotId },
    });
    if (!batchLot) {
        console.warn(`Batch lot ${batchLotId} not found, skipping reversal`);
        return;
    }
    let newRemainingQuantity;
    if (loadingType === 'L') {
        newRemainingQuantity = Math.min(batchLot.remaining_quantity + quantity, batchLot.quantity);
    }
    else if (loadingType === 'U') {
        newRemainingQuantity = Math.max(batchLot.remaining_quantity - quantity, 0);
    }
    else {
        return;
    }
    await tx.batch_lots.update({
        where: { id: batchLotId },
        data: {
            remaining_quantity: newRemainingQuantity,
            updatedate: new Date(),
        },
    });
}
// async function updateProductBatchQuantity(
//   tx: any,
//   productId: number,
//   batchLotId: number,
//   quantity: number,
//   loadingType: string
// ): Promise<void> {
//   const productBatch = await tx.product_batches.findFirst({
//     where: {
//       product_id: productId,
//       batch_lot_id: batchLotId,
//       is_active: 'Y',
//     },
//   });
//   if (!productBatch) {
//     throw new Error(
//       `Product batch not found for product ${productId} and batch ${batchLotId}`
//     );
//   }
//   let newQuantity: number;
//   if (loadingType === 'L') {
//     newQuantity = productBatch.quantity - quantity;
//     if (newQuantity < 0) {
//       throw new Error(
//         `Insufficient quantity in product batch. Available: ${productBatch.quantity}, Requested: ${quantity}`
//       );
//     }
//   } else if (loadingType === 'U') {
//     newQuantity = productBatch.quantity + quantity;
//   } else {
//     throw new Error(`Invalid loading type: ${loadingType}`);
//   }
//   await tx.product_batches.update({
//     where: { id: productBatch.id },
//     data: {
//       quantity: newQuantity,
//       updatedate: new Date(),
//     },
//   });
// }
async function updateProductBatchQuantity(tx, productId, batchLotId, quantity, loadingType) {
    if (!batchLotId) {
        throw new Error('batchLotId is required');
    }
    const productBatch = await tx.product_batches.findFirst({
        where: {
            product_id: productId,
            batch_lot_id: batchLotId,
            is_active: 'Y',
        },
    });
    if (!productBatch) {
        throw new Error(`Product batch not found for product ${productId} and batch ${batchLotId}`);
    }
    let newQuantity;
    if (loadingType === 'L') {
        newQuantity = productBatch.quantity + quantity;
    }
    else if (loadingType === 'U') {
        newQuantity = productBatch.quantity - quantity;
        if (newQuantity < 0) {
            throw new Error(`Insufficient quantity in product batch. Available: ${productBatch.quantity}, Requested: ${quantity}`);
        }
    }
    else {
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
async function reverseProductBatchQuantity(tx, productId, batchLotId, quantity, loadingType) {
    const productBatch = await tx.product_batches.findFirst({
        where: {
            product_id: productId,
            batch_lot_id: batchLotId,
            is_active: 'Y',
        },
    });
    if (!productBatch) {
        console.warn(`Product batch not found for product ${productId} and batch ${batchLotId}, skipping reversal`);
        return;
    }
    let newQuantity;
    if (loadingType === 'L') {
        newQuantity = productBatch.quantity + quantity;
    }
    else if (loadingType === 'U') {
        newQuantity = Math.max(productBatch.quantity - quantity, 0);
    }
    else {
        return;
    }
    await tx.product_batches.update({
        where: { id: productBatch.id },
        data: {
            quantity: newQuantity,
            updatedate: new Date(),
        },
    });
}
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
async function createOrGetBatchForProduct(tx, productId, userId, batchData) {
    const existingBatch = await tx.batch_lots.findFirst({
        where: {
            productsId: productId,
            is_active: 'Y',
        },
    });
    if (existingBatch) {
        return existingBatch;
    }
    const product = await tx.products.findUnique({
        where: { id: productId },
        select: { code: true, name: true },
    });
    const batchNumber = batchData?.batch_number || `${product.code}-${Date.now()}`;
    const newBatch = await tx.batch_lots.create({
        data: {
            batch_number: batchNumber,
            lot_number: batchData?.lot_number || `LOT-${Date.now()}`,
            manufacturing_date: batchData?.manufacturing_date || new Date(),
            expiry_date: batchData?.expiry_date ||
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
async function updateInventoryStock(tx, productId, locationId, quantity, loadingType, batchId, serialId, userId) {
    const whereClause = {
        product_id: productId,
        location_id: locationId ?? 1,
    };
    if (batchId != null) {
        whereClause.batch_id = batchId;
    }
    if (serialId != null) {
        whereClause.serial_number_id = serialId;
    }
    const existingStock = await tx.inventory_stock.findFirst({
        where: whereClause,
    });
    let newCurrentStock;
    if (loadingType === 'L') {
        newCurrentStock = existingStock
            ? existingStock.current_stock + quantity
            : quantity;
    }
    else if (loadingType === 'U') {
        newCurrentStock = existingStock
            ? existingStock.current_stock - quantity
            : -quantity;
        if (newCurrentStock < 0) {
            throw new Error(`Insufficient inventory stock. Available: ${existingStock?.current_stock || 0}, Requested: ${quantity}`);
        }
    }
    else {
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
    }
    else {
        await tx.inventory_stock.create({
            data: {
                product_id: productId,
                location_id: locationId || 1,
                current_stock: newCurrentStock,
                reserved_stock: 0,
                available_stock: newCurrentStock,
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
async function createOrUpdateSerialNumber(tx, productId, serialData, // ✅ Accept object
batchId, locationId, loadingType, userId) {
    // ✅ Handle both string and object formats
    const serialNumber = typeof serialData === 'string' ? serialData : serialData.serial_number;
    const warrantyExpiry = typeof serialData === 'object' ? serialData.warranty_expiry : null;
    const customerId = typeof serialData === 'object' ? serialData.customer_id : null;
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
                warranty_expiry: warrantyExpiry ? new Date(warrantyExpiry) : null, // ✅ Add warranty
                customer_id: customerId || null, // ✅ Add customer
                is_active: 'Y',
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
            },
        });
    }
    else if (loadingType === 'U') {
        // Unload: Update existing serial
        if (!existingSerial) {
            throw new Error(`Serial number ${serialNumber} not found`);
        }
        if (existingSerial.status !== 'in_van') {
            throw new Error(`Serial number ${serialNumber} is not available for unloading. Status: ${existingSerial.status}`);
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
exports.vanInventoryController = {
    async getAvailableBatches(req, res) {
        try {
            const { productId } = req.params;
            const { loading_type } = req.query;
            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            const product = await prisma_client_1.default.products.findUnique({
                where: { id: Number(productId) },
            });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const batches = await prisma_client_1.default.$transaction(async (tx) => {
                return await getAvailableBatchesForProduct(tx, Number(productId), loading_type || 'L');
            });
            res.json({
                success: true,
                message: 'Available batches retrieved successfully',
                data: batches.map(batch => ({
                    id: batch.id,
                    batch_number: batch.batch_number,
                    lot_number: batch.lot_number,
                    expiry_date: batch.expiry_date,
                    quantity: batch.quantity,
                    remaining_quantity: batch.remaining_quantity,
                    is_active: batch.is_active,
                })),
            });
        }
        catch (error) {
            console.error('Get Available Batches Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    // async createOrUpdateVanInventory(req: Request, res: Response) {
    //   const data = req.body;
    //   const userId = (req as any).user?.id || 1;
    //   const { van_inventory_items, inventoryItems, ...inventoryData } = data;
    //   const items = van_inventory_items || inventoryItems || [];
    //   let inventoryId = inventoryData.id;
    //   try {
    //     const result = await prisma.$transaction(
    //       async tx => {
    //         let inventory;
    //         let isUpdate = false;
    //         let previousLoadingType: string | null = null;
    //         let previousItems: any[] = [];
    //         if (inventoryId) {
    //           const existing = await tx.van_inventory.findUnique({
    //             where: { id: Number(inventoryId) },
    //             include: { van_inventory_items_inventory: true },
    //           });
    //           if (existing) {
    //             isUpdate = true;
    //             previousLoadingType = existing.loading_type;
    //             previousItems = existing.van_inventory_items_inventory;
    //           }
    //         }
    //         if (!inventoryData.user_id) {
    //           throw new Error('user_id is required');
    //         }
    //         const userExists = await tx.users.findUnique({
    //           where: { id: Number(inventoryData.user_id) },
    //         });
    //         if (!userExists) {
    //           throw new Error(`User ${inventoryData.user_id} not found`);
    //         }
    //         if (inventoryData.vehicle_id) {
    //           const vehicleExists = await tx.vehicles.findUnique({
    //             where: { id: Number(inventoryData.vehicle_id) },
    //           });
    //           if (!vehicleExists) {
    //             throw new Error(`Vehicle ${inventoryData.vehicle_id} not found`);
    //           }
    //         }
    //         const loadingType = inventoryData.loading_type || 'L';
    //         const payload = {
    //           user_id: Number(inventoryData.user_id),
    //           status: inventoryData.status || 'A',
    //           loading_type: loadingType,
    //           document_date:
    //             inventoryData.document_date &&
    //             inventoryData.document_date.trim() !== ''
    //               ? new Date(inventoryData.document_date)
    //               : new Date(),
    //           vehicle_id: inventoryData.vehicle_id
    //             ? Number(inventoryData.vehicle_id)
    //             : null,
    //           location_type: inventoryData.location_type || 'van',
    //           location_id: inventoryData.location_id
    //             ? Number(inventoryData.location_id)
    //             : null,
    //           is_active: inventoryData.is_active || 'Y',
    //         };
    //         if (isUpdate && previousItems.length > 0 && previousLoadingType) {
    //           console.log('Reversing previous inventory quantities...');
    //           for (const prevItem of previousItems) {
    //             if (prevItem.batch_lot_id && prevItem.quantity) {
    //               await reverseBatchLotQuantity(
    //                 tx,
    //                 prevItem.batch_lot_id,
    //                 prevItem.quantity,
    //                 previousLoadingType
    //               );
    //               await reverseProductBatchQuantity(
    //                 tx,
    //                 prevItem.product_id,
    //                 prevItem.batch_lot_id,
    //                 prevItem.quantity,
    //                 previousLoadingType
    //               );
    //               console.log(
    //                 `Reversed: Product ${prevItem.product_id}, Batch ${prevItem.batch_lot_id}, Qty ${prevItem.quantity}`
    //               );
    //             }
    //           }
    //         }
    //         if (isUpdate && inventoryId) {
    //           inventory = await tx.van_inventory.update({
    //             where: { id: Number(inventoryId) },
    //             data: {
    //               ...payload,
    //               updatedby: userId,
    //               updatedate: new Date(),
    //               log_inst: { increment: 1 },
    //             },
    //           });
    //         } else {
    //           inventory = await tx.van_inventory.create({
    //             data: {
    //               ...payload,
    //               createdby: userId,
    //               createdate: new Date(),
    //               log_inst: 1,
    //             },
    //           });
    //           inventoryId = inventory.id;
    //         }
    //         const processedItemIds: number[] = [];
    //         if (Array.isArray(items) && items.length > 0) {
    //           const itemsToCreate: any[] = [];
    //           const itemsToUpdate: { id: number; data: any }[] = [];
    //           for (const item of items) {
    //             const qty = parseInt(item.quantity, 10) || 0;
    //             if (qty <= 0) {
    //               throw new Error('Quantity must be greater than 0');
    //             }
    //             if (!item.product_id) {
    //               throw new Error('product_id is required for each item');
    //             }
    //             if (!item.batch_lot_id) {
    //               throw new Error(
    //                 `batch_lot_id is required for product ${item.product_id}`
    //               );
    //             }
    //             const product = await tx.products.findUnique({
    //               where: { id: Number(item.product_id) },
    //               include: { product_unit_of_measurement: true },
    //             });
    //             if (!product) {
    //               throw new Error(`Product ${item.product_id} not found`);
    //             }
    //             const productBatch = await tx.product_batches.findFirst({
    //               where: {
    //                 product_id: Number(item.product_id),
    //                 batch_lot_id: Number(item.batch_lot_id),
    //                 is_active: 'Y',
    //               },
    //               include: {
    //                 batch_lot_product_batches: true,
    //               },
    //             });
    //             if (!productBatch) {
    //               throw new Error(
    //                 `Batch ${item.batch_lot_id} is not associated with product "${product.name}"`
    //               );
    //             }
    //             const batchLot = productBatch.batch_lot_product_batches;
    //             if (!batchLot || batchLot.is_active !== 'Y') {
    //               throw new Error(`Selected batch is not active`);
    //             }
    //             if (new Date(batchLot.expiry_date) <= new Date()) {
    //               throw new Error(
    //                 `Batch ${batchLot.batch_number} has expired on ${batchLot.expiry_date}`
    //               );
    //             }
    //             if (loadingType === 'L') {
    //               if (productBatch.quantity < qty) {
    //                 throw new Error(
    //                   `Insufficient quantity in product batch "${product.name}" - Batch ${batchLot.batch_number}. Available: ${productBatch.quantity}, Requested: ${qty}`
    //                 );
    //               }
    //               if (batchLot.remaining_quantity < qty) {
    //                 throw new Error(
    //                   `Insufficient quantity in batch lot ${batchLot.batch_number}. Available: ${batchLot.remaining_quantity}, Requested: ${qty}`
    //                 );
    //               }
    //             }
    //             const itemData = {
    //               parent_id: inventory.id,
    //               product_id: Number(item.product_id),
    //               product_name: product.name,
    //               unit:
    //                 product.product_unit_of_measurement?.name ||
    //                 product.product_unit_of_measurement?.symbol ||
    //                 'pcs',
    //               quantity: qty,
    //               unit_price: Number(item.unit_price) || 0,
    //               discount_amount: Number(item.discount_amount) || 0,
    //               tax_amount: Number(item.tax_amount) || 0,
    //               total_amount:
    //                 qty * (Number(item.unit_price) || 0) -
    //                 (Number(item.discount_amount) || 0) +
    //                 (Number(item.tax_amount) || 0),
    //               notes: item.notes || null,
    //               batch_lot_id: Number(item.batch_lot_id),
    //             };
    //             if (item.id) {
    //               const existingItem = await tx.van_inventory_items.findFirst({
    //                 where: { id: Number(item.id), parent_id: inventory.id },
    //               });
    //               if (existingItem) {
    //                 itemsToUpdate.push({ id: Number(item.id), data: itemData });
    //                 processedItemIds.push(Number(item.id));
    //               } else {
    //                 itemsToCreate.push(itemData);
    //               }
    //             } else {
    //               itemsToCreate.push(itemData);
    //             }
    //             await updateBatchLotQuantity(
    //               tx,
    //               Number(item.batch_lot_id),
    //               qty,
    //               loadingType
    //             );
    //             await updateProductBatchQuantity(
    //               tx,
    //               Number(item.product_id),
    //               Number(item.batch_lot_id),
    //               qty,
    //               loadingType
    //             );
    //             console.log(
    //               `Processed: Product ${item.product_id}, Batch ${item.batch_lot_id}, Qty ${qty}, Type ${loadingType}`
    //             );
    //           }
    //           if (itemsToCreate.length > 0) {
    //             await tx.van_inventory_items.createMany({ data: itemsToCreate });
    //             const newItems = await tx.van_inventory_items.findMany({
    //               where: { parent_id: inventory.id },
    //               orderBy: { id: 'desc' },
    //               take: itemsToCreate.length,
    //             });
    //             processedItemIds.push(...newItems.map(i => i.id));
    //           }
    //           for (const { id, data } of itemsToUpdate) {
    //             await tx.van_inventory_items.update({ where: { id }, data });
    //           }
    //           if (isUpdate) {
    //             await tx.van_inventory_items.deleteMany({
    //               where: {
    //                 parent_id: inventory.id,
    //                 ...(processedItemIds.length > 0
    //                   ? { id: { notIn: processedItemIds } }
    //                   : {}),
    //               },
    //             });
    //           }
    //         } else if (isUpdate) {
    //           await tx.van_inventory_items.deleteMany({
    //             where: { parent_id: inventory.id },
    //           });
    //         }
    //         const finalInventory = await tx.van_inventory.findUnique({
    //           where: { id: inventory.id },
    //           include: {
    //             van_inventory_users: true,
    //             vehicle: true,
    //             van_inventory_depot: true,
    //             van_inventory_items_inventory: {
    //               include: {
    //                 van_inventory_items_products: {
    //                   include: {
    //                     product_unit_of_measurement: true,
    //                     product_product_batches: {
    //                       include: {
    //                         batch_lot_product_batches: true,
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //             van_inventory_stock_movements: true,
    //           },
    //         });
    //         return { finalInventory, wasUpdate: isUpdate };
    //       },
    //       { maxWait: 15000, timeout: 45000 }
    //     );
    //     const finalInventory = (result as any).finalInventory;
    //     const wasUpdate = (result as any).wasUpdate === true;
    //     res.status(wasUpdate ? 200 : 201).json({
    //       message: wasUpdate
    //         ? 'Van Inventory updated successfully'
    //         : 'Van Inventory created successfully',
    //       data: serializeVanInventory(finalInventory),
    //     });
    //   } catch (error: any) {
    //     console.error('Create/Update Van Inventory Error:', error);
    //     const badRequestKeywords = [
    //       'required',
    //       'not found',
    //       'Insufficient',
    //       'expired',
    //       'not active',
    //       'Invalid',
    //       'must be',
    //       'not associated',
    //     ];
    //     if (badRequestKeywords.some(kw => error.message?.includes(kw))) {
    //       return res.status(400).json({ message: error.message });
    //     }
    //     return res.status(500).json({
    //       message: 'Failed to process van inventory',
    //       error: error.message,
    //     });
    //   }
    // },
    async createOrUpdateVanInventory(req, res) {
        const data = req.body;
        const userId = req.user?.id || 1;
        const { van_inventory_items, inventoryItems, ...inventoryData } = data;
        const items = van_inventory_items || inventoryItems || [];
        let inventoryId = inventoryData.id;
        try {
            const result = await prisma_client_1.default.$transaction(async (tx) => {
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
                    document_date: inventoryData.document_date &&
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
                }
                else {
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
                const processedItemIds = [];
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
                        let batchId = null;
                        let serialId = null;
                        if (trackingType === 'batch') {
                            let batch;
                            if (loadingType === 'L') {
                                batch = await createOrGetBatchForProduct(tx, product.id, userId, item.product_batches);
                                batchId = batch.id;
                                await updateBatchLotQuantity(tx, batchId, qty, loadingType);
                                await updateProductBatchQuantity(tx, product.id, batchId, qty, loadingType);
                            }
                            else if (loadingType === 'U') {
                                if (!item.batch_lot_id) {
                                    throw new Error(`batch_lot_id is required for unloading product ${product.name}`);
                                }
                                batchId = Number(item.batch_lot_id);
                                await updateBatchLotQuantity(tx, batchId, qty, loadingType);
                                await updateProductBatchQuantity(tx, product.id, batchId, qty, loadingType);
                            }
                            await updateInventoryStock(tx, product.id, payload.location_id ?? null, qty, loadingType, batchId ?? null, null, userId);
                            await createStockMovement(tx, {
                                product_id: product.id,
                                batch_id: batchId ?? null,
                                movement_type: loadingType === 'L' ? 'load' : 'unload',
                                reference_type: 'van_inventory',
                                reference_id: inventory.id,
                                from_location_id: loadingType === 'L' ? (payload.location_id ?? null) : null,
                                to_location_id: loadingType === 'U' ? (payload.location_id ?? null) : null,
                                quantity: qty,
                                remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'}`,
                                van_inventory_id: inventory.id,
                                createdby: userId,
                            });
                            await createStockMovement(tx, {
                                product_id: product.id,
                                batch_id: batchId,
                                movement_type: loadingType === 'L' ? 'load' : 'unload',
                                reference_type: 'van_inventory',
                                reference_id: inventory.id,
                                from_location_id: loadingType === 'L' ? payload.location_id : null,
                                to_location_id: loadingType === 'U' ? payload.location_id : null,
                                quantity: qty,
                                remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'}`,
                                van_inventory_id: inventory.id,
                                createdby: userId,
                            });
                        }
                        else if (trackingType === 'serial') {
                            if (!item.product_serials ||
                                !Array.isArray(item.product_serials)) {
                                throw new Error(`serial_numbers array is required for product ${product.name}`);
                            }
                            if (item.product_serials.length !== qty) {
                                throw new Error(`Number of serial numbers (${item.product_serials.length}) must match quantity ${qty}`);
                            }
                            for (const serialData of item.product_serials) {
                                const serial = await createOrUpdateSerialNumber(tx, product.id, serialData, item.batch_lot_id || null, payload.location_id, loadingType, userId);
                                serialId = serial.id;
                                await updateInventoryStock(tx, product.id, payload.location_id, 1, loadingType, null, serialId, userId);
                                await createStockMovement(tx, {
                                    product_id: product.id,
                                    serial_id: serialId,
                                    movement_type: loadingType === 'L' ? 'load' : 'unload',
                                    reference_type: 'van_inventory',
                                    reference_id: inventory.id,
                                    from_location_id: loadingType === 'L' ? payload.location_id : null,
                                    to_location_id: loadingType === 'U' ? payload.location_id : null,
                                    quantity: 1,
                                    remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'} - Serial: ${typeof serialData === 'string' ? serialData : serialData.serial_number}`,
                                    van_inventory_id: inventory.id,
                                    createdby: userId,
                                });
                            }
                        }
                        else {
                            await updateInventoryStock(tx, product.id, payload.location_id ?? null, qty, loadingType, batchId === null ? null : batchId, null, userId);
                            await createStockMovement(tx, {
                                product_id: product.id,
                                batch_id: batchId ?? null,
                                movement_type: loadingType === 'L' ? 'load' : 'unload',
                                reference_type: 'van_inventory',
                                reference_id: inventory.id,
                                from_location_id: loadingType === 'L' ? (payload.location_id ?? null) : null,
                                to_location_id: loadingType === 'U' ? (payload.location_id ?? null) : null,
                                quantity: qty,
                                remarks: `Van inventory ${loadingType === 'L' ? 'load' : 'unload'}`,
                                van_inventory_id: inventory.id,
                                createdby: userId,
                            });
                        }
                        const itemData = {
                            parent_id: inventory.id,
                            product_id: Number(item.product_id),
                            product_name: product.name,
                            unit: product.product_unit_of_measurement?.name ||
                                product.product_unit_of_measurement?.symbol ||
                                'pcs',
                            quantity: qty,
                            unit_price: Number(item.unit_price) || 0,
                            discount_amount: Number(item.discount_amount) || 0,
                            tax_amount: Number(item.tax_amount) || 0,
                            total_amount: qty * (Number(item.unit_price) || 0) -
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
                            }
                            else {
                                const newItem = await tx.van_inventory_items.create({
                                    data: itemData,
                                });
                                processedItemIds.push(newItem.id);
                            }
                        }
                        else {
                            const newItem = await tx.van_inventory_items.create({
                                data: itemData,
                            });
                            processedItemIds.push(newItem.id);
                        }
                        console.log(`Processed: Product ${item.product_id}, Type ${trackingType}, Batch ${batchId}, Serial ${serialId}, Qty ${qty}, Loading ${loadingType}`);
                    }
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
                }
                else if (isUpdate) {
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
                                        serial_numbers_products: {
                                            where: {
                                                is_active: 'Y',
                                                status: 'in_van',
                                            },
                                            select: {
                                                id: true,
                                                serial_number: true,
                                                status: true,
                                                warranty_expiry: true,
                                                batch_id: true,
                                                customer_id: true,
                                                sold_date: true,
                                                location_id: true,
                                                createdate: true,
                                                serial_numbers_customers: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        email: true,
                                                    },
                                                },
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
            }, { maxWait: 15000, timeout: 45000 });
            const finalInventory = result.finalInventory;
            const wasUpdate = result.wasUpdate === true;
            res.status(wasUpdate ? 200 : 201).json({
                message: wasUpdate
                    ? 'Van Inventory updated successfully'
                    : 'Van Inventory created successfully',
                data: serializeVanInventory(finalInventory),
            });
        }
        catch (error) {
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
    async getAllVanInventory(req, res) {
        try {
            const { page, limit, search, status, user_id } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { van_inventory_users: { name: { contains: searchLower } } },
                        { vehicle: { vehicle_number: { contains: searchLower } } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
                ...(user_id && { user_id: parseInt(user_id, 10) }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.van_inventory,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
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
                                        where: {
                                            is_active: 'Y',
                                        },
                                        include: {
                                            batch_lot_product_batches: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    van_inventory_stock_movements: true,
                },
            });
            const [totalVanInventory, activeVanInventory, inactiveVanInventory, vanInventoryThisMonth,] = await Promise.all([
                prisma_client_1.default.van_inventory.count(),
                prisma_client_1.default.van_inventory.count({ where: { is_active: 'Y' } }),
                prisma_client_1.default.van_inventory.count({ where: { is_active: 'N' } }),
                prisma_client_1.default.van_inventory.count({
                    where: {
                        createdate: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                        },
                    },
                }),
            ]);
            const serializedData = data.map((v) => serializeVanInventory(v));
            res.success('Van inventory fetched successfully', serializedData, 200, pagination, {
                total_records: totalVanInventory,
                active_records: activeVanInventory,
                inactive_records: inactiveVanInventory,
                van_inventory_this_month: vanInventoryThisMonth,
            });
        }
        catch (error) {
            console.error('Get Van Inventory Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getVanInventoryById(req, res) {
        try {
            const { id } = req.params;
            const record = await prisma_client_1.default.van_inventory.findUnique({
                where: { id: Number(id) },
                include: {
                    van_inventory_users: true,
                    van_inventory_depot: true,
                    van_inventory_stock_movements: true,
                    van_inventory_items_inventory: {
                        include: {
                            van_inventory_items_products: {
                                include: {
                                    product_unit_of_measurement: true,
                                    product_product_batches: {
                                        where: {
                                            is_active: 'Y',
                                        },
                                        include: {
                                            batch_lot_product_batches: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    vehicle: true,
                },
            });
            if (!record)
                return res.status(404).json({ message: 'Van inventory not found' });
            res.json({
                message: 'Van inventory fetched successfully',
                data: serializeVanInventory(record),
            });
        }
        catch (error) {
            console.error('Get Van Inventory by ID Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateVanInventory(req, res) {
        try {
            const { id } = req.params;
            const { van_inventory_items, ...inventoryData } = req.body;
            const userId = req.user?.id || 1;
            const existing = await prisma_client_1.default.van_inventory.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Van inventory not found' });
            const payload = {
                updatedby: userId,
                updatedate: new Date(),
                log_inst: { increment: 1 },
            };
            if (inventoryData.user_id !== undefined) {
                payload.user_id = Number(inventoryData.user_id);
            }
            if (inventoryData.status !== undefined) {
                payload.status = inventoryData.status;
            }
            if (inventoryData.loading_type !== undefined) {
                payload.loading_type = inventoryData.loading_type;
            }
            if (inventoryData.document_date !== undefined) {
                payload.document_date =
                    inventoryData.document_date &&
                        inventoryData.document_date.trim() !== ''
                        ? new Date(inventoryData.document_date)
                        : new Date();
            }
            if (inventoryData.vehicle_id !== undefined) {
                payload.vehicle_id = inventoryData.vehicle_id
                    ? Number(inventoryData.vehicle_id)
                    : null;
            }
            if (inventoryData.location_type !== undefined) {
                payload.location_type = inventoryData.location_type;
            }
            if (inventoryData.location_id !== undefined) {
                payload.location_id = inventoryData.location_id
                    ? Number(inventoryData.location_id)
                    : null;
            }
            if (inventoryData.is_active !== undefined) {
                payload.is_active = inventoryData.is_active;
            }
            const updated = await prisma_client_1.default.van_inventory.update({
                where: { id: Number(id) },
                data: payload,
                include: {
                    van_inventory_users: true,
                    vehicle: true,
                    van_inventory_depot: true,
                    van_inventory_items_inventory: true,
                },
            });
            res.json({
                message: 'Van inventory updated successfully',
                data: serializeVanInventory(updated),
            });
        }
        catch (error) {
            console.error('Update Van Inventory Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteVanInventory(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.van_inventory.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Van inventory not found' });
            await prisma_client_1.default.van_inventory.delete({ where: { id: Number(id) } });
            res.json({ message: 'Van inventory deleted successfully' });
        }
        catch (error) {
            console.error('Delete Van Inventory Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async createVanInventoryItem(req, res) {
        try {
            const { vanInventoryId } = req.params;
            const data = req.body;
            if (!data.product_id) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            if (!data.quantity) {
                return res.status(400).json({ message: 'Quantity is required' });
            }
            if (!data.unit_price) {
                return res.status(400).json({ message: 'Unit price is required' });
            }
            const vanInventory = await prisma_client_1.default.van_inventory.findUnique({
                where: { id: Number(vanInventoryId) },
            });
            if (!vanInventory) {
                return res.status(404).json({ message: 'Van inventory not found' });
            }
            const product = await prisma_client_1.default.products.findUnique({
                where: { id: Number(data.product_id) },
                include: {
                    product_unit_of_measurement: true,
                },
            });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const vanInventoryItem = await prisma_client_1.default.van_inventory_items.create({
                data: {
                    parent_id: Number(vanInventoryId),
                    product_id: Number(data.product_id),
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name ||
                        product.product_unit_of_measurement?.symbol ||
                        'pcs',
                    quantity: Number(data.quantity),
                    unit_price: Number(data.unit_price),
                    discount_amount: Number(data.discount_amount) || 0,
                    tax_amount: Number(data.tax_amount) || 0,
                    total_amount: Number(data.quantity) * Number(data.unit_price) -
                        (Number(data.discount_amount) || 0) +
                        (Number(data.tax_amount) || 0),
                    notes: data.notes || null,
                },
                include: {
                    van_inventory_items_products: true,
                },
            });
            res.status(201).json({
                success: true,
                message: 'Van inventory item created successfully',
                data: vanInventoryItem,
            });
        }
        catch (error) {
            console.error('Create Van Inventory Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getVanInventoryItems(req, res) {
        try {
            const { vanInventoryId } = req.params;
            const vanInventoryItems = await prisma_client_1.default.van_inventory_items.findMany({
                where: { parent_id: Number(vanInventoryId) },
                include: {
                    van_inventory_items_products: {
                        include: {
                            product_unit_of_measurement: true,
                        },
                    },
                },
                orderBy: { id: 'asc' },
            });
            res.json({
                success: true,
                message: 'Van inventory items retrieved successfully',
                data: vanInventoryItems,
            });
        }
        catch (error) {
            console.error('Get Van Inventory Items Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateVanInventoryItem(req, res) {
        try {
            const { vanInventoryId, itemId } = req.params;
            const data = req.body;
            const existingItem = await prisma_client_1.default.van_inventory_items.findFirst({
                where: {
                    id: Number(itemId),
                    parent_id: Number(vanInventoryId),
                },
            });
            if (!existingItem) {
                return res
                    .status(404)
                    .json({ message: 'Van inventory item not found' });
            }
            const vanInventoryItem = await prisma_client_1.default.van_inventory_items.update({
                where: { id: Number(itemId) },
                data: {
                    quantity: data.quantity ? Number(data.quantity) : undefined,
                    unit_price: data.unit_price ? Number(data.unit_price) : undefined,
                    discount_amount: data.discount_amount !== undefined
                        ? Number(data.discount_amount)
                        : undefined,
                    tax_amount: data.tax_amount !== undefined ? Number(data.tax_amount) : undefined,
                    total_amount: data.quantity && data.unit_price
                        ? Number(data.quantity) * Number(data.unit_price) -
                            (Number(data.discount_amount) || 0) +
                            (Number(data.tax_amount) || 0)
                        : undefined,
                    notes: data.notes !== undefined ? data.notes : undefined,
                },
                include: {
                    van_inventory_items_products: true,
                },
            });
            res.json({
                success: true,
                message: 'Van inventory item updated successfully',
                data: vanInventoryItem,
            });
        }
        catch (error) {
            console.error('Update Van Inventory Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteVanInventoryItem(req, res) {
        try {
            const { vanInventoryId, itemId } = req.params;
            const existingItem = await prisma_client_1.default.van_inventory_items.findFirst({
                where: {
                    id: Number(itemId),
                    parent_id: Number(vanInventoryId),
                },
            });
            if (!existingItem) {
                return res
                    .status(404)
                    .json({ message: 'Van inventory item not found' });
            }
            await prisma_client_1.default.van_inventory_items.delete({
                where: { id: Number(itemId) },
            });
            res.json({
                success: true,
                message: 'Van inventory item deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete Van Inventory Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async bulkUpdateVanInventoryItems(req, res) {
        try {
            const { vanInventoryId } = req.params;
            const { vanInventoryItems } = req.body;
            if (!Array.isArray(vanInventoryItems)) {
                return res
                    .status(400)
                    .json({ message: 'Van inventory items must be an array' });
            }
            const vanInventory = await prisma_client_1.default.van_inventory.findUnique({
                where: { id: Number(vanInventoryId) },
            });
            if (!vanInventory) {
                return res.status(404).json({ message: 'Van inventory not found' });
            }
            const result = await prisma_client_1.default.$transaction(async (tx) => {
                await tx.van_inventory_items.deleteMany({
                    where: { parent_id: Number(vanInventoryId) },
                });
                const newVanInventoryItems = [];
                for (const item of vanInventoryItems) {
                    if (item.product_id && item.quantity && item.unit_price) {
                        const product = await tx.products.findUnique({
                            where: { id: Number(item.product_id) },
                            include: {
                                product_unit_of_measurement: true,
                            },
                        });
                        if (product) {
                            const vanInventoryItem = await tx.van_inventory_items.create({
                                data: {
                                    parent_id: Number(vanInventoryId),
                                    product_id: Number(item.product_id),
                                    product_name: product.name,
                                    unit: product.product_unit_of_measurement?.name ||
                                        product.product_unit_of_measurement?.symbol ||
                                        'pcs',
                                    quantity: Number(item.quantity),
                                    unit_price: Number(item.unit_price),
                                    discount_amount: Number(item.discount_amount) || 0,
                                    tax_amount: Number(item.tax_amount) || 0,
                                    total_amount: Number(item.quantity) * Number(item.unit_price) -
                                        (Number(item.discount_amount) || 0) +
                                        (Number(item.tax_amount) || 0),
                                    notes: item.notes || null,
                                },
                            });
                            newVanInventoryItems.push(vanInventoryItem);
                        }
                    }
                }
                return newVanInventoryItems;
            });
            res.json({
                success: true,
                message: 'Van inventory items updated successfully',
                data: result,
            });
        }
        catch (error) {
            console.error('Bulk Update Van Inventory Items Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductBatches(req, res) {
        try {
            const { productId } = req.params;
            const { loading_type, include_expired, sort_by } = req.query;
            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            const product = await prisma_client_1.default.products.findUnique({
                where: { id: Number(productId) },
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const productBatches = await prisma_client_1.default.product_batches.findMany({
                where: {
                    product_id: Number(productId),
                    is_active: 'Y',
                },
                include: {
                    batch_lot_product_batches: true,
                },
                orderBy: {
                    id: 'asc',
                },
            });
            let batches = productBatches
                .filter((pb) => {
                const batchLot = pb.batch_lot_product_batches;
                if (!batchLot)
                    return false;
                if (batchLot.is_active !== 'Y')
                    return false;
                const isExpired = new Date(batchLot.expiry_date) <= new Date();
                if (!include_expired && isExpired)
                    return false;
                if (loading_type === 'L' && batchLot.remaining_quantity <= 0) {
                    return false;
                }
                return true;
            })
                .map((pb) => {
                const batchLot = pb.batch_lot_product_batches;
                return {
                    product_batch_id: pb.id,
                    product_batch_quantity: pb.quantity,
                    product_batch_created_date: pb.createdate,
                    product_batch_created_by: pb.createdby,
                    product_batch_updated_date: pb.updatedate,
                    product_batch_updated_by: pb.updatedby,
                    product_batch_is_active: pb.is_active,
                    batch_lot_id: batchLot.id,
                    batch_number: batchLot.batch_number,
                    lot_number: batchLot.lot_number,
                    manufacturing_date: batchLot.manufacturing_date,
                    batch_remaining_quantity: batchLot.remaining_quantity,
                };
            });
            const sortBy = sort_by || 'batch_number';
            batches.sort((a, b) => {
                switch (sortBy) {
                    case 'batch_number':
                        return a.batch_number.localeCompare(b.batch_number);
                    case 'manufacturing_date':
                        return (new Date(b.manufacturing_date).getTime() -
                            new Date(a.manufacturing_date).getTime());
                    case 'product_batch_created_date':
                        return (new Date(b.product_batch_created_date).getTime() -
                            new Date(a.product_batch_created_date).getTime());
                    case 'remaining_quantity':
                        return b.batch_remaining_quantity - a.batch_remaining_quantity;
                    default:
                        return a.batch_number.localeCompare(b.batch_number);
                }
            });
            const stats = {
                total_batches: batches.length,
                total_product_batch_quantity: batches.reduce((sum, b) => {
                    return sum + b.product_batch_quantity;
                }, 0),
                total_remaining_quantity: batches.reduce((sum, b) => {
                    return sum + (b.batch_remaining_quantity || 0);
                }, 0),
            };
            res.json({
                success: true,
                message: 'Product batches retrieved successfully',
                data: {
                    product: {
                        id: product.id,
                        name: product.name,
                        code: product.code,
                    },
                    batches,
                    stats,
                },
            });
        }
        catch (error) {
            console.error('Get Product Batches Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve product batches',
                error: error.message,
            });
        }
    },
    async getProductBatchDetails(req, res) {
        try {
            const { productId, batchId } = req.params;
            if (!productId || !batchId) {
                return res.status(400).json({
                    message: 'Product ID and Batch ID are required',
                });
            }
            const productBatch = await prisma_client_1.default.product_batches.findFirst({
                where: {
                    product_id: Number(productId),
                    batch_lot_id: Number(batchId),
                    is_active: 'Y',
                },
                include: {
                    batch_lot_product_batches: true,
                    product_product_batches: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            if (!productBatch) {
                return res.status(404).json({
                    message: 'Batch not found for this product',
                });
            }
            const batchLot = productBatch.batch_lot_product_batches;
            const isExpired = new Date(batchLot.expiry_date) <= new Date();
            const isExpiringSoon = !isExpired &&
                new Date(batchLot.expiry_date) <=
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const response = {
                batch_id: batchLot.id,
                batch_number: batchLot.batch_number,
                lot_number: batchLot.lot_number,
                manufacturing_date: batchLot.manufacturing_date,
                expiry_date: batchLot.expiry_date,
                days_until_expiry: Math.floor((new Date(batchLot.expiry_date).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)),
                is_expired: isExpired,
                is_expiring_soon: isExpiringSoon,
                product_batch_id: productBatch.id,
                product_batch_quantity: productBatch.quantity,
                product_batch_remaining: productBatch.quantity,
                batch_total_quantity: batchLot.quantity,
                batch_total_remaining: batchLot.remaining_quantity,
                supplier_name: batchLot.supplier_name,
                purchase_price: batchLot.purchase_price
                    ? Number(batchLot.purchase_price)
                    : null,
                quality_grade: batchLot.quality_grade,
                storage_location: batchLot.storage_location,
                product: productBatch.product_product_batches,
                availability_status: isExpired
                    ? 'expired'
                    : batchLot.remaining_quantity <= 0
                        ? 'out_of_stock'
                        : isExpiringSoon
                            ? 'expiring_soon'
                            : 'available',
                can_load: !isExpired && batchLot.remaining_quantity > 0,
                can_unload: true,
            };
            res.json({
                success: true,
                message: 'Batch details retrieved successfully',
                data: response,
            });
        }
        catch (error) {
            console.error('Get Product Batch Details Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve batch details',
                error: error.message,
            });
        }
    },
    async getBulkProductBatches(req, res) {
        try {
            const { product_ids, loading_type } = req.body;
            if (!Array.isArray(product_ids) || product_ids.length === 0) {
                return res.status(400).json({
                    message: 'product_ids array is required',
                });
            }
            const results = await Promise.all(product_ids.map(async (productId) => {
                const product = await prisma_client_1.default.products.findUnique({
                    where: { id: Number(productId) },
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                });
                if (!product) {
                    return {
                        product_id: productId,
                        error: 'Product not found',
                        batches: [],
                    };
                }
                const productBatches = await prisma_client_1.default.product_batches.findMany({
                    where: {
                        product_id: Number(productId),
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
                    if (loading_type === 'L' && bl.remaining_quantity <= 0)
                        return false;
                    return true;
                })
                    .map((pb) => {
                    const bl = pb.batch_lot_product_batches;
                    return {
                        batch_id: bl.id,
                        batch_number: bl.batch_number,
                        lot_number: bl.lot_number,
                        expiry_date: bl.expiry_date,
                        product_batch_quantity: pb.quantity,
                        product_batch_remaining: pb.quantity,
                        batch_total_remaining: bl.remaining_quantity,
                    };
                })
                    .sort((a, b) => new Date(a.expiry_date).getTime() -
                    new Date(b.expiry_date).getTime());
                return {
                    product,
                    batches,
                    available_quantity: batches.reduce((sum, b) => sum + b.batch_total_remaining, 0),
                };
            }));
            res.json({
                success: true,
                message: 'Bulk product batches retrieved successfully',
                data: results,
            });
        }
        catch (error) {
            console.error('Get Bulk Product Batches Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve bulk product batches',
                error: error.message,
            });
        }
    },
};
//# sourceMappingURL=vanInventory.controller.js.map