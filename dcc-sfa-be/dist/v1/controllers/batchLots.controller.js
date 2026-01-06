"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchLotsController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const batchLotInclude = {
    batch_lot_product_batches: {
        include: {
            product_product_batches: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    base_price: true,
                    volume_id: true,
                    brand_id: true,
                    category_id: true,
                    sub_category_id: true,
                    product_volumes_products: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    product_brands: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    product_categories_products: {
                        select: {
                            id: true,
                            category_name: true,
                        },
                    },
                    product_sub_categories_products: {
                        select: {
                            id: true,
                            sub_category_name: true,
                        },
                    },
                },
            },
        },
    },
    serial_numbers: {
        select: {
            id: true,
            serial_number: true,
            status: true,
            customer_id: true,
            sold_date: true,
        },
    },
    stock_movements: {
        select: {
            id: true,
            movement_type: true,
            quantity: true,
            movement_date: true,
        },
        orderBy: {
            movement_date: 'desc',
        },
        take: 10,
    },
};
const serializeBatchLot = (batch) => ({
    id: batch.id,
    batch_number: batch.batch_number,
    lot_number: batch.lot_number,
    manufacturing_date: batch.manufacturing_date,
    expiry_date: batch.expiry_date,
    quantity: batch.quantity,
    remaining_quantity: batch.remaining_quantity,
    supplier_name: batch.supplier_name,
    purchase_price: batch.purchase_price ? Number(batch.purchase_price) : null,
    quality_grade: batch.quality_grade,
    storage_location: batch.storage_location,
    is_active: batch.is_active,
    createdate: batch.createdate,
    createdby: batch.createdby,
    updatedate: batch.updatedate,
    updatedby: batch.updatedby,
    log_inst: batch.log_inst,
    products: batch.batch_lot_product_batches
        ? batch.batch_lot_product_batches.map((pb) => ({
            id: pb.product_product_batches?.id,
            name: pb.product_product_batches?.name,
            code: pb.product_product_batches?.code,
            base_price: pb.product_product_batches?.base_price
                ? Number(pb.product_product_batches.base_price)
                : null,
            quantity: pb.quantity,
            volume: pb.product_product_batches?.product_volumes_products
                ? {
                    id: pb.product_product_batches.product_volumes_products.id,
                    name: pb.product_product_batches.product_volumes_products.name,
                    code: pb.product_product_batches.product_volumes_products.code,
                }
                : null,
            brand: pb.product_product_batches?.product_brands
                ? {
                    id: pb.product_product_batches.product_brands.id,
                    name: pb.product_product_batches.product_brands.name,
                }
                : null,
            category: pb.product_product_batches?.product_categories_products
                ? {
                    id: pb.product_product_batches.product_categories_products.id,
                    name: pb.product_product_batches.product_categories_products
                        .category_name,
                }
                : null,
            sub_category: pb.product_product_batches
                ?.product_sub_categories_products
                ? {
                    id: pb.product_product_batches.product_sub_categories_products.id,
                    name: pb.product_product_batches.product_sub_categories_products
                        .sub_category_name,
                }
                : null,
        }))
        : [],
    serial_numbers: batch.serial_numbers
        ? batch.serial_numbers.map((serial) => ({
            id: serial.id,
            serial_number: serial.serial_number,
            status: serial.status,
            customer_id: serial.customer_id,
            sold_date: serial.sold_date,
        }))
        : [],
    stock_movements: batch.stock_movements
        ? batch.stock_movements.map((movement) => ({
            id: movement.id,
            movement_type: movement.movement_type,
            quantity: movement.quantity,
            movement_date: movement.movement_date,
        }))
        : [],
});
exports.batchLotsController = {
    async createMultipleBatchLotsForProduct(req, res) {
        try {
            const { product_id, batch_lots } = req.body;
            const userId = req.user?.id || 1;
            if (!product_id) {
                return res.status(400).json({
                    message: 'product_id is required',
                });
            }
            if (!batch_lots ||
                !Array.isArray(batch_lots) ||
                batch_lots.length === 0) {
                return res.status(400).json({
                    message: 'batch_lots array is required and must not be empty',
                });
            }
            const product = await prisma_client_1.default.products.findUnique({
                where: { id: product_id },
                select: { id: true, name: true, code: true },
            });
            if (!product) {
                return res.status(404).json({
                    message: `Product with ID ${product_id} not found`,
                });
            }
            const batchNumbers = batch_lots.map((b) => b.batch_number);
            const uniqueBatchNumbers = new Set(batchNumbers);
            if (uniqueBatchNumbers.size !== batchNumbers.length) {
                return res.status(400).json({
                    message: 'Duplicate batch numbers found in the request',
                });
            }
            const existingBatches = await prisma_client_1.default.batch_lots.findMany({
                where: {
                    batch_number: { in: batchNumbers },
                },
                select: { batch_number: true },
            });
            if (existingBatches.length > 0) {
                return res.status(400).json({
                    message: `Batch numbers already exist: ${existingBatches.map(b => b.batch_number).join(', ')}`,
                });
            }
            const createdBatchLotIds = [];
            const batchLotDataMap = new Map();
            for (const batchData of batch_lots) {
                const newBatchLot = await prisma_client_1.default.batch_lots.create({
                    data: {
                        batch_number: batchData.batch_number,
                        lot_number: batchData.lot_number || null,
                        manufacturing_date: new Date(batchData.manufacturing_date),
                        expiry_date: new Date(batchData.expiry_date),
                        quantity: batchData.quantity,
                        remaining_quantity: batchData.remaining_quantity || batchData.quantity,
                        supplier_name: batchData.supplier_name || null,
                        purchase_price: batchData.purchase_price || null,
                        quality_grade: batchData.quality_grade || 'A',
                        storage_location: batchData.storage_location || null,
                        is_active: batchData.is_active || 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                    },
                });
                createdBatchLotIds.push(newBatchLot.id);
                batchLotDataMap.set(batchData.batch_number, {
                    batchLotId: newBatchLot.id,
                    quantity: batchData.quantity,
                });
            }
            const productBatchesData = createdBatchLotIds.map((batchLotId, index) => ({
                product_id: product_id,
                batch_lot_id: batchLotId,
                quantity: batch_lots[index].quantity,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
            }));
            await prisma_client_1.default.product_batches.createMany({
                data: productBatchesData,
            });
            const createdBatchLots = await prisma_client_1.default.batch_lots.findMany({
                where: {
                    id: { in: createdBatchLotIds },
                },
                include: {
                    batch_lot_product_batches: {
                        include: {
                            product_product_batches: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    base_price: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    id: 'asc',
                },
            });
            return res.status(201).json({
                message: `${createdBatchLots.length} batch lot(s) created successfully for product "${product.name}"`,
                product: {
                    id: product.id,
                    name: product.name,
                    code: product.code,
                },
                data: createdBatchLots.map(serializeBatchLot),
            });
        }
        catch (error) {
            console.error('Create Multiple Batch Lots For Product Error:', error);
            return res.status(500).json({
                message: error.message || 'Failed to create batch lots',
            });
        }
    },
    async createBatchLot(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.id || 1;
            const products = data.products || [];
            const existingBatch = await prisma_client_1.default.batch_lots.findFirst({
                where: { batch_number: data.batch_number },
            });
            if (existingBatch) {
                return res.status(400).json({
                    message: 'Batch number already exists',
                });
            }
            if (products.length > 0) {
                const productIds = products.map(p => p.product_id);
                const uniqueProductIds = new Set(productIds);
                if (uniqueProductIds.size !== productIds.length) {
                    return res.status(400).json({
                        message: 'Duplicate product_id found in the request',
                    });
                }
                const existingProducts = await prisma_client_1.default.products.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true },
                });
                const existingProductIds = existingProducts.map(p => p.id);
                const missingProducts = productIds.filter(id => !existingProductIds.includes(id));
                if (missingProducts.length > 0) {
                    return res.status(400).json({
                        message: `Products with IDs ${missingProducts.join(', ')} not found`,
                    });
                }
            }
            const newBatchLot = await prisma_client_1.default.batch_lots.create({
                data: {
                    batch_number: data.batch_number,
                    lot_number: data.lot_number || null,
                    manufacturing_date: new Date(data.manufacturing_date),
                    expiry_date: new Date(data.expiry_date),
                    quantity: data.quantity,
                    remaining_quantity: data.remaining_quantity || data.quantity,
                    supplier_name: data.supplier_name || null,
                    purchase_price: data.purchase_price || null,
                    quality_grade: data.quality_grade || 'A',
                    storage_location: data.storage_location || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: userId,
                    log_inst: 1,
                },
            });
            if (products.length > 0) {
                for (const product of products) {
                    await prisma_client_1.default.product_batches.create({
                        data: {
                            product_id: product.product_id,
                            batch_lot_id: newBatchLot.id,
                            quantity: product.quantity,
                            is_active: 'Y',
                            createdate: new Date(),
                            createdby: userId,
                            log_inst: 1,
                        },
                    });
                }
            }
            const completeBatchLot = await prisma_client_1.default.batch_lots.findUnique({
                where: { id: newBatchLot.id },
                include: batchLotInclude,
            });
            return res.status(201).json({
                message: 'Batch lot created successfully',
                data: serializeBatchLot(completeBatchLot),
            });
        }
        catch (error) {
            console.error('Create Batch Lot Error:', error);
            return res.status(500).json({
                message: error.message || 'Failed to create batch lot',
            });
        }
    },
    async getAllBatchLots(req, res) {
        try {
            const { search, status, expiring_soon, expired, quality_grade } = req.query;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const where = {};
            if (search) {
                where.OR = [
                    { batch_number: { contains: String(search) } },
                    { lot_number: { contains: String(search) } },
                    { supplier_name: { contains: String(search) } },
                ];
            }
            if (status === 'active') {
                where.is_active = 'Y';
            }
            else if (status === 'inactive') {
                where.is_active = 'N';
            }
            if (quality_grade) {
                where.quality_grade = String(quality_grade);
            }
            if (expiring_soon === 'true') {
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                where.expiry_date = {
                    gte: new Date(),
                    lte: thirtyDaysFromNow,
                };
            }
            if (expired === 'true') {
                where.expiry_date = {
                    lt: new Date(),
                };
            }
            const skip = (page - 1) * limit;
            const [batchLots, totalCount] = await Promise.all([
                prisma_client_1.default.batch_lots.findMany({
                    where,
                    include: batchLotInclude,
                    orderBy: { createdate: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma_client_1.default.batch_lots.count({ where }),
            ]);
            const [totalBatchLots, activeBatchLots] = await Promise.all([
                prisma_client_1.default.batch_lots.count(),
                prisma_client_1.default.batch_lots.count({ where: { is_active: 'Y' } }),
            ]);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            const [expiringBatchLots, expiredBatchLots] = await Promise.all([
                prisma_client_1.default.batch_lots.count({
                    where: {
                        expiry_date: { gte: new Date(), lte: thirtyDaysFromNow },
                        is_active: 'Y',
                    },
                }),
                prisma_client_1.default.batch_lots.count({
                    where: { expiry_date: { lt: new Date() } },
                }),
            ]);
            return res.status(200).json({
                message: 'Batch lots retrieved successfully',
                data: batchLots.map(serializeBatchLot),
                meta: {
                    current_page: page,
                    per_page: limit,
                    total_count: totalCount,
                    total_pages: Math.ceil(totalCount / limit),
                },
                stats: {
                    total_batch_lots: totalBatchLots,
                    active_batch_lots: activeBatchLots,
                    expiring_batch_lots: expiringBatchLots,
                    expired_batch_lots: expiredBatchLots,
                },
            });
        }
        catch (error) {
            console.error('Get All Batch Lots Error:', error);
            return res.status(500).json({
                message: error.message || 'Failed to retrieve batch lots',
            });
        }
    },
    async getBatchLotById(req, res) {
        try {
            const { id } = req.params;
            const batchLot = await prisma_client_1.default.batch_lots.findUnique({
                where: { id: Number(id) },
                include: batchLotInclude,
            });
            if (!batchLot) {
                return res.status(404).json({ message: 'Batch lot not found' });
            }
            return res.status(200).json({
                message: 'Batch lot retrieved successfully',
                data: serializeBatchLot(batchLot),
            });
        }
        catch (error) {
            console.error('Get Batch Lot By ID Error:', error);
            return res.status(500).json({
                message: error.message || 'Failed to retrieve batch lot',
            });
        }
    },
    async updateBatchLot(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user?.id || 1;
            const products = data.products;
            const existingBatch = await prisma_client_1.default.batch_lots.findUnique({
                where: { id: Number(id) },
            });
            if (!existingBatch) {
                return res.status(404).json({ message: 'Batch lot not found' });
            }
            if (data.batch_number &&
                data.batch_number !== existingBatch.batch_number) {
                const duplicateBatch = await prisma_client_1.default.batch_lots.findFirst({
                    where: {
                        batch_number: data.batch_number,
                        id: { not: Number(id) },
                    },
                });
                if (duplicateBatch) {
                    return res.status(400).json({
                        message: 'Batch number already exists',
                    });
                }
            }
            if (products !== undefined && products.length > 0) {
                const productIds = products.map(p => p.product_id);
                const uniqueProductIds = new Set(productIds);
                if (uniqueProductIds.size !== productIds.length) {
                    return res.status(400).json({
                        message: 'Duplicate product_id found in the request',
                    });
                }
                const existingProducts = await prisma_client_1.default.products.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true },
                });
                const existingProductIds = existingProducts.map(p => p.id);
                const missingProducts = productIds.filter(pid => !existingProductIds.includes(pid));
                if (missingProducts.length > 0) {
                    return res.status(400).json({
                        message: `Products with IDs ${missingProducts.join(', ')} not found`,
                    });
                }
            }
            const updateData = {
                updatedate: new Date(),
                updatedby: userId,
            };
            if (data.batch_number !== undefined)
                updateData.batch_number = data.batch_number;
            if (data.lot_number !== undefined)
                updateData.lot_number = data.lot_number;
            if (data.manufacturing_date !== undefined)
                updateData.manufacturing_date = new Date(data.manufacturing_date);
            if (data.expiry_date !== undefined)
                updateData.expiry_date = new Date(data.expiry_date);
            if (data.quantity !== undefined)
                updateData.quantity = data.quantity;
            if (data.remaining_quantity !== undefined)
                updateData.remaining_quantity = data.remaining_quantity;
            if (data.supplier_name !== undefined)
                updateData.supplier_name = data.supplier_name;
            if (data.purchase_price !== undefined)
                updateData.purchase_price = data.purchase_price;
            if (data.quality_grade !== undefined)
                updateData.quality_grade = data.quality_grade;
            if (data.storage_location !== undefined)
                updateData.storage_location = data.storage_location;
            if (data.is_active !== undefined)
                updateData.is_active = data.is_active;
            await prisma_client_1.default.batch_lots.update({
                where: { id: Number(id) },
                data: updateData,
            });
            if (products !== undefined) {
                await prisma_client_1.default.product_batches.deleteMany({
                    where: { batch_lot_id: Number(id) },
                });
                if (products.length > 0) {
                    for (const product of products) {
                        await prisma_client_1.default.product_batches.create({
                            data: {
                                product_id: product.product_id,
                                batch_lot_id: Number(id),
                                quantity: product.quantity,
                                is_active: 'Y',
                                createdate: new Date(),
                                createdby: userId,
                                log_inst: 1,
                            },
                        });
                    }
                }
            }
            const updatedBatchLot = await prisma_client_1.default.batch_lots.findUnique({
                where: { id: Number(id) },
                include: {
                    batch_lot_product_batches: {
                        include: {
                            product_product_batches: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    base_price: true,
                                },
                            },
                        },
                    },
                    serial_numbers: {
                        select: {
                            id: true,
                            serial_number: true,
                            status: true,
                            customer_id: true,
                            sold_date: true,
                        },
                    },
                    stock_movements: {
                        select: {
                            id: true,
                            movement_type: true,
                            quantity: true,
                            movement_date: true,
                        },
                        orderBy: {
                            movement_date: 'desc',
                        },
                        take: 10,
                    },
                },
            });
            return res.status(200).json({
                message: 'Batch lot updated successfully',
                data: serializeBatchLot(updatedBatchLot),
            });
        }
        catch (error) {
            console.error('Update Batch Lot Error:', error);
            return res.status(500).json({
                message: error.message || 'Failed to update batch lot',
            });
        }
    },
    async deleteBatchLot(req, res) {
        try {
            const { id } = req.params;
            const existingBatch = await prisma_client_1.default.batch_lots.findUnique({
                where: { id: Number(id) },
                include: {
                    batch_lot_product_batches: true,
                    serial_numbers: true,
                    stock_movements: true,
                },
            });
            if (!existingBatch) {
                return res.status(404).json({ message: 'Batch lot not found' });
            }
            if (existingBatch.batch_lot_product_batches.length > 0) {
                return res.status(400).json({
                    message: `Cannot delete batch lot. ${existingBatch.batch_lot_product_batches.length} product(s) are associated with this batch.`,
                });
            }
            if (existingBatch.serial_numbers.length > 0) {
                return res.status(400).json({
                    message: `Cannot delete batch lot. ${existingBatch.serial_numbers.length} serial number(s) are associated with this batch.`,
                });
            }
            if (existingBatch.stock_movements.length > 0) {
                return res.status(400).json({
                    message: `Cannot delete batch lot. ${existingBatch.stock_movements.length} stock movement(s) are associated with this batch.`,
                });
            }
            await prisma_client_1.default.batch_lots.delete({
                where: { id: Number(id) },
            });
            return res.status(200).json({
                message: 'Batch lot deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete Batch Lot Error:', error);
            return res.status(500).json({
                message: error.message || 'Failed to delete batch lot',
            });
        }
    },
    async getBatchLotsDropdown(req, res) {
        try {
            const { search = '', batch_lot_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const batchLotId = batch_lot_id ? Number(batch_lot_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (batchLotId) {
                where.id = batchLotId;
            }
            else if (searchLower) {
                where.OR = [
                    {
                        batch_number: {
                            contains: searchLower,
                        },
                    },
                    {
                        lot_number: {
                            contains: searchLower,
                        },
                    },
                    {
                        supplier_name: {
                            contains: searchLower,
                        },
                    },
                ];
            }
            const batchLots = await prisma_client_1.default.batch_lots.findMany({
                where,
                select: {
                    id: true,
                    batch_number: true,
                    lot_number: true,
                    remaining_quantity: true,
                    expiry_date: true,
                },
                orderBy: {
                    batch_number: 'asc',
                },
                take: 50,
            });
            res.success('Batch lots dropdown fetched successfully', batchLots, 200);
        }
        catch (error) {
            console.error('Error fetching batch lots dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=batchLots.controller.js.map