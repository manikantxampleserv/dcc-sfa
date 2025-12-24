"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productVolumesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateVolumeCode = (name) => {
    const upperName = name.trim().toUpperCase();
    const volumeMatch = upperName.match(/([\d.]+)\s*(LTR|L|ML|MLTR)/i);
    if (volumeMatch) {
        const numberStr = volumeMatch[1];
        const unit = volumeMatch[2].toUpperCase();
        const numValue = parseFloat(numberStr);
        let number = '';
        if (Number.isInteger(numValue)) {
            number = numValue.toString();
        }
        else {
            number = numberStr.replace('.', '');
        }
        if (unit === 'LTR' || unit === 'L') {
            return `VOL-${number}L-001`;
        }
        return `VOL-${number}${unit}-001`;
    }
    const numberOnly = upperName.replace(/[^\d.]/g, '');
    if (numberOnly) {
        const numValue = parseFloat(numberOnly);
        const cleanNumber = Number.isInteger(numValue)
            ? numValue.toString()
            : numberOnly.replace('.', '');
        return `VOL-${cleanNumber}-001`;
    }
    const prefix = upperName.substring(0, 6).replace(/\s+/g, '');
    return `VOL-${prefix}-001`;
};
const serializeProductVolume = (volume) => ({
    id: volume.id,
    name: volume.name,
    code: volume.code,
    is_active: volume.is_active,
    created_by: volume.createdby,
    createdate: volume.createdate,
    updatedate: volume.updatedate,
    updatedby: volume.updatedby,
});
exports.productVolumesController = {
    async createProductVolume(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Volume name is required' });
            }
            const code = data.code || generateVolumeCode(data.name);
            const volume = await prisma_client_1.default.product_volumes.create({
                data: {
                    ...data,
                    code,
                    createdby: data.createdby
                        ? Number(data.createdby)
                        : req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Product volume created successfully',
                data: serializeProductVolume(volume),
            });
        }
        catch (error) {
            console.error('Create Product Volume Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductVolumes(req, res) {
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
                    ],
                }),
            };
            const totalVolumes = await prisma_client_1.default.product_volumes.count();
            const activeVolumes = await prisma_client_1.default.product_volumes.count({
                where: { is_active: 'Y' },
            });
            const inactiveVolumes = await prisma_client_1.default.product_volumes.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newVolumesThisMonth = await prisma_client_1.default.product_volumes.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_product_volumes: totalVolumes,
                active_product_volumes: activeVolumes,
                inactive_product_volumes: inactiveVolumes,
                new_product_volumes_this_month: newVolumesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.product_volumes,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Product volumes retrieved successfully',
                data: data.map((d) => serializeProductVolume(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Product Volumes Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductVolumeById(req, res) {
        try {
            const { id } = req.params;
            const volume = await prisma_client_1.default.product_volumes.findUnique({
                where: { id: Number(id) },
            });
            if (!volume) {
                return res.status(404).json({ message: 'Product volume not found' });
            }
            res.json({
                message: 'Product volume fetched successfully',
                data: serializeProductVolume(volume),
            });
        }
        catch (error) {
            console.error('Get Product Volume Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateProductVolume(req, res) {
        try {
            const { id } = req.params;
            const existingVolume = await prisma_client_1.default.product_volumes.findUnique({
                where: { id: Number(id) },
            });
            if (!existingVolume) {
                return res.status(404).json({ message: 'Product volume not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const volume = await prisma_client_1.default.product_volumes.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Product volume updated successfully',
                data: serializeProductVolume(volume),
            });
        }
        catch (error) {
            console.error('Update Product Volume Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteProductVolume(req, res) {
        try {
            const { id } = req.params;
            const existingVolume = await prisma_client_1.default.product_volumes.findUnique({
                where: { id: Number(id) },
            });
            if (!existingVolume) {
                return res.status(404).json({ message: 'Product volume not found' });
            }
            await prisma_client_1.default.product_volumes.delete({ where: { id: Number(id) } });
            res.json({ message: 'Product volume deleted successfully' });
        }
        catch (error) {
            console.error('Delete Product Volume Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductVolumesDropdown(req, res) {
        try {
            const { search = '', volume_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const volumeId = volume_id ? Number(volume_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (volumeId) {
                where.id = volumeId;
            }
            else if (searchLower) {
                where.OR = [
                    {
                        name: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        code: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const volumes = await prisma_client_1.default.product_volumes.findMany({
                where,
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
            res.success('Product volumes dropdown fetched successfully', volumes, 200);
        }
        catch (error) {
            console.error('Error fetching product volumes dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=productVolumes.controller.js.map