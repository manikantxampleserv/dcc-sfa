"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetImagesController = void 0;
const blackbaze_1 = require("../../utils/blackbaze");
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeAssetImage = (img) => ({
    id: img.id,
    asset_id: img.asset_id,
    image_url: img.image_url,
    caption: img.caption,
    uploaded_by: img.uploaded_by,
    uploaded_at: img.uploaded_at,
    is_active: img.is_active,
    createdate: img.createdate,
    createdby: img.createdby,
    updatedate: img.updatedate,
    updatedby: img.updatedby,
    log_inst: img.log_inst,
});
exports.assetImagesController = {
    async createAssetImages(req, res) {
        try {
            const data = req.body;
            if (!data.asset_id)
                return res.status(400).json({ message: 'asset_id is required' });
            if (!req.file)
                return res.status(400).json({ message: 'Image file is required' });
            const fileName = `asset-images/${Date.now()}-${req.file.originalname}`;
            const imageUrl = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
            const image = await prisma_client_1.default.asset_images.create({
                data: {
                    asset_id: Number(data.asset_id),
                    image_url: imageUrl,
                    caption: data.caption,
                    uploaded_by: req.user?.name || 'System',
                    uploaded_at: new Date(),
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
            });
            res.status(201).json({
                message: 'Asset image uploaded successfully',
                data: serializeAssetImage(image),
            });
        }
        catch (error) {
            console.error('Create Asset Image Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllAssetImages(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [{ caption: { contains: searchLower } }],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_images,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const totalAssets = await prisma_client_1.default.asset_images.count({ where: filters });
            const activeAssetImages = await prisma_client_1.default.asset_images.count({
                where: { is_active: 'Y' },
            });
            const inactiveAssetImages = await prisma_client_1.default.asset_images.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const totalAssetImages = await prisma_client_1.default.asset_images.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Asset images retrieved successfully', data.map((img) => serializeAssetImage(img)), 200, pagination, {
                total_asset_images: totalAssets,
                active_asset_images: activeAssetImages,
                total_asset_images_this_month: totalAssetImages,
                inactive_asset_images: inactiveAssetImages,
            });
        }
        catch (error) {
            console.error('Get Asset Images Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetImagesById(req, res) {
        try {
            const { id } = req.params;
            const image = await prisma_client_1.default.asset_images.findUnique({
                where: { id: Number(id) },
            });
            if (!image)
                return res.status(404).json({ message: 'Asset image not found' });
            res.json({
                message: 'Asset image fetched successfully',
                data: serializeAssetImage(image),
            });
        }
        catch (error) {
            console.error('Get Asset Image Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetImages(req, res) {
        try {
            const { id } = req.params;
            const existingImage = await prisma_client_1.default.asset_images.findUnique({
                where: { id: Number(id) },
            });
            if (!existingImage)
                return res.status(404).json({ message: 'Asset image not found' });
            let imageUrl = existingImage.image_url;
            if (req.file) {
                const fileName = `asset-images/${Date.now()}-${req.file.originalname}`;
                imageUrl = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
                if (existingImage.image_url)
                    await (0, blackbaze_1.deleteFile)(existingImage.image_url);
            }
            const updated = await prisma_client_1.default.asset_images.update({
                where: { id: Number(id) },
                data: {
                    caption: req.body.caption ?? existingImage.caption,
                    image_url: imageUrl,
                    is_active: req.body.is_active ?? existingImage.is_active,
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                },
            });
            res.json({
                message: 'Asset image updated successfully',
                data: serializeAssetImage(updated),
            });
        }
        catch (error) {
            console.error('Update Asset Image Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetImages(req, res) {
        try {
            const { id } = req.params;
            const image = await prisma_client_1.default.asset_images.findUnique({
                where: { id: Number(id) },
            });
            if (!image)
                return res.status(404).json({ message: 'Asset image not found' });
            if (image.image_url)
                await (0, blackbaze_1.deleteFile)(image.image_url);
            await prisma_client_1.default.asset_images.delete({ where: { id: Number(id) } });
            res.json({ message: 'Asset image deleted successfully' });
        }
        catch (error) {
            console.error('Delete Asset Image Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=assetImages.controller.js.map