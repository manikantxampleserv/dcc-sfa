"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxMasterController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
const serializeTaxMaster = (taxMaster) => ({
    id: taxMaster.id,
    name: taxMaster.name,
    code: taxMaster.code,
    tax_rate: Number(taxMaster.tax_rate),
    description: taxMaster.description,
    is_active: taxMaster.is_active,
    created_by: taxMaster.createdby,
    createdate: taxMaster.createdate,
    updatedate: taxMaster.updatedate,
    updatedby: taxMaster.updatedby,
});
exports.taxMasterController = {
    async createTaxMaster(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.id || 1;
            if (!data.name) {
                return res.status(400).json({ message: 'Tax name is required' });
            }
            if (!data.code) {
                return res.status(400).json({ message: 'Tax code is required' });
            }
            if (data.tax_rate === undefined || data.tax_rate === null) {
                return res.status(400).json({ message: 'Tax rate is required' });
            }
            const existingCode = await prisma_client_1.default.tax_master.findFirst({
                where: { code: data.code },
            });
            if (existingCode) {
                return res.status(400).json({ message: 'Tax code already exists' });
            }
            const taxMaster = await prisma_client_1.default.tax_master.create({
                data: {
                    name: data.name,
                    code: data.code,
                    tax_rate: Number(data.tax_rate),
                    description: data.description || null,
                    is_active: data.is_active || 'Y',
                    createdby: userId,
                    log_inst: 1,
                    createdate: new Date(),
                },
            });
            return res.success('Tax master created successfully', serializeTaxMaster(taxMaster), 201);
        }
        catch (error) {
            console.error('Create Tax Master Error:', error);
            return res.error(error.message || 'Failed to create tax master', 500);
        }
    },
    async getTaxMasters(req, res) {
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
            const totalTaxMasters = await prisma_client_1.default.tax_master.count();
            const activeTaxMasters = await prisma_client_1.default.tax_master.count({
                where: { is_active: 'Y' },
            });
            const inactiveTaxMasters = await prisma_client_1.default.tax_master.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newTaxMastersThisMonth = await prisma_client_1.default.tax_master.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total: totalTaxMasters,
                active: activeTaxMasters,
                inactive: inactiveTaxMasters,
                new_this_month: newTaxMastersThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.tax_master,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.success('Tax masters retrieved successfully', data.map((d) => serializeTaxMaster(d)), 200, pagination, stats);
        }
        catch (error) {
            console.error('Get Tax Masters Error:', error);
            return res.error(error.message || 'Failed to fetch tax masters', 500);
        }
    },
    async getTaxMasterById(req, res) {
        try {
            const { id } = req.params;
            const taxMaster = await prisma_client_1.default.tax_master.findUnique({
                where: { id: Number(id) },
            });
            if (!taxMaster) {
                return res.error('Tax master not found', 404);
            }
            return res.success('Tax master fetched successfully', serializeTaxMaster(taxMaster));
        }
        catch (error) {
            console.error('Get Tax Master Error:', error);
            return res.error(error.message || 'Failed to fetch tax master', 500);
        }
    },
    async updateTaxMaster(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user?.id || 1;
            const existingTaxMaster = await prisma_client_1.default.tax_master.findUnique({
                where: { id: Number(id) },
            });
            if (!existingTaxMaster) {
                return res.error('Tax master not found', 404);
            }
            if (data.code && data.code !== existingTaxMaster.code) {
                const existingCode = await prisma_client_1.default.tax_master.findFirst({
                    where: { code: data.code },
                });
                if (existingCode) {
                    return res.error('Tax code already exists', 400);
                }
            }
            const updateData = {
                updatedate: new Date(),
                updatedby: userId,
            };
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.code !== undefined)
                updateData.code = data.code;
            if (data.tax_rate !== undefined)
                updateData.tax_rate = Number(data.tax_rate);
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.is_active !== undefined)
                updateData.is_active = data.is_active;
            const taxMaster = await prisma_client_1.default.tax_master.update({
                where: { id: Number(id) },
                data: updateData,
            });
            return res.success('Tax master updated successfully', serializeTaxMaster(taxMaster));
        }
        catch (error) {
            console.error('Update Tax Master Error:', error);
            return res.error(error.message || 'Failed to update tax master', 500);
        }
    },
    async deleteTaxMaster(req, res) {
        try {
            const { id } = req.params;
            const existingTaxMaster = await prisma_client_1.default.tax_master.findUnique({
                where: { id: Number(id) },
            });
            if (!existingTaxMaster) {
                return res.error('Tax master not found', 404);
            }
            const productsUsingTax = await prisma_client_1.default.products.findFirst({
                where: { tax_id: Number(id) },
            });
            if (productsUsingTax) {
                return res.error('Cannot delete tax master. It is being used by one or more products.', 400);
            }
            await prisma_client_1.default.tax_master.delete({ where: { id: Number(id) } });
            return res.success('Tax master deleted successfully');
        }
        catch (error) {
            console.error('Delete Tax Master Error:', error);
            if (error?.code === 'P2003' ||
                error?.message?.includes('Foreign key constraint')) {
                return res.error('Cannot delete tax master. It is being used by one or more products.', 400);
            }
            return res.error(error.message || 'Failed to delete tax master', 500);
        }
    },
};
//# sourceMappingURL=taxMaster.controller.js.map