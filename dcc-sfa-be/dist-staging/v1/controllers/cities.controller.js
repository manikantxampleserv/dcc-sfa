"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.citiesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateCityCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastCity = await prisma_client_1.default.cities.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastCity && lastCity.code) {
        const match = lastCity.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeCity = (city, includeDistrict = false) => ({
    id: city.id,
    district_id: city.district_id,
    name: city.name,
    code: city.code,
    description: city.description,
    is_active: city.is_active,
    createdate: city.createdate,
    createdby: city.createdby,
    updatedate: city.updatedate,
    updatedby: city.updatedby,
    log_inst: city.log_inst,
    cities_districts: includeDistrict && city.cities_districts
        ? {
            id: city.cities_districts.id,
            name: city.cities_districts.name,
            code: city.cities_districts.code,
        }
        : null,
});
exports.citiesController = {
    async createCities(req, res) {
        try {
            const data = req.body;
            if (!data.name || !data.district_id) {
                return res.status(400).json({
                    message: 'City name and district_id are required',
                });
            }
            // Check if district exists
            const district = await prisma_client_1.default.districts.findUnique({
                where: { id: Number(data.district_id) },
            });
            if (!district) {
                return res.status(400).json({ message: 'District not found' });
            }
            const existingCity = await prisma_client_1.default.cities.findFirst({
                where: {
                    name: data.name,
                    district_id: Number(data.district_id),
                },
            });
            if (existingCity) {
                return res.status(400).json({
                    message: 'City with this name already exists in this district',
                });
            }
            if (data.code) {
                const existingCode = await prisma_client_1.default.cities.findFirst({
                    where: {
                        code: data.code,
                        district_id: Number(data.district_id),
                    },
                });
                if (existingCode) {
                    return res.status(400).json({
                        message: 'City with this code already exists in this district',
                    });
                }
            }
            const city = await prisma_client_1.default.cities.create({
                data: {
                    name: data.name,
                    district_id: Number(data.district_id),
                    code: data.code || (await generateCityCode(data.name)),
                    description: data.description || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || data.createdby || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    cities_districts: true,
                },
            });
            res.status(201).json({
                message: 'City created successfully',
                data: serializeCity(city, true),
            });
        }
        catch (error) {
            console.error('Create City Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllCities(req, res) {
        try {
            const { page, limit, search, status, district_id } = req.query;
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
                ...(district_id && { district_id: Number(district_id) }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.cities,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    cities_districts: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            // Statistics
            const totalCities = await prisma_client_1.default.cities.count();
            const activeCities = await prisma_client_1.default.cities.count({
                where: { is_active: 'Y' },
            });
            const inactiveCities = await prisma_client_1.default.cities.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newCitiesThisMonth = await prisma_client_1.default.cities.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Cities retrieved successfully', data.map((c) => serializeCity(c, true)), 200, pagination, {
                total_cities: totalCities,
                active_cities: activeCities,
                inactive_cities: inactiveCities,
                new_cities_this_month: newCitiesThisMonth,
            });
        }
        catch (error) {
            console.error('Get Cities Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCitiesById(req, res) {
        try {
            const { id } = req.params;
            const city = await prisma_client_1.default.cities.findUnique({
                where: { id: Number(id) },
                include: {
                    cities_districts: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            if (!city) {
                return res.status(404).json({ message: 'City not found' });
            }
            res.json({
                message: 'City fetched successfully',
                data: serializeCity(city, true),
            });
        }
        catch (error) {
            console.error('Get City Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCities(req, res) {
        try {
            const { id } = req.params;
            const existingCity = await prisma_client_1.default.cities.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCity) {
                return res.status(404).json({ message: 'City not found' });
            }
            const data = req.body;
            if (data.district_id) {
                const district = await prisma_client_1.default.districts.findUnique({
                    where: { id: Number(data.district_id) },
                });
                if (!district) {
                    return res.status(400).json({ message: 'District not found' });
                }
            }
            if (data.name && data.name !== existingCity.name) {
                const duplicateCity = await prisma_client_1.default.cities.findFirst({
                    where: {
                        name: data.name,
                        district_id: data.district_id
                            ? Number(data.district_id)
                            : existingCity.district_id,
                    },
                });
                if (duplicateCity) {
                    return res.status(400).json({
                        message: 'City with this name already exists in this district',
                    });
                }
            }
            if (data.code && data.code !== existingCity.code) {
                const duplicateCode = await prisma_client_1.default.cities.findFirst({
                    where: {
                        code: data.code,
                        district_id: data.district_id
                            ? Number(data.district_id)
                            : existingCity.district_id,
                    },
                });
                if (duplicateCode) {
                    return res.status(400).json({
                        message: 'City with this code already exists in this district',
                    });
                }
            }
            const updatedCity = await prisma_client_1.default.cities.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    district_id: data.district_id
                        ? Number(data.district_id)
                        : existingCity.district_id,
                    updatedate: new Date(),
                    updatedby: req.user?.id,
                },
                include: {
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
                message: 'City updated successfully',
                data: serializeCity(updatedCity, true),
            });
        }
        catch (error) {
            console.error('Update City Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCities(req, res) {
        try {
            const { id } = req.params;
            const existingCity = await prisma_client_1.default.cities.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCity) {
                return res.status(404).json({ message: 'City not found' });
            }
            await prisma_client_1.default.cities.delete({ where: { id: Number(id) } });
            res.json({ message: 'City deleted successfully' });
        }
        catch (error) {
            console.error('Delete City Error:', error);
            if (error.code === 'P2003' ||
                error.message.includes('Foreign key constraint violated')) {
                return res.status(400).json({
                    message: 'Cannot delete city. It is referenced by other records. Please update or delete those records first.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=cities.controller.js.map