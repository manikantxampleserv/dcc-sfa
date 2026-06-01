"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateRegionCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastRegion = await prisma_client_1.default.regions.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastRegion && lastRegion.code) {
        const match = lastRegion.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeRegion = (region, includeDistricts = false) => ({
    id: region.id,
    name: region.name,
    code: region.code,
    description: region.description,
    is_active: region.is_active,
    createdate: region.createdate,
    createdby: region.createdby,
    updatedate: region.updatedate,
    updatedby: region.updatedby,
    log_inst: region.log_inst,
    district_regions: includeDistricts && region.district_regions
        ? region.district_regions.map((district) => ({
            id: district.id,
            name: district.name,
            code: district.code,
        }))
        : [],
});
exports.regionsController = {
    async createRegions(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Region name is required' });
            }
            const existingRegion = await prisma_client_1.default.regions.findFirst({
                where: { name: data.name },
            });
            if (existingRegion) {
                return res
                    .status(400)
                    .json({ message: 'Region with this name already exists' });
            }
            const region = await prisma_client_1.default.regions.create({
                data: {
                    name: data.name,
                    code: data.code || (await generateRegionCode(data.name)),
                    description: data.description || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || data.createdby || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    district_regions: true,
                },
            });
            res.status(201).json({
                message: 'Region created successfully',
                data: serializeRegion(region, true),
            });
        }
        catch (error) {
            console.error('Create Region Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllRegions(req, res) {
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
                        { code: { contains: searchLower } },
                        { description: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.regions,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    district_regions: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            const totalRegions = await prisma_client_1.default.regions.count();
            const activeRegions = await prisma_client_1.default.regions.count({
                where: { is_active: 'Y' },
            });
            const inactiveRegions = await prisma_client_1.default.regions.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newRegionsThisMonth = await prisma_client_1.default.regions.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Regions retrieved successfully', data.map((r) => serializeRegion(r, true)), 200, pagination, {
                total_regions: totalRegions,
                active_regions: activeRegions,
                inactive_regions: inactiveRegions,
                new_regions_this_month: newRegionsThisMonth,
            });
        }
        catch (error) {
            console.error('Get Regions Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getRegionsById(req, res) {
        try {
            const { id } = req.params;
            const region = await prisma_client_1.default.regions.findUnique({
                where: { id: Number(id) },
                include: {
                    district_regions: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            if (!region) {
                return res.status(404).json({ message: 'Region not found' });
            }
            res.json({
                message: 'Region fetched successfully',
                data: serializeRegion(region, true),
            });
        }
        catch (error) {
            console.error('Get Region Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateRegions(req, res) {
        try {
            const { id } = req.params;
            const existingRegion = await prisma_client_1.default.regions.findUnique({
                where: { id: Number(id) },
            });
            if (!existingRegion) {
                return res.status(404).json({ message: 'Region not found' });
            }
            const data = req.body;
            // Check for duplicate name (excluding current record)
            if (data.name && data.name !== existingRegion.name) {
                const duplicateRegion = await prisma_client_1.default.regions.findFirst({
                    where: { name: data.name },
                });
                if (duplicateRegion) {
                    return res
                        .status(400)
                        .json({ message: 'Region with this name already exists' });
                }
            }
            const updatedRegion = await prisma_client_1.default.regions.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    updatedate: new Date(),
                    updatedby: req.user?.id,
                },
                include: {
                    district_regions: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            res.json({
                message: 'Region updated successfully',
                data: serializeRegion(updatedRegion, true),
            });
        }
        catch (error) {
            console.error('Update Region Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteRegions(req, res) {
        try {
            const { id } = req.params;
            const existingRegion = await prisma_client_1.default.regions.findUnique({
                where: { id: Number(id) },
                include: {
                    district_regions: {
                        select: { id: true },
                    },
                },
            });
            if (!existingRegion) {
                return res.status(404).json({ message: 'Region not found' });
            }
            // Check for associated districts
            if (existingRegion.district_regions.length > 0) {
                return res.status(400).json({
                    message: `Cannot delete region. It has ${existingRegion.district_regions.length} associated district(s). Please reassign or delete the districts first.`,
                });
            }
            await prisma_client_1.default.regions.delete({ where: { id: Number(id) } });
            res.json({ message: 'Region deleted successfully' });
        }
        catch (error) {
            console.error('Delete Region Error:', error);
            if (error.code === 'P2003' ||
                error.message.includes('Foreign key constraint violated')) {
                return res.status(400).json({
                    message: 'Cannot delete region. It is referenced by other records. Please update or delete those records first.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=regions.controller.js.map