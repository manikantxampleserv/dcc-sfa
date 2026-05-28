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
    sub_unit: unit.sub_unit,
    conversion_rate: unit.conversion_rate,
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
    subunit: unit.subunit
        ? {
            id: unit.subunit.id,
            name: unit.subunit.name,
            code: unit.subunit.code,
            description: unit.subunit.description,
            subunits_products: unit.subunit.subunits_products
                ? {
                    id: unit.subunit.subunits_products.id,
                    name: unit.subunit.subunits_products.name,
                    code: unit.subunit.subunits_products.code,
                }
                : null,
        }
        : null,
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
                    sub_unit: data.sub_unit || null,
                    conversion_rate: data.conversion_rate || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || data.createdby || 1,
                    log_inst: data.log_inst || 1,
                    subunit: {
                        create: {
                            name: data.name,
                            code: data.code || data.name.toUpperCase().replace(/\s/g, '_'),
                            description: data.description || null,
                            is_active: data.is_active || 'Y',
                            createdate: new Date(),
                            createdby: req.user?.id || data.createdby || 1,
                            log_inst: data.log_inst || 1,
                        },
                    },
                },
                include: {
                    product_unit_of_measurement: true,
                    subunit: true,
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
                    subunit: {
                        include: {
                            subunits_products: true,
                        },
                    },
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
                include: {
                    product_unit_of_measurement: true,
                    subunit: {
                        include: {
                            subunits_products: true,
                        },
                    },
                },
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
                include: {
                    subunit: true,
                },
            });
            if (!existingUnit)
                return res.status(404).json({ message: 'Unit not found' });
            const data = {
                name: req.body.name,
                description: req.body.description || '',
                category: req.body.category || '',
                symbol: req.body.symbol || '',
                sub_unit: req.body.sub_unit || '',
                conversion_rate: req.body.conversion_rate || null,
                is_active: req.body.is_active || 'Y',
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const unit = await prisma_client_1.default.unit_of_measurement.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    subunit: existingUnit.subunit
                        ? {
                            update: {
                                name: req.body.name,
                                code: req.body.code ||
                                    req.body.name.toUpperCase().replace(/\s/g, '_'),
                                description: req.body.description || null,
                                is_active: req.body.is_active || 'Y',
                                updatedate: new Date(),
                                updatedby: req.user?.id,
                            },
                        }
                        : {
                            create: {
                                name: req.body.name,
                                code: req.body.code ||
                                    req.body.name.toUpperCase().replace(/\s/g, '_'),
                                description: req.body.description || null,
                                is_active: req.body.is_active || 'Y',
                                createdate: new Date(),
                                createdby: req.user?.id || 1,
                                log_inst: 1,
                            },
                        },
                },
                include: {
                    product_unit_of_measurement: true,
                    subunit: true,
                },
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
    async getSubunitsByUnitMeasurement(req, res) {
        try {
            const { id } = req.params;
            const unit = await prisma_client_1.default.unit_of_measurement.findUnique({
                where: { id: Number(id) },
                include: {
                    subunit: {
                        include: {
                            subunits_products: true,
                        },
                    },
                },
            });
            if (!unit) {
                return res
                    .status(404)
                    .json({ message: 'Unit of measurement not found' });
            }
            if (!unit.subunit) {
                return res.json({
                    message: 'No subunit found for this unit',
                    data: null,
                });
            }
            res.json({
                message: 'Subunit retrieved successfully',
                data: {
                    id: unit.subunit.id,
                    name: unit.subunit.name,
                    code: unit.subunit.code,
                    description: unit.subunit.description,
                    unit_of_measurement_id: unit.subunit.unit_of_measurement_id,
                    is_active: unit.subunit.is_active,
                    createdate: unit.subunit.createdate,
                    createdby: unit.subunit.createdby,
                    updatedate: unit.subunit.updatedate,
                    updatedby: unit.subunit.updatedby,
                    log_inst: unit.subunit.log_inst,
                    subunits_products: unit.subunit.subunits_products,
                    unit_of_measurement: {
                        id: unit.id,
                        name: unit.name,
                        symbol: unit.symbol,
                    },
                },
            });
        }
        catch (error) {
            console.error('Get Subunit by Unit Measurement Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteUnitMeasurement(req, res) {
        try {
            const { id } = req.params;
            const existingUnit = await prisma_client_1.default.unit_of_measurement.findUnique({
                where: { id: Number(id) },
                include: {
                    subunit: true,
                },
            });
            if (!existingUnit)
                return res.status(404).json({ message: 'Unit not found' });
            if (existingUnit.subunit) {
                await prisma_client_1.default.subunits.delete({
                    where: { id: existingUnit.subunit.id },
                });
            }
            await prisma_client_1.default.unit_of_measurement.delete({
                where: { id: Number(id) },
            });
            res.json({
                message: 'Unit deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete Unit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=unitMeasurement.controller.js.map