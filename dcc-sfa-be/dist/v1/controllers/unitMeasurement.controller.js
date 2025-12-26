"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitMeasurementController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeUnit = (unit) => ({
    id: unit.id,
    name: unit.name,
    description: unit.description,
    category: unit.category,
    symbol: unit.symbol,
    is_active: unit.is_active,
    createdate: unit.createdate,
    createdby: unit.createdby,
    updatedate: unit.updatedate,
    updatedby: unit.updatedby,
    log_inst: unit.log_inst,
    product_unit_of_measurement: unit.product_unit_of_measurement?.map((p) => ({
        id: p.id,
        name: p.name,
    })) || [],
});
exports.unitMeasurementController = {
    async createUnitMeasurement(req, res) {
        try {
            const data = req.body;
            const unit = await prisma_client_1.default.unit_of_measurement.create({
                data: {
                    name: data.name,
                    description: data.description || null,
                    category: data.category || null,
                    symbol: data.symbol || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || data.createdby || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    product_unit_of_measurement: true,
                },
            });
            res.status(201).json({
                message: 'Unit of measurement created successfully',
                data: serializeUnit(unit),
            });
        }
        catch (error) {
            console.error('Create Unit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllUnitMeasurement(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { description: { contains: searchLower } },
                        { category: { contains: searchLower } },
                        { symbol: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.unit_of_measurement,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    product_unit_of_measurement: true,
                },
            });
            const totalUnits = await prisma_client_1.default.unit_of_measurement.count();
            const activeUnits = await prisma_client_1.default.unit_of_measurement.count({
                where: { is_active: 'Y' },
            });
            const inactiveUnits = await prisma_client_1.default.unit_of_measurement.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const newUnitsThisMonth = await prisma_client_1.default.unit_of_measurement.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Units retrieved successfully', data.map((u) => serializeUnit(u)), 200, pagination, {
                total_units: totalUnits,
                active_units: activeUnits,
                inactive_units: inactiveUnits,
                new_units_this_month: newUnitsThisMonth,
            });
        }
        catch (error) {
            console.error('Get Units Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getUnitMeasurementById(req, res) {
        try {
            const { id } = req.params;
            const unit = await prisma_client_1.default.unit_of_measurement.findUnique({
                where: { id: Number(id) },
                include: { product_unit_of_measurement: true },
            });
            if (!unit)
                return res.status(404).json({ message: 'Unit not found' });
            res.json({
                message: 'Unit fetched successfully',
                data: serializeUnit(unit),
            });
        }
        catch (error) {
            console.error('Get Unit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateUnitMeasurement(req, res) {
        try {
            const { id } = req.params;
            const existingUnit = await prisma_client_1.default.unit_of_measurement.findUnique({
                where: { id: Number(id) },
            });
            if (!existingUnit)
                return res.status(404).json({ message: 'Unit not found' });
            const data = {
                ...req.body,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const unit = await prisma_client_1.default.unit_of_measurement.update({
                where: { id: Number(id) },
                data,
                include: { product_unit_of_measurement: true },
            });
            res.json({
                message: 'Unit updated successfully',
                data: serializeUnit(unit),
            });
        }
        catch (error) {
            console.error('Update Unit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteUnitMeasurement(req, res) {
        try {
            const { id } = req.params;
            const existingUnit = await prisma_client_1.default.unit_of_measurement.findUnique({
                where: { id: Number(id) },
            });
            if (!existingUnit)
                return res.status(404).json({ message: 'Unit not found' });
            await prisma_client_1.default.unit_of_measurement.delete({ where: { id: Number(id) } });
            res.json({ message: 'Unit deleted successfully' });
        }
        catch (error) {
            console.error('Delete Unit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=unitMeasurement.controller.js.map