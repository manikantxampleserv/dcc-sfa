"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.districtsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateDistrictCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastDistrict = await prisma_client_1.default.districts.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastDistrict && lastDistrict.code) {
        const match = lastDistrict.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeDistrict = (district, includeRegion = false, includeCities = false) => ({
    id: district.id,
    region_id: district.region_id,
    name: district.name,
    code: district.code,
    description: district.description,
    is_active: district.is_active,
    createdate: district.createdate,
    createdby: district.createdby,
    updatedate: district.updatedate,
    updatedby: district.updatedby,
    log_inst: district.log_inst,
    district_regions: includeRegion && district.district_regions
        ? {
            id: district.district_regions.id,
            name: district.district_regions.name,
            code: district.district_regions.code,
        }
        : null,
    cities_districts: includeCities && district.cities_districts
        ? district.cities_districts.map((city) => ({
            id: city.id,
            name: city.name,
            code: city.code,
        }))
        : [],
});
exports.districtsController = {
    async createDistricts(req, res) {
        try {
            const data = req.body;
            if (!data.name || !data.region_id) {
                return res.status(400).json({
                    message: 'District name and region_id are required',
                });
            }
            const region = await prisma_client_1.default.regions.findUnique({
                where: { id: Number(data.region_id) },
            });
            if (!region) {
                return res.status(400).json({ message: 'Region not found' });
            }
            const existingDistrict = await prisma_client_1.default.districts.findFirst({
                where: {
                    name: data.name,
                    region_id: Number(data.region_id),
                },
            });
            if (existingDistrict) {
                return res.status(400).json({
                    message: 'District with this name already exists in this region',
                });
            }
            const district = await prisma_client_1.default.districts.create({
                data: {
                    name: data.name,
                    region_id: Number(data.region_id),
                    code: data.code || (await generateDistrictCode(data.name)),
                    description: data.description || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || data.createdby || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    district_regions: true,
                    cities_districts: true,
                },
            });
            res.status(201).json({
                message: 'District created successfully',
                data: serializeDistrict(district, true, true),
            });
        }
        catch (error) {
            console.error('Create District Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllDistricts(req, res) {
        try {
            const { page, limit, search, status, region_id } = req.query;
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
                ...(region_id && { region_id: Number(region_id) }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.districts,
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
                    cities_districts: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            const totalDistricts = await prisma_client_1.default.districts.count();
            const activeDistricts = await prisma_client_1.default.districts.count({
                where: { is_active: 'Y' },
            });
            const inactiveDistricts = await prisma_client_1.default.districts.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newDistrictsThisMonth = await prisma_client_1.default.districts.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Districts retrieved successfully', data.map((d) => serializeDistrict(d, true, true)), 200, pagination, {
                total_districts: totalDistricts,
                active_districts: activeDistricts,
                inactive_districts: inactiveDistricts,
                new_districts_this_month: newDistrictsThisMonth,
            });
        }
        catch (error) {
            console.error('Get Districts Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getDistrictsById(req, res) {
        try {
            const { id } = req.params;
            const district = await prisma_client_1.default.districts.findUnique({
                where: { id: Number(id) },
                include: {
                    district_regions: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cities_districts: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            if (!district) {
                return res.status(404).json({ message: 'District not found' });
            }
            res.json({
                message: 'District fetched successfully',
                data: serializeDistrict(district, true, true),
            });
        }
        catch (error) {
            console.error('Get District Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateDistricts(req, res) {
        try {
            const { id } = req.params;
            const existingDistrict = await prisma_client_1.default.districts.findUnique({
                where: { id: Number(id) },
            });
            if (!existingDistrict) {
                return res.status(404).json({ message: 'District not found' });
            }
            const data = req.body;
            if (data.region_id) {
                const region = await prisma_client_1.default.regions.findUnique({
                    where: { id: Number(data.region_id) },
                });
                if (!region) {
                    return res.status(400).json({ message: 'Region not found' });
                }
            }
            if (data.name && data.name !== existingDistrict.name) {
                const duplicateDistrict = await prisma_client_1.default.districts.findFirst({
                    where: {
                        name: data.name,
                        region_id: data.region_id
                            ? Number(data.region_id)
                            : existingDistrict.region_id,
                    },
                });
                if (duplicateDistrict) {
                    return res.status(400).json({
                        message: 'District with this name already exists in this region',
                    });
                }
            }
            const updatedDistrict = await prisma_client_1.default.districts.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    region_id: data.region_id
                        ? Number(data.region_id)
                        : existingDistrict.region_id,
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
                    cities_districts: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            res.json({
                message: 'District updated successfully',
                data: serializeDistrict(updatedDistrict, true, true),
            });
        }
        catch (error) {
            console.error('Update District Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteDistricts(req, res) {
        try {
            const { id } = req.params;
            const existingDistrict = await prisma_client_1.default.districts.findUnique({
                where: { id: Number(id) },
                include: {
                    cities_districts: {
                        select: { id: true },
                    },
                },
            });
            if (!existingDistrict) {
                return res.status(404).json({ message: 'District not found' });
            }
            if (existingDistrict.cities_districts.length > 0) {
                return res.status(400).json({
                    message: `Cannot delete district. It has ${existingDistrict.cities_districts.length} associated cities. Please reassign or delete the cities first.`,
                });
            }
            await prisma_client_1.default.districts.delete({ where: { id: Number(id) } });
            res.json({ message: 'District deleted successfully' });
        }
        catch (error) {
            console.error('Delete District Error:', error);
            if (error.code === 'P2003' ||
                error.message.includes('Foreign key constraint violated')) {
                return res.status(400).json({
                    message: 'Cannot delete district. It is referenced by other records. Please update or delete those records first.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=districts.controller.js.map