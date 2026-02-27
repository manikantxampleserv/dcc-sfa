"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetSubTypesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeAssetSubType = (assetSubType) => ({
    id: assetSubType.id,
    name: assetSubType.name,
    code: assetSubType.code,
    asset_type_id: assetSubType.asset_type_id,
    description: assetSubType.description,
    is_active: assetSubType.is_active,
    createdby: assetSubType.createdby,
    createdate: assetSubType.createdate,
    updatedate: assetSubType.updatedate,
    updatedby: assetSubType.updatedby,
    asset_type: assetSubType.asset_sub_types_asset_types
        ? {
            id: assetSubType.asset_sub_types_asset_types.id,
            name: assetSubType.asset_sub_types_asset_types.name,
        }
        : null,
});
exports.assetSubTypesController = {
    async createAssetSubType(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res
                    .status(400)
                    .json({ message: 'Asset sub type name is required' });
            }
            if (!data.asset_type_id) {
                return res.status(400).json({ message: 'Asset type is required' });
            }
            const generateCode = async (name) => {
                const words = name.toUpperCase().split(/\s+/);
                const firstWord = words[0];
                let abbreviation = firstWord.substring(0, 4);
                if (firstWord.length <= 4) {
                    abbreviation = firstWord;
                }
                const baseCode = `AST-${abbreviation}`;
                const existingCodes = await prisma_client_1.default.asset_sub_types.findMany({
                    where: {
                        code: {
                            startsWith: baseCode,
                        },
                    },
                    select: {
                        code: true,
                    },
                    orderBy: {
                        code: 'desc',
                    },
                });
                let nextNumber = 1;
                if (existingCodes.length > 0) {
                    const lastCode = existingCodes[0].code;
                    const match = lastCode.match(new RegExp(`${baseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`));
                    if (match) {
                        nextNumber = parseInt(match[1]) + 1;
                    }
                }
                return `${baseCode}-${nextNumber.toString().padStart(2, '0')}`;
            };
            if (data.code && data.code.trim() !== '') {
                const existingCode = await prisma_client_1.default.asset_sub_types.findFirst({
                    where: { code: data.code.trim() },
                });
                if (existingCode) {
                    return res.status(400).json({
                        message: 'Code already exists. Please use a different code.',
                    });
                }
            }
            const finalCode = data.code && data.code.trim() !== ''
                ? data.code.trim()
                : await generateCode(data.name);
            const assetSubType = await prisma_client_1.default.asset_sub_types.create({
                data: {
                    ...data,
                    code: finalCode,
                    asset_type_id: Number(data.asset_type_id),
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Asset sub type created successfully',
                data: serializeAssetSubType(assetSubType),
            });
        }
        catch (error) {
            console.error('Create Asset Sub Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetSubTypes(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, assetTypeId, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                ...(isActive && { is_active: isActive }),
                ...(assetTypeId && { asset_type_id: Number(assetTypeId) }),
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                        { description: { contains: searchLower } },
                    ],
                }),
            };
            const totalAssetSubTypes = await prisma_client_1.default.asset_sub_types.count();
            const activeAssetSubTypes = await prisma_client_1.default.asset_sub_types.count({
                where: { is_active: 'Y' },
            });
            const inactiveAssetSubTypes = await prisma_client_1.default.asset_sub_types.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newAssetSubTypesThisMonth = await prisma_client_1.default.asset_sub_types.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_asset_sub_types: totalAssetSubTypes,
                active_asset_sub_types: activeAssetSubTypes,
                inactive_asset_sub_types: inactiveAssetSubTypes,
                new_asset_sub_types: newAssetSubTypesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_sub_types,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    asset_sub_types_asset_types: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            res.json({
                success: true,
                message: 'Asset sub types retrieved successfully',
                data: data.map((d) => serializeAssetSubType(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Asset Sub Types Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getAssetSubTypeById(req, res) {
        try {
            const { id } = req.params;
            const assetSubType = await prisma_client_1.default.asset_sub_types.findUnique({
                where: { id: Number(id) },
                include: {
                    asset_sub_types_asset_types: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            if (!assetSubType) {
                return res.status(404).json({ message: 'Asset sub type not found' });
            }
            res.json({
                message: 'Asset sub type fetched successfully',
                data: serializeAssetSubType(assetSubType),
            });
        }
        catch (error) {
            console.error('Get Asset Sub Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetSubType(req, res) {
        try {
            const { id } = req.params;
            const existingAssetSubType = await prisma_client_1.default.asset_sub_types.findUnique({
                where: { id: Number(id) },
            });
            if (!existingAssetSubType) {
                return res.status(404).json({ message: 'Asset sub type not found' });
            }
            const generateCode = async (name) => {
                const words = name.toUpperCase().split(/\s+/);
                const firstWord = words[0];
                let abbreviation = firstWord.substring(0, 4);
                if (firstWord.length <= 4) {
                    abbreviation = firstWord;
                }
                const baseCode = `AST-${abbreviation}`;
                const existingCodes = await prisma_client_1.default.asset_sub_types.findMany({
                    where: {
                        code: {
                            startsWith: baseCode,
                        },
                        id: {
                            not: Number(req.params.id),
                        },
                    },
                    select: {
                        code: true,
                    },
                    orderBy: {
                        code: 'desc',
                    },
                });
                let nextNumber = 1;
                if (existingCodes.length > 0) {
                    const lastCode = existingCodes[0].code;
                    const match = lastCode.match(new RegExp(`${baseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`));
                    if (match) {
                        nextNumber = parseInt(match[1]) + 1;
                    }
                }
                return `${baseCode}-${nextNumber.toString().padStart(2, '0')}`;
            };
            if (req.body.code && req.body.code.trim() !== '') {
                const existingCode = await prisma_client_1.default.asset_sub_types.findFirst({
                    where: {
                        code: req.body.code.trim(),
                        id: {
                            not: Number(req.params.id), // Exclude current record
                        },
                    },
                });
                if (existingCode) {
                    return res.status(400).json({
                        message: 'Code already exists. Please use a different code.',
                    });
                }
            }
            const nameToUse = req.body.name || existingAssetSubType.name;
            const finalCode = req.body.code && req.body.code.trim() !== ''
                ? req.body.code.trim()
                : await generateCode(nameToUse);
            const data = {
                ...req.body,
                code: finalCode,
                ...(req.body.asset_type_id && {
                    asset_type_id: Number(req.body.asset_type_id),
                }),
                updatedate: new Date(),
            };
            const assetSubType = await prisma_client_1.default.asset_sub_types.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Asset sub type updated successfully',
                data: serializeAssetSubType(assetSubType),
            });
        }
        catch (error) {
            console.error('Update Asset Sub Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetSubType(req, res) {
        try {
            const { id } = req.params;
            const existingAssetSubType = await prisma_client_1.default.asset_sub_types.findUnique({
                where: { id: Number(id) },
            });
            if (!existingAssetSubType) {
                return res.status(404).json({ message: 'Asset sub type not found' });
            }
            await prisma_client_1.default.asset_sub_types.delete({ where: { id: Number(id) } });
            res.json({ message: 'Asset sub type deleted successfully' });
        }
        catch (error) {
            console.error('Delete Asset Sub Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetSubTypesDropdown(req, res) {
        try {
            const { asset_type_id } = req.query;
            const assetSubTypes = await prisma_client_1.default.asset_sub_types.findMany({
                where: {
                    is_active: 'Y',
                    ...(asset_type_id && { asset_type_id: Number(asset_type_id) }),
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    asset_type_id: true,
                },
                orderBy: { name: 'asc' },
            });
            res.json({
                success: true,
                message: 'Asset sub types dropdown retrieved successfully',
                data: assetSubTypes,
            });
        }
        catch (error) {
            console.error('Get Asset Sub Types Dropdown Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};
//# sourceMappingURL=assetSubTypes.controller.js.map