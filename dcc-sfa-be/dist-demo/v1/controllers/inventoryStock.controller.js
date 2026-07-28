"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryStockController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeInventoryStock = (stock) => ({
    id: stock.id,
    product_id: stock.product_id,
    location_id: stock.location_id,
    location_type: stock.location_type,
    current_stock: stock.current_stock,
    reserved_stock: stock.reserved_stock,
    available_stock: stock.available_stock,
    minimum_stock: stock.minimum_stock,
    maximum_stock: stock.maximum_stock,
    reorder_level: stock.reorder_level,
    reorder_quantity: stock.reorder_quantity,
    average_daily_sales: stock.average_daily_sales,
    lead_time: stock.lead_time,
    safety_stock: stock.safety_stock,
    stock_value: stock.stock_value,
    last_stock_update: stock.last_stock_update,
    stock_status: stock.stock_status,
    turnover_rate: stock.turnover_rate,
    days_of_stock: stock.days_of_stock,
    last_count_date: stock.last_count_date,
    next_count_due: stock.next_count_due,
    variance: stock.variance,
    variance_percentage: stock.variance_percentage,
    cost_price: stock.cost_price,
    selling_price: stock.selling_price,
    margin: stock.margin,
    is_active: stock.is_active,
    createdate: stock.createdate,
    createdby: stock.createdby,
    updatedate: stock.updatedate,
    updatedby: stock.updatedby,
    log_inst: stock.log_inst,
    product: stock.inventory_stock_products
        ? {
            id: stock.inventory_stock_products.id,
            name: stock.inventory_stock_products.name,
        }
        : null,
    location: stock.inventory_stock_depots
        ? {
            id: stock.inventory_stock_depots.id,
            name: stock.inventory_stock_depots.name,
        }
        : null,
});
exports.inventoryStockController = {
    async createInventoryStock(req, res) {
        try {
            const data = req.body;
            const stock = await prisma_client_1.default.inventory_stock.create({
                data: {
                    ...data,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    inventory_stock_products: true,
                    inventory_stock_depots: true,
                },
            });
            res.status(201).json({
                message: 'Inventory stock created successfully',
                data: serializeInventoryStock(stock),
            });
        }
        catch (error) {
            console.error('Create Inventory Stock Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllInventoryStock(req, res) {
        try {
            const { page, limit, search } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { location_type: { contains: searchLower } },
                        { stock_status: { contains: searchLower } },
                    ],
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.inventory_stock,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    inventory_stock_products: true,
                    inventory_stock_depots: true,
                },
            });
            res.success('Inventory stocks retrieved successfully', data.map((stock) => serializeInventoryStock(stock)), 200, pagination);
        }
        catch (error) {
            console.error('Get Inventory Stock Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getInventoryStockById(req, res) {
        try {
            const { id } = req.params;
            const stock = await prisma_client_1.default.inventory_stock.findUnique({
                where: { id: Number(id) },
                include: {
                    inventory_stock_products: true,
                    inventory_stock_depots: true,
                },
            });
            if (!stock)
                return res.status(404).json({ message: 'Inventory stock not found' });
            res.json({
                message: 'Inventory stock fetched successfully',
                data: serializeInventoryStock(stock),
            });
        }
        catch (error) {
            console.error('Get Inventory Stock Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateInventoryStock(req, res) {
        try {
            const { id } = req.params;
            const existingStock = await prisma_client_1.default.inventory_stock.findUnique({
                where: { id: Number(id) },
            });
            if (!existingStock)
                return res.status(404).json({ message: 'Inventory stock not found' });
            const data = {
                ...req.body,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const stock = await prisma_client_1.default.inventory_stock.update({
                where: { id: Number(id) },
                data,
                include: {
                    inventory_stock_products: true,
                    inventory_stock_depots: true,
                },
            });
            res.json({
                message: 'Inventory stock updated successfully',
                data: serializeInventoryStock(stock),
            });
        }
        catch (error) {
            console.error('Update Inventory Stock Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteInventoryStock(req, res) {
        try {
            const { id } = req.params;
            const existingStock = await prisma_client_1.default.inventory_stock.findUnique({
                where: { id: Number(id) },
            });
            if (!existingStock)
                return res.status(404).json({ message: 'Inventory stock not found' });
            await prisma_client_1.default.inventory_stock.delete({ where: { id: Number(id) } });
            res.json({ message: 'Inventory stock deleted successfully' });
        }
        catch (error) {
            console.error('Delete Inventory Stock Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=inventoryStock.controller.js.map