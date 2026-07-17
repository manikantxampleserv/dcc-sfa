"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandsController = void 0;
const blackbaze_1 = require("../../utils/blackbaze");
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateBrandCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastBrand = await prisma_client_1.default.brands.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastBrand && lastBrand.code) {
        const match = lastBrand.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeBrand = (b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    description: b.description,
    logo: b.logo,
    is_active: b.is_active,
    createdate: b.createdate,
    createdby: b.createdby,
    updatedate: b.updatedate,
    updatedby: b.updatedby,
    log_inst: b.log_inst,
});
exports.brandsController = {
    async createBrand(req, res) {
        try {
            const data = req.body;
            let logoPath = null;
            if (req.file) {
                const fileName = `brands/${Date.now()}-${req.file.originalname}`;
                logoPath = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
            }
            const brand = await prisma_client_1.default.brands.create({
                data: {
                    name: data.name,
                    code: await generateBrandCode(data.name),
                    description: data.description || null,
                    logo: logoPath,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id,
                    log_inst: data.log_inst || 1,
                },
            });
            res.status(201).json({
                message: 'Brand created successfully',
                data: serializeBrand(brand),
            });
        }
        catch (error) {
            console.error('Create Brand Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllBrands(req, res) {
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
                        {
                            description: { contains: searchLower },
                        },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.brands,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const totalBrands = await prisma_client_1.default.brands.count();
            const activeBrands = await prisma_client_1.default.brands.count({
                where: { is_active: 'Y' },
            });
            const inactiveBrands = await prisma_client_1.default.brands.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newBrandsThisMonth = await prisma_client_1.default.brands.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Brands retrieved successfully', data.map((b) => serializeBrand(b)), 200, pagination, {
                total_brands: totalBrands,
                active_brands: activeBrands,
                inactive_brands: inactiveBrands,
                new_brands_this_month: newBrandsThisMonth,
            });
        }
        catch (error) {
            console.error('Get Brands Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getBrandById(req, res) {
        try {
            const { id } = req.params;
            const brand = await prisma_client_1.default.brands.findUnique({
                where: { id: Number(id) },
            });
            if (!brand)
                return res.status(404).json({ message: 'Brand not found' });
            res.json({
                message: 'Brand fetched successfully',
                data: serializeBrand(brand),
            });
        }
        catch (error) {
            console.error('Get Brand Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateBrand(req, res) {
        try {
            const { id } = req.params;
            const existingBrand = await prisma_client_1.default.brands.findUnique({
                where: { id: Number(id) },
            });
            if (!existingBrand)
                return res.status(404).json({ message: 'Brand not found' });
            let logoPath = existingBrand.logo;
            if (req.file) {
                const fileName = `brands/${Date.now()}-${req.file.originalname}`;
                logoPath = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
                if (existingBrand.logo)
                    await (0, blackbaze_1.deleteFile)(existingBrand.logo);
            }
            const data = {
                ...req.body,
                logo: logoPath,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const updatedBrand = await prisma_client_1.default.brands.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Brand updated successfully',
                data: serializeBrand(updatedBrand),
            });
        }
        catch (error) {
            console.error('Update Brand Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteBrand(req, res) {
        try {
            const { id } = req.params;
            const brand = await prisma_client_1.default.brands.findUnique({
                where: { id: Number(id) },
            });
            if (!brand)
                return res.status(404).json({ message: 'Brand not found' });
            const productsCount = await prisma_client_1.default.products.count({
                where: { brand_id: Number(id) },
            });
            const inventoryStockCount = await prisma_client_1.default.inventory_stock.count({
                where: {
                    inventory_stock_products: {
                        brand_id: Number(id),
                    },
                },
            });
            if (productsCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete brand: It has associated products. Please delete or reassign the products first.',
                });
            }
            if (inventoryStockCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete brand: It has associated inventory records. Please clear the inventory first.',
                });
            }
            if (brand.logo)
                await (0, blackbaze_1.deleteFile)(brand.logo);
            await prisma_client_1.default.brands.delete({ where: { id: Number(id) } });
            res.json({ message: 'Brand deleted successfully' });
        }
        catch (error) {
            console.error('Delete Brand Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=brands.controller.js.map