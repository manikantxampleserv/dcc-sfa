"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetTypesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeAssetType = (assetType) => ({
    id: assetType.id,
    name: assetType.name,
    description: assetType.description,
    category: assetType.category,
    brand: assetType.brand,
    is_active: assetType.is_active,
    created_by: assetType.createdby,
    createdate: assetType.createdate,
    updatedate: assetType.updatedate,
    updatedby: assetType.updatedby,
});
exports.assetTypesController = {
    async createAssetType(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Asset type name is required' });
            }
            const assetType = await prisma_client_1.default.asset_types.create({
                data: {
                    ...data,
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Asset type created successfully',
                data: serializeAssetType(assetType),
            });
        }
        catch (error) {
            console.error('Create Asset Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetTypes(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, category, brand, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: isActive,
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { description: { contains: searchLower } },
                        { category: { contains: searchLower } },
                        { brand: { contains: searchLower } },
                    ],
                }),
                ...(category && { category: category }),
                ...(brand && { brand: brand }),
            };
            const totalAssetTypes = await prisma_client_1.default.asset_types.count();
            const activeAssetTypes = await prisma_client_1.default.asset_types.count({
                where: { is_active: 'Y' },
            });
            const inactiveAssetTypes = await prisma_client_1.default.asset_types.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newAssetTypesThisMonth = await prisma_client_1.default.asset_types.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_asset_types: totalAssetTypes,
                active_asset_types: activeAssetTypes,
                inactive_asset_types: inactiveAssetTypes,
                new_asset_types: newAssetTypesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_types,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Asset types retrieved successfully',
                data: data.map((d) => serializeAssetType(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Asset Types Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getAssetTypeById(req, res) {
        try {
            const { id } = req.params;
            const assetType = await prisma_client_1.default.asset_types.findUnique({
                where: { id: Number(id) },
            });
            if (!assetType) {
                return res.status(404).json({ message: 'Asset type not found' });
            }
            res.json({
                message: 'Asset type fetched successfully',
                data: serializeAssetType(assetType),
            });
        }
        catch (error) {
            console.error('Get Asset Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetType(req, res) {
        try {
            const { id } = req.params;
            const existingAssetType = await prisma_client_1.default.asset_types.findUnique({
                where: { id: Number(id) },
            });
            if (!existingAssetType) {
                return res.status(404).json({ message: 'Asset type not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const assetType = await prisma_client_1.default.asset_types.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Asset type updated successfully',
                data: serializeAssetType(assetType),
            });
        }
        catch (error) {
            console.error('Update Asset Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetType(req, res) {
        try {
            const { id } = req.params;
            const existingAssetType = await prisma_client_1.default.asset_types.findUnique({
                where: { id: Number(id) },
            });
            if (!existingAssetType) {
                return res.status(404).json({ message: 'Asset type not found' });
            }
            await prisma_client_1.default.asset_types.delete({ where: { id: Number(id) } });
            res.json({ message: 'Asset type deleted successfully' });
        }
        catch (error) {
            console.error('Delete Asset Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=assetTypes.controller.js.map