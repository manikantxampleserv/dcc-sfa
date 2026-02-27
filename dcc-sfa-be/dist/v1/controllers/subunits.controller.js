"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subunitsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateSubunitCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastSubunit = await prisma_client_1.default.subunits.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastSubunit && lastSubunit.code) {
        const match = lastSubunit.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeSubunit = (subunit) => ({
    id: subunit.id,
    name: subunit.name,
    code: subunit.code,
    description: subunit.description,
    unit_of_measurement_id: subunit.unit_of_measurement_id,
    is_active: subunit.is_active,
    createdby: subunit.createdby,
    createdate: subunit.createdate,
    updatedate: subunit.updatedate,
    updatedby: subunit.updatedby,
    log_inst: subunit.log_inst,
    subunits_unit_of_measurement: subunit.subunits_unit_of_measurement,
});
exports.subunitsController = {
    async createSubunit(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Subunit name is required' });
            }
            if (!data.unit_of_measurement_id) {
                return res
                    .status(400)
                    .json({ message: 'Unit of measurement is required' });
            }
            const existingSubunit = await prisma_client_1.default.subunits.findFirst({
                where: {
                    name: {
                        equals: data.name.trim(),
                    },
                },
            });
            if (existingSubunit) {
                return res
                    .status(400)
                    .json({ message: 'Subunit with this name already exists' });
            }
            const existingCode = await prisma_client_1.default.subunits.findUnique({
                where: { code: data.code },
            });
            if (existingCode) {
                return res
                    .status(400)
                    .json({ message: 'Subunit with this code already exists' });
            }
            const newCode = data.code || (await generateSubunitCode(data.name));
            const subunit = await prisma_client_1.default.subunits.create({
                data: {
                    ...data,
                    code: newCode,
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
                include: {
                    subunits_unit_of_measurement: true,
                },
            });
            res.status(201).json({
                message: 'Subunit created successfully',
                data: serializeSubunit(subunit),
            });
        }
        catch (error) {
            console.error('Create Subunit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getSubunits(req, res) {
        try {
            const { page, limit, search, name, isActive, unitOfMeasurementId } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                        { description: { contains: searchLower } },
                    ],
                }),
                ...(name && {
                    name: { contains: name.toLowerCase() },
                }),
                ...(isActive && { is_active: isActive }),
                ...(unitOfMeasurementId && {
                    unit_of_measurement_id: parseInt(unitOfMeasurementId, 10),
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.subunits,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    subunits_unit_of_measurement: true,
                },
            });
            const meta = {
                total: pagination.total_count,
                page: pagination.current_page,
                totalPages: pagination.total_pages,
                hasNext: pagination.has_next,
                hasPrev: pagination.has_previous,
            };
            const totalSubunits = await prisma_client_1.default.subunits.count();
            const activeSubunits = await prisma_client_1.default.subunits.count({
                where: { is_active: 'Y' },
            });
            const inactiveSubunits = await prisma_client_1.default.subunits.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newSubunitsThisMonth = await prisma_client_1.default.subunits.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.json({
                success: true,
                message: 'Subunits retrieved successfully',
                data: data.map((subunit) => serializeSubunit(subunit)),
                meta,
                stats: {
                    total_sub_units: totalSubunits,
                    active_sub_units: activeSubunits,
                    inactive_sub_units: inactiveSubunits,
                    new_sub_units_this_month: newSubunitsThisMonth,
                },
            });
        }
        catch (error) {
            console.error('Get Subunits Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getSubunitById(req, res) {
        try {
            const { id } = req.params;
            const subunit = await prisma_client_1.default.subunits.findUnique({
                where: { id: Number(id) },
                include: {
                    subunits_unit_of_measurement: true,
                },
            });
            if (!subunit) {
                return res.status(404).json({ message: 'Subunit not found' });
            }
            res.json({
                message: 'Subunit fetched successfully',
                data: serializeSubunit(subunit),
            });
        }
        catch (error) {
            console.error('Get Subunit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateSubunit(req, res) {
        try {
            const { id } = req.params;
            const existingSubunit = await prisma_client_1.default.subunits.findUnique({
                where: { id: Number(id) },
            });
            if (!existingSubunit) {
                return res.status(404).json({ message: 'Subunit not found' });
            }
            const data = {
                ...req.body,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            if (req.body.code && req.body.code !== existingSubunit.code) {
                const existingCode = await prisma_client_1.default.subunits.findUnique({
                    where: { code: req.body.code },
                });
                if (existingCode) {
                    return res
                        .status(400)
                        .json({ message: 'Subunit with this code already exists' });
                }
            }
            const subunit = await prisma_client_1.default.subunits.update({
                where: { id: Number(id) },
                data,
                include: {
                    subunits_unit_of_measurement: true,
                },
            });
            res.json({
                message: 'Subunit updated successfully',
                data: serializeSubunit(subunit),
            });
        }
        catch (error) {
            console.error('Update Subunit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteSubunit(req, res) {
        try {
            const { id } = req.params;
            const subunitId = Number(id);
            const existingSubunit = await prisma_client_1.default.subunits.findUnique({
                where: { id: subunitId },
            });
            if (!existingSubunit) {
                return res.status(404).json({ message: 'Subunit not found' });
            }
            await prisma_client_1.default.subunits.delete({ where: { id: subunitId } });
            res.json({ message: 'Subunit deleted successfully' });
        }
        catch (error) {
            console.error('Delete Subunit Error:', error);
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete subunit. It is referenced by other records.',
                    suggestion: 'Please update or delete the dependent records first, or consider setting the subunit as inactive instead.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    async getUnitsOfMeasurement(req, res) {
        try {
            const { search = '' } = req.query;
            const searchLower = search.toLowerCase().trim();
            const units = await prisma_client_1.default.unit_of_measurement.findMany({
                where: {
                    is_active: 'Y',
                    ...(searchLower && {
                        OR: [
                            {
                                name: {
                                    contains: searchLower,
                                },
                            },
                            {
                                symbol: {
                                    contains: searchLower,
                                },
                            },
                        ],
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    symbol: true,
                },
                orderBy: {
                    name: 'asc',
                },
                take: 50,
            });
            res.json({
                message: 'Units of measurement retrieved successfully',
                data: units,
            });
        }
        catch (error) {
            console.error('Get Units of Measurement Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProducts(req, res) {
        try {
            const { search = '' } = req.query;
            const searchLower = search.toLowerCase().trim();
            const products = await prisma_client_1.default.products.findMany({
                where: {
                    is_active: 'Y',
                    ...(searchLower && {
                        OR: [
                            {
                                name: {
                                    contains: searchLower,
                                },
                            },
                            {
                                code: {
                                    contains: searchLower,
                                },
                            },
                        ],
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
                orderBy: {
                    name: 'asc',
                },
                take: 50,
            });
            res.json({
                message: 'Products retrieved successfully',
                data: products,
            });
        }
        catch (error) {
            console.error('Get Products Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=subunits.controller.js.map