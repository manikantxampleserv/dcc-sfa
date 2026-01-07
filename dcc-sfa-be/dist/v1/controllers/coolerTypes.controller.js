"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coolerTypesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeCoolerType = (coolerType) => ({
    id: coolerType.id,
    name: coolerType.name,
    code: coolerType.code,
    description: coolerType.description,
    is_active: coolerType.is_active,
    created_by: coolerType.createdby,
    createdate: coolerType.createdate,
    updatedate: coolerType.updatedate,
    updatedby: coolerType.updatedby,
});
exports.coolerTypesController = {
    async createCoolerType(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res
                    .status(400)
                    .json({ message: 'Cooler type name is required' });
            }
            const generateCode = (name) => {
                const words = name.toUpperCase().split(/\s+/);
                const firstWord = words[0];
                let abbreviation = firstWord.substring(0, 4);
                if (firstWord.length <= 4) {
                    abbreviation = firstWord;
                }
                return `CT-${abbreviation}`;
            };
            const coolerType = await prisma_client_1.default.cooler_types.create({
                data: {
                    ...data,
                    code: data.code && data.code.trim() !== ''
                        ? data.code
                        : generateCode(data.name),
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Cooler type created successfully',
                data: serializeCoolerType(coolerType),
            });
        }
        catch (error) {
            console.error('Create Cooler Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCoolerTypes(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                ...(isActive && { is_active: isActive }),
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                        { description: { contains: searchLower } },
                    ],
                }),
            };
            const totalCoolerTypes = await prisma_client_1.default.cooler_types.count();
            const activeCoolerTypes = await prisma_client_1.default.cooler_types.count({
                where: { is_active: 'Y' },
            });
            const inactiveCoolerTypes = await prisma_client_1.default.cooler_types.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newCoolerTypesThisMonth = await prisma_client_1.default.cooler_types.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_cooler_types: totalCoolerTypes,
                active_cooler_types: activeCoolerTypes,
                inactive_cooler_types: inactiveCoolerTypes,
                new_cooler_types: newCoolerTypesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.cooler_types,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Cooler types retrieved successfully',
                data: data.map((d) => serializeCoolerType(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Cooler Types Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getCoolerTypeById(req, res) {
        try {
            const { id } = req.params;
            const coolerType = await prisma_client_1.default.cooler_types.findUnique({
                where: { id: Number(id) },
            });
            if (!coolerType) {
                return res.status(404).json({ message: 'Cooler type not found' });
            }
            res.json({
                message: 'Cooler type fetched successfully',
                data: serializeCoolerType(coolerType),
            });
        }
        catch (error) {
            console.error('Get Cooler Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCoolerType(req, res) {
        try {
            const { id } = req.params;
            const existingCoolerType = await prisma_client_1.default.cooler_types.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCoolerType) {
                return res.status(404).json({ message: 'Cooler type not found' });
            }
            const generateCode = (name) => {
                const words = name.toUpperCase().split(/\s+/);
                const firstWord = words[0];
                let abbreviation = firstWord.substring(0, 4);
                if (firstWord.length <= 4) {
                    abbreviation = firstWord;
                }
                return `CT-${abbreviation}`;
            };
            const nameToUse = req.body.name || existingCoolerType.name;
            const codeToUse = req.body.code && req.body.code.trim() !== ''
                ? req.body.code
                : generateCode(nameToUse);
            const data = {
                ...req.body,
                code: codeToUse,
                updatedate: new Date(),
            };
            const coolerType = await prisma_client_1.default.cooler_types.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Cooler type updated successfully',
                data: serializeCoolerType(coolerType),
            });
        }
        catch (error) {
            console.error('Update Cooler Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCoolerType(req, res) {
        try {
            const { id } = req.params;
            const existingCoolerType = await prisma_client_1.default.cooler_types.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCoolerType) {
                return res.status(404).json({ message: 'Cooler type not found' });
            }
            await prisma_client_1.default.cooler_types.delete({ where: { id: Number(id) } });
            res.json({ message: 'Cooler type deleted successfully' });
        }
        catch (error) {
            console.error('Delete Cooler Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCoolerTypesDropdown(req, res) {
        try {
            const coolerTypes = await prisma_client_1.default.cooler_types.findMany({
                where: { is_active: 'Y' },
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
                orderBy: { name: 'asc' },
            });
            res.json({
                success: true,
                message: 'Cooler types dropdown retrieved successfully',
                data: coolerTypes,
            });
        }
        catch (error) {
            console.error('Get Cooler Types Dropdown Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};
//# sourceMappingURL=coolerTypes.controller.js.map