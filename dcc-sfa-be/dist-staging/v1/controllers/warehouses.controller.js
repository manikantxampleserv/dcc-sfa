"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehousesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeWarehouse = (warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    type: warehouse.type,
    location: warehouse.location,
    is_active: warehouse.is_active,
    created_by: warehouse.createdby,
    createdate: warehouse.createdate,
    updatedate: warehouse.updatedate,
    updatedby: warehouse.updatedby,
});
exports.warehousesController = {
    async createWarehouse(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Warehouse name is required' });
            }
            const warehouse = await prisma_client_1.default.warehouses.create({
                data: {
                    ...data,
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Warehouse created successfully',
                data: serializeWarehouse(warehouse),
            });
        }
        catch (error) {
            console.error('Create Warehouse Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getWarehouses(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, type, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: isActive,
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { type: { contains: searchLower } },
                        { location: { contains: searchLower } },
                    ],
                }),
                ...(type && { type: type }),
            };
            const totalWarehouses = await prisma_client_1.default.warehouses.count();
            const activeWarehouses = await prisma_client_1.default.warehouses.count({
                where: { is_active: 'Y' },
            });
            const inactiveWarehouses = await prisma_client_1.default.warehouses.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newWarehousesThisMonth = await prisma_client_1.default.warehouses.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_warehouses: totalWarehouses,
                active_warehouses: activeWarehouses,
                inactive_warehouses: inactiveWarehouses,
                new_warehouses: newWarehousesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.warehouses,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Warehouses retrieved successfully',
                data: data.map((d) => serializeWarehouse(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Warehouses Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getWarehouseById(req, res) {
        try {
            const { id } = req.params;
            const warehouse = await prisma_client_1.default.warehouses.findUnique({
                where: { id: Number(id) },
            });
            if (!warehouse) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            res.json({
                message: 'Warehouse fetched successfully',
                data: serializeWarehouse(warehouse),
            });
        }
        catch (error) {
            console.error('Get Warehouse Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateWarehouse(req, res) {
        try {
            const { id } = req.params;
            const existingWarehouse = await prisma_client_1.default.warehouses.findUnique({
                where: { id: Number(id) },
            });
            if (!existingWarehouse) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const warehouse = await prisma_client_1.default.warehouses.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Warehouse updated successfully',
                data: serializeWarehouse(warehouse),
            });
        }
        catch (error) {
            console.error('Update Warehouse Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteWarehouse(req, res) {
        try {
            const { id } = req.params;
            const existingWarehouse = await prisma_client_1.default.warehouses.findUnique({
                where: { id: Number(id) },
            });
            if (!existingWarehouse) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            await prisma_client_1.default.warehouses.delete({ where: { id: Number(id) } });
            res.json({ message: 'Warehouse deleted successfully' });
        }
        catch (error) {
            console.error('Delete Warehouse Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=warehouses.controller.js.map