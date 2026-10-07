"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sapService = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const requests_controller_1 = require("../controllers/requests.controller");
async function updateInventoryStock(tx, productId, locationId, quantity, loadingType, batchId, serialId, userId, vanUserId, 
//new change
baseQuantity = 0
//new change
) {
    let validLocationId = locationId;
    let salespersonId = vanUserId || null;
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
    const whereClause = {
        product_id: productId,
        location_id: validLocationId,
        salesperson_id: salespersonId,
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
            const prevCurrent = existingStock.current_stock ?? 0;
            const prevAvailable = existingStock.available_stock ?? 0;
            const newCurrent = prevCurrent + quantity;
            const newAvailable = prevAvailable + quantity;
            console.log(`updateInventoryStock LOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} +${quantity} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`);
            await tx.inventory_stock.update({
                where: { id: existingStock.id },
                data: {
                    current_stock: newCurrent,
                    available_stock: newAvailable,
                    //new change
                    base_quantity: (existingStock.base_quantity ?? 0) + baseQuantity,
                    //new change
                    is_unloadAll: 'N',
                    updatedate: new Date(),
                    updatedby: userId,
                },
            });
        }
        else {
            console.log(`updateInventoryStock CREATE: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} set current ${quantity} available ${quantity}`);
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
                    //new change
                    base_quantity: baseQuantity,
                    //new change
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
            const prevCurrent = existingStock.current_stock ?? 0;
            const prevAvailable = existingStock.available_stock ?? 0;
            const newCurrentStock = Math.max(0, prevCurrent - quantity);
            const newAvailableStock = Math.max(0, prevAvailable - quantity);
            //new change
            const newBaseQuantity = Math.max(0, (existingStock.base_quantity ?? 0) - baseQuantity);
            //new change
            console.log(`updateInventoryStock UNLOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} -${quantity} current ${prevCurrent}→${newCurrentStock} available ${prevAvailable}→${newAvailableStock}`);
            await tx.inventory_stock.update({
                where: { id: existingStock.id },
                data: {
                    current_stock: newCurrentStock,
                    available_stock: newAvailableStock,
                    //new change
                    base_quantity: newBaseQuantity,
                    //new change
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
            //new change
            base_quantity: data.base_quantity ?? 0,
            //new change
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
const SOURCE_SYSTEM_LABELS = {
    sap_arinvoice: 'AR Invoice',
    sap_inventorytrf: 'Inventory Transfer',
};
const getSourceSystemLabel = (sourceSystem) => {
    if (!sourceSystem)
        return null;
    const key = sourceSystem.toLowerCase();
    return SOURCE_SYSTEM_LABELS[key] || sourceSystem;
};
exports.sapService = {
    async createOrUpdateVanInventorySAP(payload, userId) {
        const { van_inventory_items, inventoryItems, ...inventoryData } = payload;
        const items = van_inventory_items || inventoryItems || payload.items || [];
        let inventoryId = inventoryData.id;
        let loadingType = inventoryData.loading_type || 'L';
        if (!['L', 'U'].includes(loadingType.toUpperCase())) {
            loadingType = 'L';
        }
        if (!inventoryData.salesman_sap_code) {
            throw new Error('salesman_sap_code is required');
        }
        const spUser = await prisma_client_1.default.users.findFirst({
            where: { sap_code: inventoryData.salesman_sap_code },
        });
        if (!spUser) {
            throw new Error(`Salesman with SAP code ${inventoryData.salesman_sap_code} not found`);
        }
        if (spUser.sub_inventory_parent_id) {
            throw new Error(`This salesman is assigned as a container group member. Please sync inventory using the container group's SAP code instead.`);
        }
        inventoryData.user_id = spUser.id;
        let targetDepotId = null;
        if (inventoryData.depot_sap_code) {
            const depot = await prisma_client_1.default.depots.findFirst({
                where: { sap_code: inventoryData.depot_sap_code },
            });
            targetDepotId = depot?.id || null;
        }
        else {
            const depot = await prisma_client_1.default.depots.findFirst({
                where: { name: { contains: 'MOSHI' } },
            });
            targetDepotId = depot?.id || null;
        }
        let workflowExists = false;
        const requesterZoneId = spUser.zone_id;
        let requesterDepotId = await (0, requests_controller_1.resolveRequesterDepotId)(prisma_client_1.default, spUser.id, 'VAN_INVENTORY', JSON.stringify({ ...payload, location_id: targetDepotId }));
        if (!requesterDepotId) {
            requesterDepotId = spUser.depot_id;
        }
        if (requesterZoneId && requesterDepotId) {
            const zoneDepotWorkflow = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: 'VAN_INVENTORY',
                    zone_id: requesterZoneId,
                    depot_id: requesterDepotId,
                    is_active: 'Y',
                },
            });
            if (zoneDepotWorkflow.length > 0)
                workflowExists = true;
        }
        if (!workflowExists && requesterZoneId) {
            const zoneWorkflow = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: 'VAN_INVENTORY',
                    zone_id: requesterZoneId,
                    depot_id: null,
                    is_active: 'Y',
                },
            });
            if (zoneWorkflow.length > 0)
                workflowExists = true;
        }
        if (!workflowExists && requesterDepotId) {
            const depotWorkflow = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: 'VAN_INVENTORY',
                    zone_id: null,
                    depot_id: requesterDepotId,
                    is_active: 'Y',
                },
            });
            if (depotWorkflow.length > 0)
                workflowExists = true;
        }
        if (!workflowExists) {
            const globalWorkflow = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: 'VAN_INVENTORY',
                    zone_id: null,
                    depot_id: null,
                    is_active: 'Y',
                },
            });
            if (globalWorkflow.length > 0)
                workflowExists = true;
        }
        const finalResult = await prisma_client_1.default.$transaction(async (tx) => {
            let inventory;
            let isUpdate = false;
            let existingInventoryToCheck = null;
            if (inventoryId) {
                const existingInventory = await tx.van_inventory.findUnique({
                    where: { id: Number(inventoryId) },
                });
                if (existingInventory) {
                    isUpdate = true;
                    existingInventoryToCheck = existingInventory;
                }
            }
            if (!workflowExists &&
                (!isUpdate || existingInventoryToCheck?.approval_status === 'P')) {
                inventoryData.approval_status = 'A';
            }
            const docDate = inventoryData.document_date
                ? new Date(inventoryData.document_date)
                : new Date();
            const today = new Date();
            const todayNormalized = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            const normalizedDocDate = new Date(Date.UTC(docDate.getUTCFullYear(), docDate.getUTCMonth(), docDate.getUTCDate()));
            if (normalizedDocDate > todayNormalized) {
                throw new Error('Future date will not be allowed');
            }
            if (!inventoryId) {
                const existingAnyInventory = await tx.van_inventory.findFirst({
                    where: {
                        user_id: Number(inventoryData.user_id),
                        loading_type: loadingType,
                        document_date: {
                            gte: new Date(Date.UTC(normalizedDocDate.getUTCFullYear(), normalizedDocDate.getUTCMonth(), normalizedDocDate.getUTCDate())),
                            lt: new Date(Date.UTC(normalizedDocDate.getUTCFullYear(), normalizedDocDate.getUTCMonth(), normalizedDocDate.getUTCDate() + 1)),
                        },
                    },
                    orderBy: {
                        createdate: 'desc',
                    },
                });
                if (existingAnyInventory) {
                    inventoryData.user_id = existingAnyInventory.user_id;
                    const effectiveApprovalStatus = existingAnyInventory.approval_status || 'P';
                    if (effectiveApprovalStatus === 'P' || loadingType === 'U') {
                        inventoryId = existingAnyInventory.id;
                        isUpdate = true;
                        existingInventoryToCheck = existingAnyInventory;
                    }
                }
                else {
                    if (!inventoryData.user_id) {
                        inventoryData.user_id = userId;
                    }
                }
            }
            let depot;
            if (inventoryData.depot_sap_code) {
                depot = await tx.depots.findFirst({
                    where: { sap_code: inventoryData.depot_sap_code },
                });
                if (!depot) {
                    throw new Error(`Depot with SAP code ${inventoryData.depot_sap_code} not found`);
                }
            }
            else {
                depot = await tx.depots.findFirst({
                    where: { name: { contains: 'MOSHI' } },
                });
                if (!depot) {
                    throw new Error('depot_sap_code is missing and default MOSHI depot was not found');
                }
            }
            inventoryData.location_id = depot.id;
            if (isUpdate && existingInventoryToCheck && loadingType !== 'U') {
                const effectiveApprovalStatus = existingInventoryToCheck.approval_status || 'P';
                if (effectiveApprovalStatus !== 'P') {
                    throw new Error(`Cannot edit van inventory with approval_status '${effectiveApprovalStatus}'. Only pending (P) inventories or unloading operations are allowed.`);
                }
            }
            // if (inventoryData.vehicle_sap_code) {
            //   const vehicleExists = await tx.vehicles.findFirst({
            //     where: { sap_code: inventoryData.vehicle_sap_code },
            //   });
            //   if (!vehicleExists) {
            //     throw new Error(
            //       `Vehicle with SAP code ${inventoryData.vehicle_sap_code} not found`
            //     );
            //   }
            //   inventoryData.vehicle_id = vehicleExists.id;
            // }
            const payload = {
                user_id: Number(inventoryData.user_id),
                is_cancelled: inventoryData.is_cancelled || 'N',
                approval_status: inventoryData.approval_status || 'P',
                remarks: inventoryData.remarks || null,
                status: inventoryData.status || 'A',
                loading_type: loadingType,
                document_date: inventoryData.document_date
                    ? new Date(inventoryData.document_date)
                    : new Date(),
                vehicle_id: inventoryData.vehicle_id
                    ? Number(inventoryData.vehicle_id)
                    : null,
                vehicle_code: inventoryData.vehicle_sap_code ||
                    inventoryData.vehicle_code ||
                    null,
                sales_person_code: inventoryData.salesman_sap_code ||
                    inventoryData.sales_person_code ||
                    null,
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
            const shouldPerformLoadingUnloading = payload.approval_status === 'A' && payload.is_cancelled === 'N';
            if (Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    const qty = parseInt(item.quantity, 10) || 0;
                    if (!item.product_sap_code) {
                        throw new Error('product_sap_code is required for each item');
                    }
                    if (!item.source_system) {
                        throw new Error('source_system is required for each item');
                    }
                    if (!item.sap_docentry) {
                        throw new Error('sap_docentry is required for each item');
                    }
                    if (!item.sap_docnum) {
                        throw new Error('sap_docnum is required for each item');
                    }
                    if (!item.sap_lineid) {
                        throw new Error('sap_lineid is required for each item');
                    }
                    const sapDocEntry = item.sap_docentry.toString();
                    const sapDocNum = item.sap_docnum.toString();
                    const sapLineid = item.sap_lineid.toString();
                    const sourceSystem = item.source_system;
                    const compositeKey = `${sourceSystem}_${sapDocEntry}_${sapLineid}`;
                    const existingSapDoc = await tx.van_inventory_items.findFirst({
                        where: {
                            source_system: sourceSystem,
                            sap_docentry: sapDocEntry,
                            sap_lineid: sapLineid,
                            ...(isUpdate && inventoryId
                                ? {
                                    NOT: {
                                        parent_id: Number(inventoryId),
                                    },
                                }
                                : {}),
                        },
                    });
                    if (existingSapDoc) {
                        throw new Error(`SAP document already imported: ${compositeKey}`);
                    }
                    if (isUpdate && inventoryId) {
                        await tx.van_inventory_items.deleteMany({
                            where: {
                                parent_id: Number(inventoryId),
                                source_system: sourceSystem,
                                sap_docentry: sapDocEntry,
                                sap_lineid: sapLineid,
                            },
                        });
                    }
                    const product = await tx.products.findFirst({
                        where: { sap_code: item.product_sap_code },
                        include: { product_unit_of_measurement: true },
                    });
                    if (!product) {
                        throw new Error(`Product with SAP code ${item.product_sap_code} not found`);
                    }
                    const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
                    const itemIsCancelled = item.is_cancelled === 'T' || item.is_cancelled === 'Y';
                    let batchData = item.batches || item.product_batches;
                    const serialData = item.serials || item.product_serials;
                    if (trackingType === 'BATCH') {
                        if (!batchData ||
                            !Array.isArray(batchData) ||
                            batchData.length === 0) {
                            throw new Error(`Batches are required for batch-tracked product ${product.name}`);
                        }
                        // Aggregate duplicate batches
                        const aggregatedBatches = {};
                        for (const b of batchData) {
                            const bNum = b.batch_number;
                            if (!bNum) {
                                throw new Error(`Batch number is required for each batch for product "${product.name}"`);
                            }
                            if (!aggregatedBatches[bNum]) {
                                aggregatedBatches[bNum] = { ...b };
                                // Ensure quantities are parsed as integers to avoid string concatenation
                                aggregatedBatches[bNum].quantity =
                                    parseInt(b.quantity, 10) || 0;
                                if (b.base_quantity) {
                                    aggregatedBatches[bNum].base_quantity =
                                        parseInt(b.base_quantity, 10) || 0;
                                }
                            }
                            else {
                                aggregatedBatches[bNum].quantity +=
                                    parseInt(b.quantity, 10) || 0;
                                if (b.base_quantity) {
                                    aggregatedBatches[bNum].base_quantity +=
                                        parseInt(b.base_quantity, 10) || 0;
                                }
                            }
                        }
                        batchData = Object.values(aggregatedBatches);
                        const totalBatchQty = (batchData || []).reduce((acc, b) => acc + (parseInt(b.quantity, 10) || 0), 0);
                        if (typeof item.quantity === 'undefined' ||
                            item.quantity === null) {
                            throw new Error(`Quantity is required for batch-tracked product "${product.name}" when batches are provided`);
                        }
                        const declaredQty = parseInt(item.quantity, 10);
                        // if (Number.isNaN(declaredQty) || declaredQty !== totalBatchQty) {
                        //   throw new Error(
                        //     `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQty}`
                        //   );
                        // }
                    }
                    else if (trackingType === 'SERIAL') {
                        if (!serialData ||
                            !Array.isArray(serialData) ||
                            serialData.length === 0) {
                            throw new Error(`Serial numbers are required for serial-tracked product "${product.name}"`);
                        }
                        if (typeof item.quantity !== 'undefined' &&
                            item.quantity !== null) {
                            const declaredQty = parseInt(item.quantity, 10);
                            if (!Number.isNaN(declaredQty) &&
                                declaredQty !== serialData.length) {
                                throw new Error(`Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`);
                            }
                        }
                        for (const serialInput of serialData) {
                            const serialNumber = typeof serialInput === 'string'
                                ? serialInput
                                : serialInput?.serial_number;
                            if (!serialNumber) {
                                throw new Error('Serial number is required');
                            }
                        }
                    }
                    if (loadingType === 'L') {
                        if (trackingType === 'BATCH') {
                            for (const batchInput of batchData) {
                                const batchQty = parseInt(batchInput.quantity, 10) || 0;
                                //new changes
                                const batchBaseQty = parseInt(batchInput.base_quantity, 10) || 0;
                                //new changes
                                // if (batchQty <= 0) {
                                //   throw new Error('Batch quantity must be greater than 0');
                                // }
                                let batchLot = null;
                                let productBatch = null;
                                batchLot = await tx.batch_lots.findFirst({
                                    where: {
                                        batch_number: batchInput.batch_number,
                                        productsId: product.id,
                                        is_active: 'Y',
                                        salesman_id: Number(inventoryData.user_id),
                                    },
                                });
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                    if (batchLot) {
                                        await tx.batch_lots.update({
                                            where: { id: batchLot.id },
                                            data: {
                                                quantity: batchLot.quantity + batchQty,
                                                remaining_quantity: batchLot.remaining_quantity + batchQty,
                                                //new changes
                                                base_quantity: (batchLot.base_quantity || 0) + batchBaseQty,
                                                //new changes
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
                                                //new changes
                                                base_quantity: batchBaseQty,
                                                //new changes
                                                supplier_name: batchInput.supplier_name || null,
                                                purchase_price: batchInput.purchase_price || null,
                                                quality_grade: batchInput.quality_grade || 'A',
                                                storage_location: batchInput.storage_location || null,
                                                is_active: 'Y',
                                                createdate: new Date(),
                                                createdby: Number(inventoryData.user_id),
                                                salesman_id: Number(inventoryData.user_id),
                                                log_inst: 1,
                                                productsId: product.id,
                                            },
                                        });
                                        console.log(` Created batch_lots: ${batchLot.batch_number}`);
                                    }
                                    productBatch = await tx.product_batches.findFirst({
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
                                }
                                else {
                                    if (!batchLot) {
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
                                                quantity: 0,
                                                remaining_quantity: 0,
                                                //new changes
                                                base_quantity: 0,
                                                //new changes
                                                supplier_name: batchInput.supplier_name || null,
                                                purchase_price: batchInput.purchase_price || null,
                                                quality_grade: batchInput.quality_grade || 'A',
                                                storage_location: batchInput.storage_location || null,
                                                is_active: 'Y',
                                                createdate: new Date(),
                                                createdby: Number(inventoryData.user_id),
                                                salesman_id: Number(inventoryData.user_id),
                                                log_inst: 1,
                                                productsId: product.id,
                                            },
                                        });
                                    }
                                }
                                await tx.van_inventory_items.create({
                                    data: {
                                        parent_id: inventory.id,
                                        sap_lineid: item.sap_lineid || null,
                                        sap_item_code: item.product_sap_code || item.sap_item_code || null,
                                        product_id: product.id,
                                        product_name: product.name,
                                        unit: product.product_unit_of_measurement?.name || 'pcs',
                                        quantity: batchQty,
                                        sap_docnum: sapDocNum,
                                        sap_docentry: sapDocEntry,
                                        source_system: sourceSystem,
                                        is_cancelled: item.is_cancelled || inventoryData.is_cancelled || 'N',
                                        remarks: item.remarks || inventoryData.remarks || null,
                                        unit_price: Number(item.unit_price || 0),
                                        discount_amount: Number(item.discount_amount || 0),
                                        tax_amount: Number(item.tax_amount || 0),
                                        total_amount: batchQty * Number(item.unit_price || 0),
                                        notes: item.notes || null,
                                        batch_lot_id: batchLot.id,
                                        //new change
                                        base_quantity: batchBaseQty,
                                        //new change
                                    },
                                });
                                console.log(` Created van_inventory_items`);
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                    await updateInventoryStock(tx, product.id, inventoryData.location_id || null, batchQty, 'L', batchLot.id, null, userId, inventoryData.user_id, 
                                    //new change
                                    batchBaseQty
                                    //new change
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
                                        //new change
                                        base_quantity: batchBaseQty,
                                        //new change
                                        remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
                                        van_inventory_id: inventory.id,
                                        createdby: userId,
                                    });
                                }
                            }
                        }
                        else if (trackingType === 'SERIAL') {
                            const serialData = item.serials || item.product_serials;
                            console.log(` Product: ${product.name}, ID: ${product.id}`);
                            for (const serialInput of serialData) {
                                const serialNumber = typeof serialInput === 'string'
                                    ? serialInput
                                    : serialInput.serial_number;
                                let existingSerial = await tx.serial_numbers.findUnique({
                                    where: { serial_number: serialNumber },
                                });
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
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
                                }
                                else {
                                    if (!existingSerial) {
                                        existingSerial = await tx.serial_numbers.create({
                                            data: {
                                                product_id: product.id,
                                                serial_number: serialNumber,
                                                batch_id: serialInput.batch_id || null,
                                                status: 'available',
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
                                    }
                                }
                                console.log(`Creating new serial item`, {
                                    serial: serialNumber,
                                    quantity: 1,
                                });
                                await tx.van_inventory_items.create({
                                    data: {
                                        parent_id: inventory.id,
                                        sap_lineid: item.sap_lineid || null,
                                        sap_item_code: item.product_sap_code || item.sap_item_code || null,
                                        product_id: product.id,
                                        product_name: product.name,
                                        unit: product.product_unit_of_measurement?.name || 'pcs',
                                        quantity: 1,
                                        //new change
                                        base_quantity: 1,
                                        //new change
                                        sap_docnum: sapDocNum,
                                        sap_docentry: sapDocEntry,
                                        source_system: sourceSystem,
                                        is_cancelled: item.is_cancelled || inventoryData.is_cancelled || 'N',
                                        remarks: item.remarks || inventoryData.remarks || null,
                                        unit_price: Number(item.unit_price || 0),
                                        discount_amount: Number(item.discount_amount || 0),
                                        tax_amount: Number(item.tax_amount || 0),
                                        total_amount: 1 * Number(item.unit_price || 0),
                                        notes: item.notes || null,
                                        serial_id: existingSerial.id,
                                    },
                                });
                                console.log(`Created new van_inventory_items for serial ${serialNumber}`);
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                    await updateInventoryStock(tx, product.id, inventoryData.location_id || null, 1, 'L', null, existingSerial.id, userId, 
                                    //new change
                                    inventoryData.user_id, 1
                                    //new change
                                    );
                                    console.log(`INCREASED inventory_stock for serial ${serialNumber}`);
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
                                        //new change
                                        base_quantity: 1,
                                        //new change
                                        remarks: `Loaded serial ${serialNumber} to van`,
                                        van_inventory_id: inventory.id,
                                        createdby: userId,
                                    });
                                    console.log(` Created VAN_LOAD stock movement for ${serialNumber}`);
                                }
                            }
                        }
                        else {
                            if (qty <= 0) {
                                throw new Error('Quantity must be greater than 0 for NONE-tracked product');
                            }
                            //new change
                            const baseQty = parseInt(item.base_quantity, 10) || 0;
                            //new change
                            await tx.van_inventory_items.create({
                                data: {
                                    parent_id: inventory.id,
                                    sap_lineid: item.sap_lineid || null,
                                    sap_item_code: item.product_sap_code || item.sap_item_code || null,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: product.product_unit_of_measurement?.name || 'pcs',
                                    quantity: qty,
                                    //new change
                                    base_quantity: baseQty,
                                    //new change
                                    unit_price: Number(item.unit_price || 0),
                                    discount_amount: Number(item.discount_amount || 0),
                                    sap_docnum: sapDocNum,
                                    sap_docentry: sapDocEntry,
                                    source_system: sourceSystem,
                                    is_cancelled: item.is_cancelled || inventoryData.is_cancelled || 'N',
                                    remarks: item.remarks || inventoryData.remarks || null,
                                    tax_amount: Number(item.tax_amount || 0),
                                    total_amount: qty * Number(item.unit_price || 0),
                                    notes: item.notes || null,
                                    batch_lot_id: null,
                                    serial_id: null,
                                },
                            });
                            console.log(`    Created van_inventory_items`);
                            const itemIsCancelled = item.is_cancelled === 'T' || item.is_cancelled === 'Y';
                            if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                await updateInventoryStock(tx, product.id, inventoryData.location_id || null, qty, 'L', null, null, userId, inventoryData.user_id, 
                                //new change
                                baseQty
                                //new change
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
                                    //new change
                                    base_quantity: baseQty,
                                    //new change
                                    remarks: `Loaded ${qty} units to van`,
                                    van_inventory_id: inventory.id,
                                    createdby: userId,
                                });
                                console.log(` Loaded ${qty} units of NONE-tracked product ${product.name}\n`);
                            }
                        }
                    }
                    else if (loadingType === 'U') {
                        const existingUnloadSapDoc = await tx.van_inventory_items.findFirst({
                            where: {
                                source_system: sourceSystem,
                                sap_docentry: sapDocEntry,
                                van_inventory_items_inventory: {
                                    loading_type: 'U',
                                },
                            },
                        });
                        if (existingUnloadSapDoc) {
                            throw new Error(`SAP document already unloaded: ${compositeKey}`);
                        }
                        if (trackingType === 'BATCH') {
                            const batchData = item.batches || item.product_batches;
                            if (!batchData ||
                                !Array.isArray(batchData) ||
                                batchData.length === 0) {
                                throw new Error(`Batches are required for batch-tracked product ${product.name}`);
                            }
                            const totalBatchQtyUnload = (batchData || []).reduce((acc, b) => acc + (parseInt(b.quantity, 10) || 0), 0);
                            if (typeof item.quantity === 'undefined' ||
                                item.quantity === null) {
                                throw new Error(`Quantity is required for batch-tracked product "${product.name}" when batches are provided`);
                            }
                            const declaredQtyUnload = parseInt(item.quantity, 10);
                            // if (
                            //   Number.isNaN(declaredQtyUnload) ||
                            //   declaredQtyUnload !== totalBatchQtyUnload
                            // ) {
                            //   throw new Error(
                            //     `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQtyUnload}`
                            //   );
                            // }
                            for (const batchInput of batchData) {
                                const batchQty = parseInt(batchInput.quantity, 10) || 0;
                                const batchLot = await tx.batch_lots.findFirst({
                                    where: {
                                        batch_number: batchInput.batch_number,
                                        productsId: product.id,
                                        is_active: 'Y',
                                        salesman_id: Number(inventoryData.user_id),
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
                                            loading_type: 'L',
                                        },
                                    },
                                });
                                if (!vanItem)
                                    throw new Error(`Batch ${batchInput.batch_number} for product ${product.id} not found in van inventory for user ${inventoryData.user_id}`);
                                if (vanItem.quantity < batchQty)
                                    throw new Error(`Insufficient van quantity`);
                                const itemIsCancelled = item.is_cancelled === 'T' || item.is_cancelled === 'Y';
                                //new change
                                const batchBaseQty = parseInt(batchInput.base_quantity, 10) || 0;
                                //new change
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
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
                                        //new change
                                        const newBaseQty = Math.max(0, (inventoryStock.base_quantity ?? 0) - batchBaseQty);
                                        //new change
                                        console.log(`updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} batch=${batchLot.id} -${batchQty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`);
                                        await tx.inventory_stock.update({
                                            where: { id: inventoryStock.id },
                                            data: {
                                                current_stock: newCurrent,
                                                available_stock: newAvailable,
                                                //new change
                                                base_quantity: newBaseQty,
                                                //new change
                                                updatedate: new Date(),
                                                updatedby: userId,
                                            },
                                        });
                                    }
                                }
                                await tx.van_inventory_items.create({
                                    data: {
                                        parent_id: inventory.id,
                                        sap_lineid: item.sap_lineid || null,
                                        sap_item_code: item.product_sap_code || null,
                                        product_id: product.id,
                                        product_name: product.name,
                                        unit: product.product_unit_of_measurement?.name || 'pcs',
                                        quantity: batchQty,
                                        //new change
                                        base_quantity: batchBaseQty,
                                        //new change
                                        unit_price: Number(item.unit_price || 0),
                                        sap_docnum: sapDocNum,
                                        sap_docentry: sapDocEntry,
                                        source_system: sourceSystem,
                                        is_cancelled: item.is_cancelled || inventoryData.is_cancelled || 'N',
                                        remarks: item.remarks || inventoryData.remarks || null,
                                        discount_amount: Number(item.discount_amount || 0),
                                        tax_amount: Number(item.tax_amount || 0),
                                        total_amount: batchQty * Number(item.unit_price || 0),
                                        notes: item.notes || null,
                                        batch_lot_id: batchLot.id,
                                    },
                                });
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
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
                                        //new change
                                        base_quantity: batchBaseQty,
                                        //new change
                                        remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
                                        van_inventory_id: inventory.id,
                                        createdby: userId,
                                    });
                                }
                            }
                        }
                        else if (trackingType === 'SERIAL') {
                            const serialData = item.serials || item.product_serials;
                            if (typeof item.quantity !== 'undefined' &&
                                item.quantity !== null) {
                                const declaredQty = parseInt(item.quantity, 10);
                                if (!Number.isNaN(declaredQty) &&
                                    declaredQty !== serialData.length) {
                                    throw new Error(`Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`);
                                }
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
                                const vanInventoryId = vanItem.parent_id;
                                const itemIsCancelled = item.is_cancelled === 'T' || item.is_cancelled === 'Y';
                                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                    try {
                                        const newVanQty = Math.max(0, (vanItem.quantity || 0) - 1);
                                        await tx.van_inventory_items.update({
                                            where: { id: vanItem.id },
                                            data: {
                                                quantity: newVanQty,
                                                total_amount: newVanQty * Number(vanItem.unit_price || 0),
                                            },
                                        });
                                        console.log(` Updated van_inventory_items ID: ${vanItem.id}, quantity: ${vanItem.quantity}→${newVanQty}`);
                                    }
                                    catch (err) {
                                        console.log(` Failed updating van_inventory_items ID ${vanItem.id}:`, err);
                                    }
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
                                        console.log(` Updated serial ${serialNumber} status → available`);
                                    }
                                    catch (err) {
                                        console.log(` Failed updating serial ${serialNumber} status:`, err);
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
                                                current_stock: Math.max(0, (inventoryStock.current_stock || 0) - 1),
                                                available_stock: Math.max(0, (inventoryStock.available_stock || 0) - 1),
                                                //new change
                                                base_quantity: Math.max(0, (inventoryStock.base_quantity || 0) - 1),
                                                //new change
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
                                        //new change
                                        base_quantity: 1,
                                        //new change
                                        remarks: `Sold serial ${serialNumber}`,
                                        van_inventory_id: inventory.id,
                                        createdby: userId,
                                    });
                                }
                                await tx.van_inventory_items.create({
                                    data: {
                                        parent_id: inventory.id,
                                        sap_lineid: item.sap_lineid || null,
                                        sap_item_code: item.product_sap_code || null,
                                        product_id: product.id,
                                        product_name: product.name,
                                        unit: product.product_unit_of_measurement?.name || 'pcs',
                                        quantity: 1,
                                        //new change
                                        base_quantity: 1,
                                        //new change
                                        sap_docnum: sapDocNum,
                                        sap_docentry: sapDocEntry,
                                        source_system: sourceSystem,
                                        is_cancelled: item.is_cancelled || inventoryData.is_cancelled || 'N',
                                        remarks: item.remarks || inventoryData.remarks || null,
                                        unit_price: Number(item.unit_price || 0),
                                        discount_amount: Number(item.discount_amount || 0),
                                        tax_amount: Number(item.tax_amount || 0),
                                        total_amount: 1 * Number(item.unit_price || 0),
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
                            const itemIsCancelled = item.is_cancelled === 'T' || item.is_cancelled === 'Y';
                            //new change
                            const baseQty = parseInt(item.base_quantity, 10) || 0;
                            //new change
                            if (shouldPerformLoadingUnloading && !itemIsCancelled) {
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
                                    //new change
                                    const newBaseQty = Math.max(0, (inventoryStock.base_quantity ?? 0) - baseQty);
                                    //new change
                                    console.log(`updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} -${qty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`);
                                    await tx.inventory_stock.update({
                                        where: { id: inventoryStock.id },
                                        data: {
                                            current_stock: newCurrent,
                                            available_stock: newAvailable,
                                            //new change
                                            base_quantity: newBaseQty,
                                            //new change
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
                                    //new change
                                    base_quantity: baseQty,
                                    //new change
                                    remarks: `Sold ${qty} units from van`,
                                    van_inventory_id: inventory.id,
                                    createdby: userId,
                                });
                            }
                            await tx.van_inventory_items.create({
                                data: {
                                    parent_id: inventory.id,
                                    sap_lineid: item.sap_lineid || null,
                                    sap_item_code: item.product_sap_code || null,
                                    product_id: product.id,
                                    product_name: product.name,
                                    unit: product.product_unit_of_measurement?.name || 'pcs',
                                    quantity: qty,
                                    //new change
                                    base_quantity: baseQty,
                                    //new change
                                    sap_docnum: sapDocNum,
                                    sap_docentry: sapDocEntry,
                                    source_system: sourceSystem,
                                    is_cancelled: item.is_cancelled || inventoryData.is_cancelled || 'N',
                                    remarks: item.remarks || inventoryData.remarks || null,
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
                    van_inventory_users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            sap_code: true,
                            employee_id: true,
                        },
                    },
                    vehicle: {
                        select: {
                            id: true,
                            vehicle_number: true,
                            sap_code: true,
                            type: true,
                            make: true,
                            model: true,
                        },
                    },
                    van_inventory_depot: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            sap_code: true,
                            city: true,
                        },
                    },
                    van_inventory_items_inventory: {
                        include: {
                            van_inventory_items_products: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    sap_code: true,
                                    tracking_type: true,
                                    product_unit_of_measurement: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                        },
                                    },
                                    product_tax_master: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },
                                    product_product_batches: {
                                        select: {
                                            id: true,
                                            quantity: true,
                                            batch_lot_product_batches: {
                                                select: {
                                                    id: true,
                                                    batch_number: true,
                                                    lot_number: true,
                                                },
                                            },
                                        },
                                    },
                                    serial_numbers_products: {
                                        select: {
                                            id: true,
                                            serial_number: true,
                                            status: true,
                                            warranty_expiry: true,
                                            serial_numbers_customers: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    code: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            van_inventory_items_batch_lot: {
                                select: {
                                    id: true,
                                    batch_number: true,
                                    expiry_date: true,
                                },
                            },
                            van_inventory_serial: {
                                select: {
                                    id: true,
                                    serial_number: true,
                                },
                            },
                        },
                    },
                    van_inventory_stock_movements: {
                        select: {
                            id: true,
                            movement_type: true,
                            quantity: true,
                            movement_date: true,
                            remarks: true,
                        },
                    },
                },
            });
            const firstItem = finalInventory?.van_inventory_items_inventory?.[0];
            const result = {
                finalInventory: {
                    id: finalInventory?.id,
                    user_id: finalInventory?.user_id,
                    last_updated: finalInventory?.last_updated,
                    is_active: finalInventory?.is_active,
                    is_cancelled: finalInventory?.is_cancelled,
                    approval_status: finalInventory?.approval_status,
                    remarks: finalInventory?.remarks,
                    createdate: finalInventory?.createdate,
                    createdby: finalInventory?.createdby,
                    updatedate: finalInventory?.updatedate,
                    updatedby: finalInventory?.updatedby,
                    log_inst: finalInventory?.log_inst,
                    location_id: finalInventory?.location_id,
                    location_type: finalInventory?.location_type,
                    vehicle_id: finalInventory?.vehicle_id,
                    vehicle_code: finalInventory?.vehicle_code,
                    sales_person_code: finalInventory?.sales_person_code,
                    loading_type: finalInventory?.loading_type,
                    status: finalInventory?.status,
                    document_date: finalInventory?.document_date,
                    sale_type: finalInventory?.sale_type,
                    van_inventory_users: finalInventory?.van_inventory_users,
                    vehicle: finalInventory?.vehicle,
                    van_inventory_depot: finalInventory?.van_inventory_depot,
                    van_inventory_items_inventory: finalInventory?.van_inventory_items_inventory?.map(item => ({
                        id: item.id,
                        parent_id: item.parent_id,
                        sap_docnum: item.sap_docnum,
                        sap_docentry: item.sap_docentry,
                        source_system: item.source_system,
                        source_system_label: getSourceSystemLabel(item.source_system),
                        sap_lineid: item.sap_lineid,
                        remarks: item.remarks,
                        sap_item_code: item.sap_item_code,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        unit: item.unit,
                        batch_lot_id: item.batch_lot_id,
                        serial_id: item.serial_id,
                        quantity: item.quantity,
                        base_quantity: item.base_quantity,
                        unit_price: item.unit_price,
                        discount_amount: item.discount_amount,
                        tax_amount: item.tax_amount,
                        total_amount: item.total_amount,
                        notes: item.notes,
                        is_cancelled: item.is_cancelled,
                        van_inventory_items_products: item.van_inventory_items_products,
                        van_inventory_items_batch_lot: item.van_inventory_items_batch_lot,
                        van_inventory_serial: item.van_inventory_serial,
                    })),
                    van_inventory_stock_movements: finalInventory?.van_inventory_stock_movements,
                },
                wasUpdate: isUpdate,
            };
            return result;
        }, {
            maxWait: 6000000,
            timeout: 1200000,
        });
        if (workflowExists && finalResult.finalInventory.approval_status === 'P') {
            const dbItems = finalResult.finalInventory.van_inventory_items_inventory || [];
            const groupedItemsMap = new Map();
            dbItems.forEach((item) => {
                const key = `${item.source_system}_${item.sap_docnum}_${item.product_id}`;
                if (!groupedItemsMap.has(key)) {
                    groupedItemsMap.set(key, {
                        product_id: item.product_id,
                        product_name: item.product_name,
                        tracking_type: item.van_inventory_items_products?.tracking_type,
                        quantity: 0,
                        base_quantity: 0,
                        notes: item.notes || item.remarks || '',
                        unit_price: item.unit_price,
                        discount_amount: item.discount_amount || 0,
                        tax_amount: item.tax_amount || 0,
                        total_amount: 0,
                        sap_docentry: item.sap_docentry,
                        sap_docnum: item.sap_docnum,
                        sap_lineid: item.sap_lineid,
                        source_system: item.source_system,
                        product_batches: [],
                        product_serials: [],
                    });
                }
                const group = groupedItemsMap.get(key);
                group.quantity += Number(item.quantity || 0);
                group.base_quantity += Number(item.base_quantity || 0);
                group.total_amount += Number(item.total_amount || 0);
                if (item.van_inventory_items_batch_lot) {
                    const existingBatch = group.product_batches.find((b) => b.batch_number === item.van_inventory_items_batch_lot.batch_number);
                    if (existingBatch) {
                        existingBatch.quantity += Number(item.quantity || 0);
                        existingBatch.base_quantity += Number(item.base_quantity || 0);
                        existingBatch.remaining_quantity += Number(item.quantity || 0);
                        existingBatch.total_quantity += Number(item.quantity || 0);
                    }
                    else {
                        group.product_batches.push({
                            batch_number: item.van_inventory_items_batch_lot.batch_number,
                            lot_number: item.van_inventory_items_batch_lot.lot_number || '',
                            manufacturing_date: item.van_inventory_items_batch_lot.manufacturing_date,
                            expiry_date: item.van_inventory_items_batch_lot.expiry_date,
                            quantity: Number(item.quantity || 0),
                            base_quantity: Number(item.base_quantity || 0),
                            remaining_quantity: Number(item.quantity || 0),
                            total_quantity: Number(item.quantity || 0),
                        });
                    }
                }
                if (item.van_inventory_serial) {
                    group.product_serials.push({
                        serial_number: item.van_inventory_serial.serial_number ||
                            item.van_inventory_serial.id,
                        quantity: item.quantity,
                    });
                }
            });
            const formattedVanInventoryItems = Array.from(groupedItemsMap.values());
            console.log('DEBUG formattedVanInventoryItems:', JSON.stringify(formattedVanInventoryItems, null, 2));
            const requestPayload = {
                requester_id: Number(inventoryData.user_id),
                request_type: 'VAN_INVENTORY',
                reference_id: finalResult.finalInventory.id,
                request_data: JSON.stringify({
                    ...inventoryData,
                    items,
                    van_inventory_items: formattedVanInventoryItems,
                }),
                createdby: userId,
                log_inst: 1,
            };
            const existingRequest = await prisma_client_1.default.sfa_d_requests.findFirst({
                where: {
                    request_type: 'VAN_INVENTORY',
                    reference_id: finalResult.finalInventory.id,
                    status: 'P',
                },
            });
            if (existingRequest) {
                await prisma_client_1.default.sfa_d_requests.update({
                    where: { id: existingRequest.id },
                    data: {
                        request_data: requestPayload.request_data,
                        updatedate: new Date(),
                    },
                });
            }
            else {
                await (0, requests_controller_1.createRequest)(requestPayload);
            }
        }
        return finalResult;
    },
    async processApprovedVanInventoryStock(inventoryId, userId = 1) {
        console.log('processApprovedVanInventoryStock called', {
            inventoryId,
            userId,
        });
        console.log(`Processing stock operations for approved van inventory ID: ${inventoryId}`);
        const inventory = await prisma_client_1.default.van_inventory.findUnique({
            where: { id: Number(inventoryId) },
        });
        if (!inventory) {
            throw new Error(`Van inventory not found with ID: ${inventoryId}`);
        }
        const approvalRequest = await prisma_client_1.default.sfa_d_requests.findFirst({
            where: {
                request_type: 'VAN_INVENTORY',
                reference_id: Number(inventoryId),
            },
            orderBy: { createdate: 'desc' },
        });
        if (!approvalRequest?.request_data) {
            throw new Error('No approval request found with original payload data');
        }
        const originalPayload = JSON.parse(approvalRequest.request_data);
        const items = originalPayload.van_inventory_items || originalPayload.items || [];
        const loadingType = originalPayload.loading_type || 'L';
        const shouldPerformLoadingUnloading = inventory.approval_status === 'A' && inventory.is_cancelled === 'N';
        console.log(`shouldPerformLoadingUnloading: ${shouldPerformLoadingUnloading}`);
        await prisma_client_1.default.$transaction(async (tx) => {
            if (loadingType === 'L') {
                const existingProcessedMovements = await tx.stock_movements.count({
                    where: {
                        reference_type: 'VAN_INVENTORY',
                        reference_id: inventoryId,
                        movement_type: 'VAN_LOAD',
                    },
                });
                console.log(` Existing VAN_LOAD stock movements for this inventory: ${existingProcessedMovements}`);
                if (existingProcessedMovements > 0) {
                    console.log(' Skipping: VAN_LOAD stock movements already processed');
                    return;
                }
            }
            else if (loadingType === 'U') {
                const existingProcessedMovements = await tx.stock_movements.count({
                    where: {
                        reference_type: 'VAN_INVENTORY',
                        reference_id: inventoryId,
                        movement_type: 'VAN_UNLOAD',
                    },
                });
                console.log(` Existing VAN_UNLOAD stock movements for this inventory: ${existingProcessedMovements}`);
                if (existingProcessedMovements > 0) {
                    console.log(' Skipping: VAN_UNLOAD stock movements already processed');
                    return;
                }
            }
            for (const item of items) {
                if (!item.product_sap_code && !item.product_id)
                    continue;
                let product = null;
                if (item.product_id) {
                    product = await tx.products.findUnique({
                        where: { id: Number(item.product_id) },
                        include: { product_unit_of_measurement: true },
                    });
                }
                else {
                    product = await tx.products.findFirst({
                        where: { sap_code: item.product_sap_code },
                        include: { product_unit_of_measurement: true },
                    });
                }
                if (!product) {
                    console.warn(`Product with SAP code ${item.product_sap_code} not found, skipping`);
                    continue;
                }
                const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
                const itemIsCancelled = item.is_cancelled === 'T' ||
                    item.is_cancelled === 'Y' ||
                    inventory.is_cancelled === 'Y';
                const sapDocEntry = item.sap_docentry?.toString() || '';
                const sapDocNum = item.sap_docnum?.toString() || '';
                const sourceSystem = item.source_system || '';
                if (loadingType === 'L') {
                    if (trackingType === 'BATCH') {
                        const batchData = item.batches || item.product_batches;
                        if (!batchData ||
                            !Array.isArray(batchData) ||
                            batchData.length === 0) {
                            continue;
                        }
                        for (const batchInput of batchData) {
                            const batchQty = parseInt(batchInput.quantity, 10) || 0;
                            const batchBaseQty = parseInt(batchInput.base_quantity, 10) || 0;
                            if (batchQty <= 0)
                                continue;
                            let batchLot = await tx.batch_lots.findFirst({
                                where: {
                                    batch_number: batchInput.batch_number,
                                    productsId: product.id,
                                    is_active: 'Y',
                                    salesman_id: Number(inventory.user_id),
                                },
                            });
                            if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                if (batchLot) {
                                    await tx.batch_lots.update({
                                        where: { id: batchLot.id },
                                        data: {
                                            quantity: batchLot.quantity + batchQty,
                                            remaining_quantity: batchLot.remaining_quantity + batchQty,
                                            updatedate: new Date(),
                                        },
                                    });
                                    console.log(`Updated batch_lots: ${batchLot.batch_number} (+${batchQty})`);
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
                                            createdby: Number(inventory.user_id),
                                            salesman_id: Number(inventory.user_id),
                                            log_inst: 1,
                                            productsId: product.id,
                                        },
                                    });
                                    console.log(`Created batch_lots: ${batchLot.batch_number}`);
                                }
                                const productBatch = await tx.product_batches.findFirst({
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
                                }
                                await updateInventoryStock(tx, product.id, inventory.location_id, batchQty, 'L', batchLot.id, null, userId, inventory.user_id, batchBaseQty);
                                await createStockMovement(tx, {
                                    product_id: product.id,
                                    batch_id: batchLot.id,
                                    serial_id: null,
                                    movement_type: 'VAN_LOAD',
                                    reference_type: 'VAN_INVENTORY',
                                    reference_id: inventoryId,
                                    quantity: batchQty,
                                    base_quantity: batchBaseQty,
                                    remarks: item.remarks || 'Approved stock load',
                                    van_inventory_id: inventoryId,
                                    createdby: userId,
                                });
                            }
                        }
                    }
                    else if (trackingType === 'SERIAL') {
                        let serialData = [];
                        if (Array.isArray(item.serials)) {
                            serialData = item.serials;
                        }
                        else if (Array.isArray(item.product_serials)) {
                            serialData = item.product_serials;
                        }
                        else if (Array.isArray(item.serial_numbers)) {
                            serialData = item.serial_numbers;
                        }
                        if (!serialData.length)
                            continue;
                        for (const serialInput of serialData) {
                            const serialNumber = typeof serialInput === 'string'
                                ? serialInput
                                : serialInput.serial_number;
                            if (!serialNumber)
                                continue;
                            const existingSerial = await tx.serial_numbers.findFirst({
                                where: { serial_number: serialNumber },
                            });
                            if (!existingSerial)
                                continue;
                            if (shouldPerformLoadingUnloading &&
                                !itemIsCancelled &&
                                existingSerial.status === 'in_van') {
                                throw new Error(`Cannot approve van inventory ID ${inventoryId}: Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`);
                            }
                            if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                await tx.serial_numbers.update({
                                    where: { id: existingSerial.id },
                                    data: {
                                        status: 'in_van',
                                        location_id: inventory.location_id,
                                        updatedate: new Date(),
                                        updatedby: userId,
                                    },
                                });
                                console.log(`Updated serial ${serialNumber} status → in_van`);
                                await updateInventoryStock(tx, product.id, inventory.location_id, 1, 'L', null, existingSerial.id, userId, inventory.user_id);
                                await createStockMovement(tx, {
                                    product_id: product.id,
                                    batch_id: null,
                                    serial_id: existingSerial.id,
                                    movement_type: 'VAN_LOAD',
                                    reference_type: 'VAN_INVENTORY',
                                    reference_id: inventoryId,
                                    quantity: 1,
                                    remarks: item.remarks || 'Approved serial load',
                                    van_inventory_id: inventoryId,
                                    createdby: userId,
                                });
                            }
                        }
                    }
                    else if (trackingType === 'NONE') {
                        const itemQty = parseInt(item.quantity, 10) || 0;
                        const itemBaseQty = parseInt(item.base_quantity, 10) || 0;
                        if (itemQty <= 0)
                            continue;
                        if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                            await updateInventoryStock(tx, product.id, inventory.location_id, itemQty, 'L', null, null, userId, inventory.user_id, itemBaseQty);
                            await createStockMovement(tx, {
                                product_id: product.id,
                                batch_id: null,
                                serial_id: null,
                                movement_type: 'VAN_LOAD',
                                reference_type: 'VAN_INVENTORY',
                                reference_id: inventoryId,
                                quantity: itemQty,
                                base_quantity: itemBaseQty,
                                remarks: item.remarks || 'Approved stock load',
                                van_inventory_id: inventoryId,
                                createdby: userId,
                            });
                        }
                    }
                }
                else if (loadingType === 'U') {
                    if (trackingType === 'BATCH') {
                        const batchData = item.batches || item.product_batches;
                        if (!batchData ||
                            !Array.isArray(batchData) ||
                            batchData.length === 0) {
                            continue;
                        }
                        for (const batchInput of batchData) {
                            const batchQty = parseInt(batchInput.quantity, 10) || 0;
                            const batchBaseQty = parseInt(batchInput.base_quantity, 10) || 0;
                            if (batchQty <= 0)
                                continue;
                            const batchLot = await tx.batch_lots.findFirst({
                                where: {
                                    batch_number: batchInput.batch_number,
                                    productsId: product.id,
                                    is_active: 'Y',
                                    salesman_id: Number(inventory.user_id),
                                },
                            });
                            if (!batchLot)
                                continue;
                            if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                await tx.batch_lots.update({
                                    where: { id: batchLot.id },
                                    data: {
                                        quantity: Math.max(0, batchLot.quantity - batchQty),
                                        remaining_quantity: Math.max(0, batchLot.remaining_quantity - batchQty),
                                        updatedate: new Date(),
                                    },
                                });
                                const productBatch = await tx.product_batches.findFirst({
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
                                            quantity: Math.max(0, productBatch.quantity - batchQty),
                                            updatedate: new Date(),
                                        },
                                    });
                                }
                                await updateInventoryStock(tx, product.id, inventory.location_id, batchQty, 'U', batchLot.id, null, userId, inventory.user_id, batchBaseQty);
                                await createStockMovement(tx, {
                                    product_id: product.id,
                                    batch_id: batchLot.id,
                                    serial_id: null,
                                    movement_type: 'VAN_UNLOAD',
                                    reference_type: 'VAN_INVENTORY',
                                    reference_id: inventoryId,
                                    quantity: batchQty,
                                    base_quantity: batchBaseQty,
                                    remarks: item.remarks || 'Approved stock unload',
                                    van_inventory_id: inventoryId,
                                    createdby: userId,
                                });
                            }
                        }
                    }
                    else if (trackingType === 'SERIAL') {
                        let serialData = [];
                        if (Array.isArray(item.serials)) {
                            serialData = item.serials;
                        }
                        else if (Array.isArray(item.product_serials)) {
                            serialData = item.product_serials;
                        }
                        else if (Array.isArray(item.serial_numbers)) {
                            serialData = item.serial_numbers;
                        }
                        if (!serialData.length)
                            continue;
                        for (const serialInput of serialData) {
                            const serialNumber = typeof serialInput === 'string'
                                ? serialInput
                                : serialInput.serial_number;
                            if (!serialNumber)
                                continue;
                            const existingSerial = await tx.serial_numbers.findFirst({
                                where: { serial_number: serialNumber },
                            });
                            if (!existingSerial)
                                continue;
                            const vanItem = await tx.van_inventory_items.findFirst({
                                where: {
                                    product_id: product.id,
                                    serial_id: existingSerial.id,
                                    quantity: { gt: 0 },
                                    van_inventory_items_inventory: {
                                        user_id: Number(inventory.user_id),
                                        is_active: 'Y',
                                    },
                                },
                            });
                            if (!vanItem)
                                continue;
                            if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                                const newVanQty = Math.max(0, (vanItem.quantity || 0) - 1);
                                await tx.van_inventory_items.update({
                                    where: { id: vanItem.id },
                                    data: {
                                        quantity: newVanQty,
                                        total_amount: newVanQty * Number(vanItem.unit_price || 0),
                                    },
                                });
                                await tx.serial_numbers.update({
                                    where: { id: existingSerial.id },
                                    data: {
                                        status: 'available',
                                        location_id: inventory.location_id,
                                        updatedate: new Date(),
                                        updatedby: userId,
                                    },
                                });
                                await updateInventoryStock(tx, product.id, inventory.location_id, 1, 'U', null, existingSerial.id, userId, inventory.user_id);
                                await createStockMovement(tx, {
                                    product_id: product.id,
                                    batch_id: null,
                                    serial_id: existingSerial.id,
                                    movement_type: 'VAN_UNLOAD',
                                    reference_type: 'VAN_INVENTORY',
                                    reference_id: inventoryId,
                                    quantity: 1,
                                    remarks: item.remarks || 'Approved serial unload',
                                    van_inventory_id: inventoryId,
                                    createdby: userId,
                                });
                            }
                        }
                    }
                    else if (trackingType === 'NONE') {
                        const itemQty = parseInt(item.quantity, 10) || 0;
                        const itemBaseQty = parseInt(item.base_quantity, 10) || 0;
                        if (itemQty <= 0)
                            continue;
                        if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                            await updateInventoryStock(tx, product.id, inventory.location_id, itemQty, 'U', null, null, userId, inventory.user_id, itemBaseQty);
                            await createStockMovement(tx, {
                                product_id: product.id,
                                batch_id: null,
                                serial_id: null,
                                movement_type: 'VAN_UNLOAD',
                                reference_type: 'VAN_INVENTORY',
                                reference_id: inventoryId,
                                quantity: itemQty,
                                base_quantity: itemBaseQty,
                                remarks: item.remarks || 'Approved stock unload',
                                van_inventory_id: inventoryId,
                                createdby: userId,
                            });
                        }
                    }
                }
            }
        }, {
            maxWait: 6000000,
            timeout: 300000,
        });
        console.log(`Successfully processed stock operations for van inventory ID: ${inventoryId}`);
    },
    // async createOrUpdateReconciliationSAP(payload: any, userId: number) {
    //   const { salesman_sap_code, depot_sap_code, document_date } = payload;
    //   const items = payload.reconciliation_items || payload.items;
    //   if (!salesman_sap_code) {
    //     throw new Error('salesman_sap_code is required');
    //   }
    //   if (!document_date) {
    //     throw new Error('document_date is required');
    //   }
    //   if (!items || !Array.isArray(items) || items.length === 0) {
    //     throw new Error(
    //       'reconciliation_items array is required and must not be empty'
    //     );
    //   }
    //   const normalizedItems: any[] = [];
    //   for (const item of items) {
    //     if (
    //       item.batches &&
    //       Array.isArray(item.batches) &&
    //       item.batches.length > 0
    //     ) {
    //       const rawItemQty = item.quantity ?? item.actual_qty;
    //       if (
    //         rawItemQty !== undefined &&
    //         rawItemQty !== null &&
    //         rawItemQty !== ''
    //       ) {
    //         const expectedQty = Number(rawItemQty);
    //         const totalBatchQty = item.batches.reduce((sum: number, b: any) => {
    //           const bQty = b.quantity ?? b.actual_qty;
    //           return (
    //             sum +
    //             (bQty !== undefined && bQty !== null && bQty !== ''
    //               ? Number(bQty)
    //               : 0)
    //           );
    //         }, 0);
    //         if (Math.abs(expectedQty - totalBatchQty) > 0.0001) {
    //           const productRef =
    //             item.product_sap_code ||
    //             item.product_id ||
    //             (item.sap_lineid ? `line ${item.sap_lineid}` : 'item');
    //           throw new Error(
    //             `Item quantity (${expectedQty}) does not match the combined batch quantity (${totalBatchQty}) for ${productRef}`
    //           );
    //         }
    //       }
    //       for (let bIdx = 0; bIdx < item.batches.length; bIdx++) {
    //         const b = item.batches[bIdx];
    //         normalizedItems.push({
    //           ...item,
    //           ...b,
    //           sap_lineid:
    //             b.sap_lineid !== undefined &&
    //             b.sap_lineid !== null &&
    //             b.sap_lineid !== ''
    //               ? b.sap_lineid
    //               : item.sap_lineid !== undefined &&
    //                   item.sap_lineid !== null &&
    //                   item.sap_lineid !== ''
    //                 ? item.sap_lineid
    //                 : `${bIdx + 1}`,
    //           batch_number: b.batch_number ?? item.batch_number ?? null,
    //           quantity:
    //             b.quantity ?? b.actual_qty ?? item.quantity ?? item.actual_qty,
    //           base_quantity:
    //             b.base_quantity ??
    //             b.actual_base_qty ??
    //             item.base_quantity ??
    //             item.actual_base_qty,
    //         });
    //       }
    //     } else {
    //       normalizedItems.push(item);
    //     }
    //   }
    //   const spUser = await prisma.users.findFirst({
    //     where: { sap_code: salesman_sap_code },
    //   });
    //   if (!spUser) {
    //     throw new Error(`Salesman with SAP code ${salesman_sap_code} not found`);
    //   }
    //   if (document_date) {
    //     const parsedDate = new Date(document_date);
    //     if (isNaN(parsedDate.getTime())) {
    //       throw new Error(`Invalid document_date: ${document_date}`);
    //     }
    //     const today = new Date();
    //     const todayUTC = Date.UTC(
    //       today.getUTCFullYear(),
    //       today.getUTCMonth(),
    //       today.getUTCDate()
    //     );
    //     const dateUTC = Date.UTC(
    //       parsedDate.getUTCFullYear(),
    //       parsedDate.getUTCMonth(),
    //       parsedDate.getUTCDate()
    //     );
    //     if (dateUTC > todayUTC) {
    //       throw new Error('Future date will not be allowed');
    //     }
    //   }
    //   let depotId: number | null = null;
    //   if (depot_sap_code) {
    //     const depot = await prisma.depots.findFirst({
    //       where: { sap_code: depot_sap_code },
    //     });
    //     if (!depot) {
    //       throw new Error(`Depot with SAP code ${depot_sap_code} not found`);
    //     }
    //     depotId = depot.id;
    //   }
    //   const targetDate = new Date(document_date);
    //   const dayStart = new Date(
    //     Date.UTC(
    //       targetDate.getUTCFullYear(),
    //       targetDate.getUTCMonth(),
    //       targetDate.getUTCDate()
    //     )
    //   );
    //   const dayEnd = new Date(
    //     Date.UTC(
    //       targetDate.getUTCFullYear(),
    //       targetDate.getUTCMonth(),
    //       targetDate.getUTCDate() + 1
    //     )
    //   );
    //   let reconciliationRecord: any = await prisma.reconciliation.findFirst({
    //     where: {
    //       salesman_id: spUser.id,
    //       is_active: 'Y',
    //       reconciliation_date: { gte: dayStart, lt: dayEnd },
    //     },
    //     orderBy: { id: 'desc' },
    //   });
    //   if (!reconciliationRecord) {
    //     throw new Error(
    //       `Reconciliation not found for salesman ${salesman_sap_code} on ${document_date}. Please ensure salesman has completed unload first.`
    //     );
    //   }
    //   if (reconciliationRecord.status?.toUpperCase() !== 'P') {
    //     throw new Error(
    //       `Reconciliation ID ${reconciliationRecord.id} is not in pending status (current status: '${reconciliationRecord.status}'). Only pending (P) reconciliations can be synced.`
    //     );
    //   }
    //   console.log(
    //     `SAP Reconciliation Found existing pending reconciliation ID: ${reconciliationRecord.id} for salesman ${salesman_sap_code} on ${document_date}`
    //   );
    //   if (depotId && !reconciliationRecord.depot_id) {
    //     reconciliationRecord = await prisma.reconciliation.update({
    //       where: { id: reconciliationRecord.id },
    //       data: { depot_id: depotId },
    //     });
    //   }
    //   const reconId: number = reconciliationRecord.id;
    //   const results = await prisma.$transaction(
    //     async tx => {
    //       const processedItems: any[] = [];
    //       const seenSapDocs = new Set<string>();
    //       for (const itemPayload of normalizedItems) {
    //         const itemCode =
    //           itemPayload.product_sap_code || itemPayload.sap_item_code;
    //         if (!itemCode) {
    //           throw new Error(
    //             'product_sap_code is required for each reconciliation item'
    //           );
    //         }
    //         const product = await tx.products.findFirst({
    //           where: { sap_code: itemCode },
    //           include: {
    //             product_unit_of_measurement: true,
    //           },
    //         });
    //         if (!product) {
    //           throw new Error(`Product with SAP code ${itemCode} not found`);
    //         }
    //         if (
    //           itemPayload.source_system === undefined ||
    //           itemPayload.source_system === null ||
    //           itemPayload.source_system === ''
    //         ) {
    //           throw new Error(
    //             'source_system is required for each reconciliation item'
    //           );
    //         }
    //         if (
    //           itemPayload.sap_docentry === undefined ||
    //           itemPayload.sap_docentry === null ||
    //           itemPayload.sap_docentry === ''
    //         ) {
    //           throw new Error(
    //             'sap_docentry is required for each reconciliation item'
    //           );
    //         }
    //         if (
    //           itemPayload.sap_docnum === undefined ||
    //           itemPayload.sap_docnum === null ||
    //           itemPayload.sap_docnum === ''
    //         ) {
    //           throw new Error(
    //             'sap_docnum is required for each reconciliation item'
    //           );
    //         }
    //         if (
    //           itemPayload.sap_lineid === undefined ||
    //           itemPayload.sap_lineid === null ||
    //           itemPayload.sap_lineid === ''
    //         ) {
    //           throw new Error(
    //             'sap_lineid is required for each reconciliation item'
    //           );
    //         }
    //         const sourceSystem = itemPayload.source_system.toString();
    //         const sapDocEntry = itemPayload.sap_docentry.toString();
    //         const sapDocNum = itemPayload.sap_docnum.toString();
    //         const sapLineId = itemPayload.sap_lineid.toString();
    //         const batchNumber = itemPayload.batch_number || null;
    //         const compositeKey = batchNumber
    //           ? `${sourceSystem}_${sapDocEntry}_${sapLineId}_${batchNumber}`
    //           : `${sourceSystem}_${sapDocEntry}_${sapLineId}`;
    //         if (seenSapDocs.has(compositeKey)) {
    //           throw new Error(
    //             `Duplicate SAP document line/batch in payload: ${compositeKey}`
    //           );
    //         }
    //         seenSapDocs.add(compositeKey);
    //         const existingSapDoc = await tx.reconciliation_items.findFirst({
    //           where: {
    //             source_system: sourceSystem,
    //             sap_docentry: sapDocEntry,
    //             sap_lineid: sapLineId,
    //             ...(batchNumber ? { batch_number: batchNumber } : {}),
    //             is_active: 'Y',
    //           },
    //         });
    //         if (existingSapDoc) {
    //           throw new Error(`SAP document already imported: ${compositeKey}`);
    //         }
    //         const rawQty = itemPayload.quantity ?? itemPayload.actual_qty;
    //         const parsedActual =
    //           rawQty !== undefined && rawQty !== null && rawQty !== ''
    //             ? Number(rawQty)
    //             : null;
    //         const rawBaseQty =
    //           itemPayload.base_quantity ?? itemPayload.actual_base_qty;
    //         const parsedActualBase =
    //           rawBaseQty !== undefined && rawBaseQty !== null && rawBaseQty !== ''
    //             ? Number(rawBaseQty)
    //             : null;
    //         const payloadLoadQty =
    //           itemPayload.load_qty !== undefined &&
    //           itemPayload.load_qty !== null &&
    //           itemPayload.load_qty !== ''
    //             ? Number(itemPayload.load_qty)
    //             : undefined;
    //         const payloadLoadBaseQty =
    //           itemPayload.load_base_qty !== undefined &&
    //           itemPayload.load_base_qty !== null &&
    //           itemPayload.load_base_qty !== ''
    //             ? Number(itemPayload.load_base_qty)
    //             : undefined;
    //         const payloadSaleQty =
    //           itemPayload.sale_qty !== undefined &&
    //           itemPayload.sale_qty !== null &&
    //           itemPayload.sale_qty !== ''
    //             ? Number(itemPayload.sale_qty)
    //             : undefined;
    //         const payloadSaleBaseQty =
    //           itemPayload.sale_base_qty !== undefined &&
    //           itemPayload.sale_base_qty !== null &&
    //           itemPayload.sale_base_qty !== ''
    //             ? Number(itemPayload.sale_base_qty)
    //             : undefined;
    //         const payloadExpectedQty =
    //           itemPayload.expected_qty !== undefined &&
    //           itemPayload.expected_qty !== null &&
    //           itemPayload.expected_qty !== ''
    //             ? Number(itemPayload.expected_qty)
    //             : undefined;
    //         const payloadExpectedBaseQty =
    //           itemPayload.expected_base_qty !== undefined &&
    //           itemPayload.expected_base_qty !== null &&
    //           itemPayload.expected_base_qty !== ''
    //             ? Number(itemPayload.expected_base_qty)
    //             : undefined;
    //         let record: any = await tx.reconciliation_items.findFirst({
    //           where: {
    //             reconciliation_id: reconId,
    //             product_id: product.id,
    //             ...(batchNumber ? { batch_number: batchNumber } : {}),
    //             is_active: 'Y',
    //           },
    //           include: {
    //             reconciliation: { include: { salesman: true, depot: true } },
    //             product: { include: { product_unit_of_measurement: true } },
    //           },
    //         });
    //         const conv =
    //           Number(product.product_unit_of_measurement?.conversion_rate) || 1;
    //         const loadQty =
    //           payloadLoadQty !== undefined
    //             ? payloadLoadQty
    //             : record?.load_qty !== null && record?.load_qty !== undefined
    //               ? Number(record.load_qty)
    //               : 0;
    //         const loadBaseQty =
    //           payloadLoadBaseQty !== undefined
    //             ? payloadLoadBaseQty
    //             : record?.load_base_qty !== null &&
    //                 record?.load_base_qty !== undefined
    //               ? Number(record.load_base_qty)
    //               : 0;
    //         let saleQty =
    //           payloadSaleQty !== undefined
    //             ? payloadSaleQty
    //             : record?.sale_qty !== null && record?.sale_qty !== undefined
    //               ? Number(record.sale_qty)
    //               : 0;
    //         let saleBaseQty =
    //           payloadSaleBaseQty !== undefined
    //             ? payloadSaleBaseQty
    //             : record?.sale_base_qty !== null &&
    //                 record?.sale_base_qty !== undefined
    //               ? Number(record.sale_base_qty)
    //               : 0;
    //         const salesmanId = record?.reconciliation?.salesman_id || spUser.id;
    //         const recCreatedate =
    //           record?.reconciliation?.createdate ||
    //           reconciliationRecord.createdate;
    //         if (
    //           payloadSaleQty === undefined &&
    //           record?.sale_qty === null &&
    //           salesmanId &&
    //           product.id &&
    //           recCreatedate
    //         ) {
    //           const prevReconciliation = await tx.reconciliation.findFirst({
    //             where: {
    //               salesman_id: salesmanId,
    //               createdate: { lt: recCreatedate },
    //               id: { lt: reconId },
    //             },
    //             orderBy: { createdate: 'desc' },
    //           });
    //           const sessionStart = prevReconciliation?.createdate ?? new Date(0);
    //           const batchMovements = await tx.stock_movements.findMany({
    //             where: {
    //               movement_type: { in: ['SALE', 'OUT'] },
    //               product_id: product.id,
    //               is_active: 'Y',
    //               createdate: { gte: sessionStart, lt: recCreatedate },
    //               ...(batchNumber
    //                 ? { batch_lots: { batch_number: batchNumber } }
    //                 : {}),
    //             },
    //             select: { quantity: true, base_quantity: true },
    //           });
    //           if (batchMovements.length > 0) {
    //             saleQty = batchMovements.reduce(
    //               (sum: number, m: any) => sum + (Number(m.quantity) || 0),
    //               0
    //             );
    //             saleBaseQty = batchMovements.reduce(
    //               (sum: number, m: any) => sum + (Number(m.base_quantity) || 0),
    //               0
    //             );
    //           }
    //         }
    //         let expectedQty: number;
    //         let expectedBaseQty: number;
    //         let expectedTotalPieces: number;
    //         if (payloadExpectedQty !== undefined) {
    //           expectedQty = payloadExpectedQty;
    //           expectedBaseQty = payloadExpectedBaseQty ?? 0;
    //           expectedTotalPieces = expectedQty * conv + expectedBaseQty;
    //           console.log(
    //             `[SAP Reconciliation] Using payload expected_qty=${expectedQty}, expected_base_qty=${expectedBaseQty} for ${itemCode}`
    //           );
    //         } else if (
    //           record?.expected_qty !== null &&
    //           record?.expected_qty !== undefined
    //         ) {
    //           expectedQty = Number(record.expected_qty);
    //           expectedBaseQty = Number(record.expected_base_qty ?? 0);
    //           expectedTotalPieces = expectedQty * conv + expectedBaseQty;
    //           console.log(
    //             `[SAP Reconciliation] Using existing record expected_qty=${expectedQty}, expected_base_qty=${expectedBaseQty} for ${itemCode}`
    //           );
    //         } else {
    //           expectedTotalPieces = Math.max(
    //             0,
    //             loadQty * conv + loadBaseQty - (saleQty * conv + saleBaseQty)
    //           );
    //           expectedQty =
    //             conv > 1
    //               ? Math.floor(expectedTotalPieces / conv)
    //               : Math.max(0, loadQty - saleQty);
    //           expectedBaseQty =
    //             conv > 1
    //               ? expectedTotalPieces % conv
    //               : Math.max(0, loadBaseQty - saleBaseQty);
    //           console.log(
    //             `[SAP Reconciliation] Auto-computed expected_qty=${expectedQty}, expected_base_qty=${expectedBaseQty} for ${itemCode}`
    //           );
    //         }
    //         let variance: number | null = null;
    //         let variance_base_qty: number | null = null;
    //         let resAction = 'Awaiting Verification';
    //         const effectiveActual =
    //           parsedActual !== null
    //             ? parsedActual
    //             : record?.actual_qty !== null && record?.actual_qty !== undefined
    //               ? Number(record.actual_qty)
    //               : null;
    //         const effectiveActualBase =
    //           parsedActualBase !== null
    //             ? parsedActualBase
    //             : record?.actual_base_qty !== null &&
    //                 record?.actual_base_qty !== undefined
    //               ? Number(record.actual_base_qty)
    //               : null;
    //         if (effectiveActual !== null || effectiveActualBase !== null) {
    //           const actual = effectiveActual || 0;
    //           const actualBase = effectiveActualBase || 0;
    //           const actualTotalPieces = actual * conv + actualBase;
    //           const variancePieces = Math.round(
    //             actualTotalPieces - expectedTotalPieces
    //           );
    //           if (variancePieces === 0) {
    //             variance = 0;
    //             variance_base_qty = 0;
    //             resAction = 'CLEAN';
    //           } else {
    //             const absV = Math.abs(variancePieces);
    //             variance = Math.floor(absV / conv) * Math.sign(variancePieces);
    //             variance_base_qty = (absV % conv) * Math.sign(variancePieces);
    //             resAction = 'Post to Default Outlet';
    //           }
    //         }
    //         const defaultOutletPostingQty =
    //           resAction === 'Post to Default Outlet' && variance !== null
    //             ? Math.abs(variance)
    //             : 0;
    //         const defaultOutletPostingBaseQty =
    //           resAction === 'Post to Default Outlet' && variance_base_qty !== null
    //             ? Math.abs(variance_base_qty)
    //             : 0;
    //         const unloadAdjustmentQty =
    //           resAction === 'Adjust Unload Upward' && variance !== null
    //             ? variance
    //             : 0;
    //         const unloadAdjustmentBaseQty =
    //           resAction === 'Adjust Unload Upward' && variance_base_qty !== null
    //             ? variance_base_qty
    //             : 0;
    //         const itemData: any = {
    //           reconciliation_id: reconId,
    //           product_id: product.id,
    //           sap_item_code: itemCode,
    //           sap_docnum: sapDocNum,
    //           sap_docentry: sapDocEntry,
    //           sap_lineid: sapLineId,
    //           source_system: sourceSystem,
    //           batch_number: batchNumber,
    //           load_qty: loadQty,
    //           load_base_qty: loadBaseQty,
    //           sale_qty: saleQty,
    //           sale_base_qty: saleBaseQty,
    //           expected_qty: expectedQty,
    //           expected_base_qty: expectedBaseQty,
    //           actual_qty: effectiveActual,
    //           actual_base_qty: effectiveActualBase,
    //           unit_price:
    //             itemPayload.purchase_price !== undefined &&
    //             itemPayload.purchase_price !== null &&
    //             itemPayload.purchase_price !== ''
    //               ? Number(itemPayload.purchase_price)
    //               : itemPayload.unit_price !== undefined &&
    //                   itemPayload.unit_price !== null &&
    //                   itemPayload.unit_price !== ''
    //                 ? Number(itemPayload.unit_price)
    //                 : record?.unit_price ?? null,
    //           variance,
    //           variance_base_qty,
    //           resolution_action: resAction,
    //           default_outlet_posting_qty: defaultOutletPostingQty,
    //           default_outlet_posting_base_qty: defaultOutletPostingBaseQty,
    //           unload_adjustment_qty: unloadAdjustmentQty,
    //           unload_adjustment_base_qty: unloadAdjustmentBaseQty,
    //           is_active: itemPayload.is_active || 'Y',
    //           stock_key: `${salesman_sap_code} | ${itemCode}${batchNumber ? ` | ${batchNumber}` : ''}`,
    //           updatedate: new Date(),
    //           updatedby: userId,
    //         };
    //         let savedItem: any;
    //         if (record) {
    //           savedItem = await (tx as any).reconciliation_items.update({
    //             where: { id: record.id },
    //             data: itemData,
    //           });
    //         } else {
    //           itemData.createdate = new Date();
    //           itemData.createdby = userId;
    //           savedItem = await (tx as any).reconciliation_items.create({
    //             data: itemData,
    //           });
    //         }
    //         processedItems.push({
    //           ...savedItem,
    //           reconciliation_id: reconId,
    //         });
    //       }
    //       if (processedItems.length > 0) {
    //         await tx.reconciliation.update({
    //           where: { id: reconId },
    //           data: {
    //             status: 'P',
    //             updatedate: new Date(),
    //             updatedby: userId,
    //           },
    //         });
    //       }
    //       return processedItems;
    //     },
    //     {
    //       maxWait: 1500000,
    //       timeout: 3000000,
    //     }
    //   );
    //   console.log(
    //     `[SAP Reconciliation] Processed ${results.length} items for reconciliation ID: ${reconId}`
    //   );
    //   return {
    //     reconciliation_id: reconId,
    //     updated_items: results.length,
    //     items: results,
    //   };
    // },
    async createOrUpdateReconciliationSAP(payload, userId, options) {
        const { salesman_sap_code, depot_sap_code, document_date } = payload;
        const items = payload.reconciliation_items || payload.items;
        if (!salesman_sap_code) {
            throw new Error('salesman_sap_code is required');
        }
        if (!document_date) {
            throw new Error('document_date is required');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('reconciliation_items array is required and must not be empty');
        }
        let normalizedItems = [];
        for (const item of items) {
            if (item.batches &&
                Array.isArray(item.batches) &&
                item.batches.length > 0) {
                const rawItemQty = item.quantity ?? item.actual_qty;
                if (rawItemQty !== undefined &&
                    rawItemQty !== null &&
                    rawItemQty !== '') {
                    const expectedQty = Number(rawItemQty);
                    const totalBatchQty = item.batches.reduce((sum, b) => {
                        const bQty = b.quantity ?? b.actual_qty;
                        return (sum +
                            (bQty !== undefined && bQty !== null && bQty !== ''
                                ? Number(bQty)
                                : 0));
                    }, 0);
                    if (Math.abs(expectedQty - totalBatchQty) > 0.0001) {
                        const productRef = item.product_sap_code ||
                            item.product_id ||
                            (item.sap_lineid ? `line ${item.sap_lineid}` : 'item');
                        throw new Error(`Item quantity (${expectedQty}) does not match the combined batch quantity (${totalBatchQty}) for ${productRef}`);
                    }
                }
                for (let bIdx = 0; bIdx < item.batches.length; bIdx++) {
                    const b = item.batches[bIdx];
                    normalizedItems.push({
                        ...item,
                        ...b,
                        sap_lineid: b.sap_lineid !== undefined &&
                            b.sap_lineid !== null &&
                            b.sap_lineid !== ''
                            ? b.sap_lineid
                            : item.sap_lineid !== undefined &&
                                item.sap_lineid !== null &&
                                item.sap_lineid !== ''
                                ? item.sap_lineid
                                : `${bIdx + 1}`,
                        batch_number: b.batch_number ?? item.batch_number ?? null,
                        quantity: b.quantity ?? b.actual_qty ?? item.quantity ?? item.actual_qty,
                        base_quantity: b.base_quantity ??
                            b.actual_base_qty ??
                            item.base_quantity ??
                            item.actual_base_qty,
                    });
                }
            }
            else {
                normalizedItems.push(item);
            }
        }
        const spUser = await prisma_client_1.default.users.findFirst({
            where: { sap_code: salesman_sap_code },
        });
        if (!spUser) {
            throw new Error(`Salesman with SAP code ${salesman_sap_code} not found`);
        }
        if (document_date) {
            const parsedDate = new Date(document_date);
            if (isNaN(parsedDate.getTime())) {
                throw new Error(`Invalid document_date: ${document_date}`);
            }
            const today = new Date();
            const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
            const dateUTC = Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate());
            if (dateUTC > todayUTC) {
                throw new Error('Future date will not be allowed');
            }
        }
        let depotId = null;
        if (depot_sap_code) {
            const depot = await prisma_client_1.default.depots.findFirst({
                where: { sap_code: depot_sap_code },
            });
            if (!depot) {
                throw new Error(`Depot with SAP code ${depot_sap_code} not found`);
            }
            depotId = depot.id;
        }
        const targetDate = new Date(document_date);
        const dayStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
        const dayEnd = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() + 1));
        let reconciliationRecord = await prisma_client_1.default.reconciliation.findFirst({
            where: {
                salesman_id: spUser.id,
                is_active: 'Y',
                reconciliation_date: { gte: dayStart, lt: dayEnd },
            },
            orderBy: { id: 'desc' },
        });
        if (!reconciliationRecord) {
            if (options?.isApprovedCommit) {
                reconciliationRecord = await prisma_client_1.default.reconciliation.create({
                    data: {
                        salesman_id: spUser.id,
                        depot_id: depotId || spUser.depot_id || null,
                        reconciliation_date: new Date(document_date),
                        status: 'P',
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                    },
                });
                console.log(`[SAP Reconciliation] Created new pending reconciliation #${reconciliationRecord.id} for salesman ${salesman_sap_code} on ${document_date} for approved credit memo.`);
            }
            else {
                throw new Error(`Reconciliation not found for salesman ${salesman_sap_code} on ${document_date}. Please ensure salesman has completed unload first.`);
            }
        }
        if (reconciliationRecord.status?.toUpperCase() !== 'P') {
            throw new Error(`Reconciliation ID ${reconciliationRecord.id} is not in pending status (current status: '${reconciliationRecord.status}'). Only pending (P) reconciliations can be synced.`);
        }
        console.log(`SAP Reconciliation Found existing pending reconciliation ID: ${reconciliationRecord.id} for salesman ${salesman_sap_code} on ${document_date}`);
        if (depotId && !reconciliationRecord.depot_id) {
            reconciliationRecord = await prisma_client_1.default.reconciliation.update({
                where: { id: reconciliationRecord.id },
                data: { depot_id: depotId },
            });
        }
        const reconId = reconciliationRecord.id;
        if (!options?.isApprovedCommit) {
            const creditMemoItems = normalizedItems.filter(item => item.source_system?.toLowerCase() === 'sap_ar_creditmemo');
            if (creditMemoItems.length > 0) {
                const stagedResult = await this.stageCreditMemoForApproval({
                    payload,
                    salesman_sap_code,
                    depot_sap_code,
                    document_date,
                    creditMemoItems,
                    spUser,
                    depotId,
                    userId,
                    reconciliationId: reconId,
                });
                if (creditMemoItems.length === normalizedItems.length) {
                    return stagedResult;
                }
                normalizedItems = normalizedItems.filter(item => item.source_system?.toLowerCase() !== 'sap_ar_creditmemo');
            }
        }
        const results = await prisma_client_1.default.$transaction(async (tx) => {
            const processedItems = [];
            const seenSapDocs = new Set();
            for (const itemPayload of normalizedItems) {
                const itemCode = itemPayload.product_sap_code || itemPayload.sap_item_code;
                if (!itemCode) {
                    throw new Error('product_sap_code is required for each reconciliation item');
                }
                const product = await tx.products.findFirst({
                    where: { sap_code: itemCode },
                    include: {
                        product_unit_of_measurement: true,
                    },
                });
                if (!product) {
                    throw new Error(`Product with SAP code ${itemCode} not found`);
                }
                if (itemPayload.source_system === undefined ||
                    itemPayload.source_system === null ||
                    itemPayload.source_system === '') {
                    throw new Error('source_system is required for each reconciliation item');
                }
                if (itemPayload.sap_docentry === undefined ||
                    itemPayload.sap_docentry === null ||
                    itemPayload.sap_docentry === '') {
                    throw new Error('sap_docentry is required for each reconciliation item');
                }
                if (itemPayload.sap_docnum === undefined ||
                    itemPayload.sap_docnum === null ||
                    itemPayload.sap_docnum === '') {
                    throw new Error('sap_docnum is required for each reconciliation item');
                }
                if (itemPayload.sap_lineid === undefined ||
                    itemPayload.sap_lineid === null ||
                    itemPayload.sap_lineid === '') {
                    throw new Error('sap_lineid is required for each reconciliation item');
                }
                const sourceSystem = itemPayload.source_system.toString();
                const sapDocEntry = itemPayload.sap_docentry.toString();
                const sapDocNum = itemPayload.sap_docnum.toString();
                const sapLineId = itemPayload.sap_lineid.toString();
                const batchNumber = itemPayload.batch_number || null;
                const compositeKey = batchNumber
                    ? `${sourceSystem}_${sapDocEntry}_${sapLineId}_${batchNumber}`
                    : `${sourceSystem}_${sapDocEntry}_${sapLineId}`;
                if (seenSapDocs.has(compositeKey)) {
                    throw new Error(`Duplicate SAP document line/batch in payload: ${compositeKey}`);
                }
                seenSapDocs.add(compositeKey);
                const existingSapDoc = await tx.reconciliation_items.findFirst({
                    where: {
                        source_system: sourceSystem,
                        sap_docentry: sapDocEntry,
                        sap_lineid: sapLineId,
                        ...(batchNumber ? { batch_number: batchNumber } : {}),
                        is_active: 'Y',
                    },
                });
                if (existingSapDoc) {
                    throw new Error(`SAP document already imported: ${compositeKey}`);
                }
                const rawQty = itemPayload.quantity ?? itemPayload.actual_qty;
                const parsedActual = rawQty !== undefined && rawQty !== null && rawQty !== ''
                    ? Number(rawQty)
                    : null;
                const rawBaseQty = itemPayload.base_quantity ?? itemPayload.actual_base_qty;
                const parsedActualBase = rawBaseQty !== undefined && rawBaseQty !== null && rawBaseQty !== ''
                    ? Number(rawBaseQty)
                    : null;
                const payloadLoadQty = itemPayload.load_qty !== undefined &&
                    itemPayload.load_qty !== null &&
                    itemPayload.load_qty !== ''
                    ? Number(itemPayload.load_qty)
                    : undefined;
                const payloadLoadBaseQty = itemPayload.load_base_qty !== undefined &&
                    itemPayload.load_base_qty !== null &&
                    itemPayload.load_base_qty !== ''
                    ? Number(itemPayload.load_base_qty)
                    : undefined;
                const payloadSaleQty = itemPayload.sale_qty !== undefined &&
                    itemPayload.sale_qty !== null &&
                    itemPayload.sale_qty !== ''
                    ? Number(itemPayload.sale_qty)
                    : undefined;
                const payloadSaleBaseQty = itemPayload.sale_base_qty !== undefined &&
                    itemPayload.sale_base_qty !== null &&
                    itemPayload.sale_base_qty !== ''
                    ? Number(itemPayload.sale_base_qty)
                    : undefined;
                const payloadExpectedQty = itemPayload.expected_qty !== undefined &&
                    itemPayload.expected_qty !== null &&
                    itemPayload.expected_qty !== ''
                    ? Number(itemPayload.expected_qty)
                    : undefined;
                const payloadExpectedBaseQty = itemPayload.expected_base_qty !== undefined &&
                    itemPayload.expected_base_qty !== null &&
                    itemPayload.expected_base_qty !== ''
                    ? Number(itemPayload.expected_base_qty)
                    : undefined;
                let record = await tx.reconciliation_items.findFirst({
                    where: {
                        reconciliation_id: reconId,
                        product_id: product.id,
                        ...(batchNumber ? { batch_number: batchNumber } : {}),
                        is_active: 'Y',
                    },
                    include: {
                        reconciliation: { include: { salesman: true, depot: true } },
                        product: { include: { product_unit_of_measurement: true } },
                    },
                });
                const conv = Number(product.product_unit_of_measurement?.conversion_rate) || 1;
                const loadQty = payloadLoadQty !== undefined
                    ? payloadLoadQty
                    : record?.load_qty !== null && record?.load_qty !== undefined
                        ? Number(record.load_qty)
                        : 0;
                const loadBaseQty = payloadLoadBaseQty !== undefined
                    ? payloadLoadBaseQty
                    : record?.load_base_qty !== null &&
                        record?.load_base_qty !== undefined
                        ? Number(record.load_base_qty)
                        : 0;
                let saleQty = payloadSaleQty !== undefined
                    ? payloadSaleQty
                    : record?.sale_qty !== null && record?.sale_qty !== undefined
                        ? Number(record.sale_qty)
                        : 0;
                let saleBaseQty = payloadSaleBaseQty !== undefined
                    ? payloadSaleBaseQty
                    : record?.sale_base_qty !== null &&
                        record?.sale_base_qty !== undefined
                        ? Number(record.sale_base_qty)
                        : 0;
                const salesmanId = record?.reconciliation?.salesman_id || spUser.id;
                const recCreatedate = record?.reconciliation?.createdate ||
                    reconciliationRecord.createdate;
                if (payloadSaleQty === undefined &&
                    record?.sale_qty === null &&
                    salesmanId &&
                    product.id &&
                    recCreatedate) {
                    const prevReconciliation = await tx.reconciliation.findFirst({
                        where: {
                            salesman_id: salesmanId,
                            createdate: { lt: recCreatedate },
                            id: { lt: reconId },
                        },
                        orderBy: { createdate: 'desc' },
                    });
                    const sessionStart = prevReconciliation?.createdate ?? new Date(0);
                    const batchMovements = await tx.stock_movements.findMany({
                        where: {
                            movement_type: { in: ['SALE', 'OUT'] },
                            product_id: product.id,
                            is_active: 'Y',
                            createdate: { gte: sessionStart, lt: recCreatedate },
                            ...(batchNumber
                                ? { batch_lots: { batch_number: batchNumber } }
                                : {}),
                        },
                        select: { quantity: true, base_quantity: true },
                    });
                    if (batchMovements.length > 0) {
                        saleQty = batchMovements.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
                        saleBaseQty = batchMovements.reduce((sum, m) => sum + (Number(m.base_quantity) || 0), 0);
                    }
                }
                let expectedQty;
                let expectedBaseQty;
                let expectedTotalPieces;
                if (payloadExpectedQty !== undefined) {
                    expectedQty = payloadExpectedQty;
                    expectedBaseQty = payloadExpectedBaseQty ?? 0;
                    expectedTotalPieces = expectedQty * conv + expectedBaseQty;
                    console.log(`[SAP Reconciliation] Using payload expected_qty=${expectedQty}, expected_base_qty=${expectedBaseQty} for ${itemCode}`);
                }
                else if (record?.expected_qty !== null &&
                    record?.expected_qty !== undefined) {
                    expectedQty = Number(record.expected_qty);
                    expectedBaseQty = Number(record.expected_base_qty ?? 0);
                    expectedTotalPieces = expectedQty * conv + expectedBaseQty;
                    console.log(`[SAP Reconciliation] Using existing record expected_qty=${expectedQty}, expected_base_qty=${expectedBaseQty} for ${itemCode}`);
                }
                else {
                    expectedTotalPieces = Math.max(0, loadQty * conv + loadBaseQty - (saleQty * conv + saleBaseQty));
                    expectedQty =
                        conv > 1
                            ? Math.floor(expectedTotalPieces / conv)
                            : Math.max(0, loadQty - saleQty);
                    expectedBaseQty =
                        conv > 1
                            ? expectedTotalPieces % conv
                            : Math.max(0, loadBaseQty - saleBaseQty);
                    console.log(`[SAP Reconciliation] Auto-computed expected_qty=${expectedQty}, expected_base_qty=${expectedBaseQty} for ${itemCode}`);
                }
                let variance = null;
                let variance_base_qty = null;
                let resAction = 'Awaiting Verification';
                const effectiveActual = parsedActual !== null
                    ? parsedActual
                    : record?.actual_qty !== null && record?.actual_qty !== undefined
                        ? Number(record.actual_qty)
                        : null;
                const effectiveActualBase = parsedActualBase !== null
                    ? parsedActualBase
                    : record?.actual_base_qty !== null &&
                        record?.actual_base_qty !== undefined
                        ? Number(record.actual_base_qty)
                        : null;
                if (effectiveActual !== null || effectiveActualBase !== null) {
                    const actual = effectiveActual || 0;
                    const actualBase = effectiveActualBase || 0;
                    const actualTotalPieces = actual * conv + actualBase;
                    const variancePieces = Math.round(actualTotalPieces - expectedTotalPieces);
                    if (variancePieces === 0) {
                        variance = 0;
                        variance_base_qty = 0;
                        resAction = 'CLEAN';
                    }
                    else {
                        const absV = Math.abs(variancePieces);
                        variance = Math.floor(absV / conv) * Math.sign(variancePieces);
                        variance_base_qty = (absV % conv) * Math.sign(variancePieces);
                        resAction = 'Post to Default Outlet';
                    }
                }
                const defaultOutletPostingQty = resAction === 'Post to Default Outlet' && variance !== null
                    ? Math.abs(variance)
                    : 0;
                const defaultOutletPostingBaseQty = resAction === 'Post to Default Outlet' && variance_base_qty !== null
                    ? Math.abs(variance_base_qty)
                    : 0;
                const unloadAdjustmentQty = resAction === 'Adjust Unload Upward' && variance !== null
                    ? variance
                    : 0;
                const unloadAdjustmentBaseQty = resAction === 'Adjust Unload Upward' && variance_base_qty !== null
                    ? variance_base_qty
                    : 0;
                const itemData = {
                    reconciliation_id: reconId,
                    product_id: product.id,
                    sap_item_code: itemCode,
                    sap_docnum: sapDocNum,
                    sap_docentry: sapDocEntry,
                    sap_lineid: sapLineId,
                    source_system: sourceSystem,
                    batch_number: batchNumber,
                    load_qty: loadQty,
                    load_base_qty: loadBaseQty,
                    sale_qty: saleQty,
                    sale_base_qty: saleBaseQty,
                    expected_qty: expectedQty,
                    expected_base_qty: expectedBaseQty,
                    actual_qty: effectiveActual,
                    actual_base_qty: effectiveActualBase,
                    unit_price: itemPayload.purchase_price !== undefined &&
                        itemPayload.purchase_price !== null &&
                        itemPayload.purchase_price !== ''
                        ? Number(itemPayload.purchase_price)
                        : itemPayload.unit_price !== undefined &&
                            itemPayload.unit_price !== null &&
                            itemPayload.unit_price !== ''
                            ? Number(itemPayload.unit_price)
                            : (record?.unit_price ?? null),
                    variance,
                    variance_base_qty,
                    resolution_action: resAction,
                    default_outlet_posting_qty: defaultOutletPostingQty,
                    default_outlet_posting_base_qty: defaultOutletPostingBaseQty,
                    unload_adjustment_qty: unloadAdjustmentQty,
                    unload_adjustment_base_qty: unloadAdjustmentBaseQty,
                    is_active: itemPayload.is_active || 'Y',
                    stock_key: `${salesman_sap_code} | ${itemCode}${batchNumber ? ` | ${batchNumber}` : ''}`,
                    updatedate: new Date(),
                    updatedby: userId,
                };
                let savedItem;
                if (record) {
                    savedItem = await tx.reconciliation_items.update({
                        where: { id: record.id },
                        data: itemData,
                    });
                }
                else {
                    itemData.createdate = new Date();
                    itemData.createdby = userId;
                    savedItem = await tx.reconciliation_items.create({
                        data: itemData,
                    });
                }
                processedItems.push({
                    ...savedItem,
                    reconciliation_id: reconId,
                });
            }
            if (processedItems.length > 0) {
                await tx.reconciliation.update({
                    where: { id: reconId },
                    data: {
                        status: 'P',
                        updatedate: new Date(),
                        updatedby: userId,
                    },
                });
            }
            return processedItems;
        }, {
            maxWait: 1500000,
            timeout: 3000000,
        });
        console.log(`[SAP Reconciliation] Processed ${results.length} items for reconciliation ID: ${reconId}`);
        return {
            reconciliation_id: reconId,
            updated_items: results.length,
            items: results,
        };
    },
    async stageCreditMemoForApproval(params) {
        const { payload, salesman_sap_code, depot_sap_code, document_date, creditMemoItems, spUser, depotId, userId, reconciliationId, } = params;
        const sapDocNum = creditMemoItems[0]?.sap_docnum
            ? String(creditMemoItems[0].sap_docnum)
            : '';
        const sapDocEntry = creditMemoItems[0]?.sap_docentry
            ? String(creditMemoItems[0].sap_docentry)
            : '';
        // 1. Check if credit memo header was already approved or is pending
        // if (sapDocNum || sapDocEntry) {
        //   const existingHeader = await (prisma as any).sap_creditmemo_header.findFirst({
        //     where: {
        //       source_system: 'sap_ar_creditmemo',
        //       OR: [
        //         ...(sapDocNum ? [{ sap_docnum: sapDocNum }] : []),
        //         ...(sapDocEntry ? [{ sap_docentry: sapDocEntry }] : []),
        //       ],
        //       is_active: 'Y',
        //       status: { in: ['P', 'A'] },
        //     },
        //   });
        //   if (existingHeader) {
        //     if (existingHeader.status === 'A') {
        //       throw new Error(
        //         `SAP credit memo document ${sapDocNum || sapDocEntry} has already been approved.`
        //       );
        //     } else {
        //       throw new Error(
        //         `SAP credit memo document ${sapDocNum || sapDocEntry} is already pending approval (Request #${existingHeader.id}).`
        //       );
        //     }
        //   }
        // }
        // 2. Upfront item-level validation:
        // - Check product existence
        // - Check required fields
        // - Check in-payload duplicates
        // - Check if line was already imported in reconciliation_items
        // - Check if line is already pending/approved in sap_creditmemo_line
        const seenSapDocs = new Set();
        for (const item of creditMemoItems) {
            const itemCode = item.product_sap_code || item.sap_item_code;
            if (!itemCode) {
                throw new Error('product_sap_code is required for each reconciliation item');
            }
            const product = await prisma_client_1.default.products.findFirst({
                where: { sap_code: itemCode },
            });
            if (!product) {
                throw new Error(`Product with SAP code ${itemCode} not found`);
            }
            const itemDocEntry = item.sap_docentry?.toString();
            const itemDocNum = item.sap_docnum?.toString();
            const itemLineId = item.sap_lineid?.toString();
            if (!itemDocEntry) {
                throw new Error('sap_docentry is required for each reconciliation item');
            }
            if (!itemDocNum) {
                throw new Error('sap_docnum is required for each reconciliation item');
            }
            if (itemLineId === undefined ||
                itemLineId === null ||
                itemLineId === '') {
                throw new Error('sap_lineid is required for each reconciliation item');
            }
            const sourceSystem = item.source_system?.toString() || 'sap_ar_creditmemo';
            const batchNumber = item.batch_number ? String(item.batch_number) : null;
            const compositeKey = batchNumber
                ? `${sourceSystem}_${itemDocEntry}_${itemLineId}_${batchNumber}`
                : `${sourceSystem}_${itemDocEntry}_${itemLineId}`;
            if (seenSapDocs.has(compositeKey)) {
                throw new Error(`Duplicate SAP document line/batch in payload: ${compositeKey}`);
            }
            seenSapDocs.add(compositeKey);
            // Check if already committed in reconciliation_items
            const existingSapDoc = await prisma_client_1.default.reconciliation_items.findFirst({
                where: {
                    source_system: sourceSystem,
                    sap_docentry: itemDocEntry,
                    sap_lineid: itemLineId,
                    ...(batchNumber ? { batch_number: batchNumber } : {}),
                    is_active: 'Y',
                },
            });
            if (existingSapDoc) {
                throw new Error(`SAP document already imported: ${compositeKey}`);
            }
            // Check if already in another pending or approved credit memo line
            const existingLine = await prisma_client_1.default.sap_creditmemo_line.findFirst({
                where: {
                    source_system: sourceSystem,
                    sap_docentry: itemDocEntry,
                    sap_lineid: itemLineId,
                    ...(batchNumber ? { batch_number: batchNumber } : {}),
                    status: { in: ['P', 'A'] },
                },
                include: {
                    sap_creditmemo_header: true,
                },
            });
            if (existingLine) {
                if (existingLine.sap_creditmemo_header?.status === 'A') {
                    throw new Error(`SAP document line already approved: ${compositeKey}`);
                }
                else {
                    throw new Error(`SAP document line is already pending approval: ${compositeKey} (Header #${existingLine.header_id})`);
                }
            }
        }
        const distinctDocNums = Array.from(new Set(creditMemoItems
            .map(i => (i.sap_docnum ? String(i.sap_docnum) : ''))
            .filter(Boolean)));
        const distinctDocEntries = Array.from(new Set(creditMemoItems
            .map(i => (i.sap_docentry ? String(i.sap_docentry) : ''))
            .filter(Boolean)));
        const headerDocNum = distinctDocNums.join(', ') || null;
        const headerDocEntry = distinctDocEntries.join(', ') || null;
        const batchRef = payload.batch_ref ||
            (distinctDocNums.length === 1
                ? `CM-${distinctDocNums[0]}-${document_date}`
                : `CM-${salesman_sap_code}-${document_date}-${Date.now()}`);
        const header = await prisma_client_1.default.sap_creditmemo_header.create({
            data: {
                batch_ref: batchRef,
                salesman_sap_code,
                depot_sap_code: depot_sap_code || null,
                document_date: new Date(document_date),
                status: 'P',
                reconciliation_id: reconciliationId || null,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userId,
                updatedate: new Date(),
                updatedby: userId,
                log_inst: 1,
            },
        });
        const linesData = creditMemoItems.map((item) => ({
            header_id: header.id,
            source_system: item.source_system
                ? String(item.source_system)
                : 'sap_ar_creditmemo',
            sap_docnum: item.sap_docnum ? String(item.sap_docnum) : null,
            sap_docentry: item.sap_docentry ? String(item.sap_docentry) : null,
            sap_lineid: String(item.sap_lineid || item.line_id || '0'),
            product_sap_code: String(item.product_sap_code || item.sap_item_code || ''),
            batch_number: item.batch_number ? String(item.batch_number) : null,
            quantity: item.quantity !== undefined &&
                item.quantity !== null &&
                item.quantity !== ''
                ? Number(item.quantity)
                : item.actual_qty !== undefined &&
                    item.actual_qty !== null &&
                    item.actual_qty !== ''
                    ? Number(item.actual_qty)
                    : null,
            base_quantity: item.base_quantity !== undefined &&
                item.base_quantity !== null &&
                item.base_quantity !== ''
                ? Number(item.base_quantity)
                : null,
            purchase_price: item.purchase_price !== undefined &&
                item.purchase_price !== null &&
                item.purchase_price !== ''
                ? Number(item.purchase_price)
                : item.unit_price !== undefined &&
                    item.unit_price !== null &&
                    item.unit_price !== ''
                    ? Number(item.unit_price)
                    : null,
            quality_grade: item.quality_grade || null,
            storage_location: item.storage_location || null,
            supplier_name: item.supplier_name || null,
            manufacturing_date: item.manufacturing_date
                ? new Date(item.manufacturing_date)
                : null,
            expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
            status: 'P',
            reconciliation_item_id: null,
            createdate: new Date(),
            createdby: userId,
            updatedate: new Date(),
            updatedby: userId,
            log_inst: 1,
        }));
        await prisma_client_1.default.sap_creditmemo_line.createMany({
            data: linesData,
        });
        let approvalRequest = null;
        try {
            const { createRequest } = await Promise.resolve().then(() => __importStar(require('../controllers/requests.controller')));
            const requestPayload = {
                batch_ref: batchRef,
                header_id: header.id,
                salesman_sap_code,
                depot_sap_code: depot_sap_code || null,
                document_date,
                sap_docnum: headerDocNum,
                item_count: creditMemoItems.length,
                depot_id: depotId || spUser.depot_id || null,
            };
            approvalRequest = await createRequest({
                requester_id: userId || spUser.id,
                request_type: 'SAP_CREDITMEMO_APPROVAL',
                reference_id: header.id,
                request_data: JSON.stringify(requestPayload),
                createdby: userId || spUser.id,
                log_inst: 1,
            });
        }
        catch (err) {
            console.error('[SAP Credit Memo] Failed to create approval request in sfa_d_requests:', err);
        }
        return {
            staged: true,
            batch_ref: batchRef,
            header_id: header.id,
            request_id: approvalRequest?.id || null,
            status: approvalRequest?.status === 'A' ? 'APPROVED' : 'PENDING',
            message: 'Credit memo received and pending approval',
            items_count: creditMemoItems.length,
        };
    },
    async commitCreditMemoToReconciliation(headerId, approvedBy) {
        const header = await prisma_client_1.default.sap_creditmemo_header.findUnique({
            where: { id: headerId },
            include: {
                sap_creditmemo_header: true,
            },
        });
        if (!header) {
            throw new Error(`SAP credit memo header ID ${headerId} not found`);
        }
        const lines = header.sap_creditmemo_header || [];
        if (lines.length === 0) {
            console.warn(`[SAP Credit Memo] Header #${headerId} has no lines to commit.`);
            return { success: true, message: 'No lines to commit', updated_items: 0 };
        }
        const reconstructedItems = lines.map((line) => ({
            product_sap_code: line.product_sap_code,
            sap_lineid: line.sap_lineid,
            source_system: line.source_system || 'sap_ar_creditmemo',
            sap_docnum: line.sap_docnum,
            sap_docentry: line.sap_docentry,
            batch_number: line.batch_number,
            quantity: line.quantity ? Number(line.quantity) : undefined,
            base_quantity: line.base_quantity !== null && line.base_quantity !== undefined
                ? Number(line.base_quantity)
                : undefined,
            purchase_price: line.purchase_price !== null && line.purchase_price !== undefined
                ? Number(line.purchase_price)
                : undefined,
            quality_grade: line.quality_grade,
            storage_location: line.storage_location,
            supplier_name: line.supplier_name,
            manufacturing_date: line.manufacturing_date,
            expiry_date: line.expiry_date,
        }));
        const dateStr = header.document_date instanceof Date
            ? header.document_date.toISOString().split('T')[0]
            : String(header.document_date).split('T')[0];
        const commitPayload = {
            salesman_sap_code: header.salesman_sap_code,
            depot_sap_code: header.depot_sap_code,
            document_date: dateStr,
            reconciliation_items: reconstructedItems,
        };
        const result = await this.createOrUpdateReconciliationSAP(commitPayload, approvedBy, { isApprovedCommit: true, headerId: header.id });
        await prisma_client_1.default.sap_creditmemo_header.update({
            where: { id: header.id },
            data: {
                status: 'A',
                reconciliation_id: result.reconciliation_id,
                updatedate: new Date(),
                updatedby: approvedBy,
            },
        });
        if (result.items && Array.isArray(result.items)) {
            for (const line of lines) {
                const matchedItem = result.items.find((saved) => saved.sap_lineid === line.sap_lineid &&
                    (line.sap_docentry
                        ? String(saved.sap_docentry) === String(line.sap_docentry)
                        : true) &&
                    (!line.batch_number || saved.batch_number === line.batch_number)) ||
                    result.items.find((saved) => saved.sap_lineid === line.sap_lineid &&
                        (!line.batch_number || saved.batch_number === line.batch_number)) ||
                    result.items.find((saved) => saved.sap_lineid === line.sap_lineid);
                if (matchedItem) {
                    await prisma_client_1.default.sap_creditmemo_line.update({
                        where: { id: line.id },
                        data: {
                            status: 'A',
                            reconciliation_item_id: matchedItem.id,
                            updatedate: new Date(),
                            updatedby: approvedBy,
                        },
                    });
                }
            }
        }
        return result;
    },
};
//# sourceMappingURL=sap.service.js.map