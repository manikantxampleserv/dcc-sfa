"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerAssetsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeCustomerAsset = (asset) => ({
    id: asset.id,
    customer_id: asset.customer_id,
    asset_type_id: asset.asset_type_id,
    brand_id: asset.brand_id,
    model: asset.model,
    serial_number: asset.serial_number,
    capacity: asset.capacity,
    install_date: asset.install_date,
    status: asset.status,
    last_scanned_date: asset.last_scanned_date,
    remarks: asset.remarks,
    technician_id: asset.technician_id,
    warranty_expiry: asset.warranty_expiry,
    maintenance_contract: asset.maintenance_contract,
    is_active: asset.is_active,
    createdate: asset.createdate,
    createdby: asset.createdby,
    updatedate: asset.updatedate,
    updatedby: asset.updatedby,
    log_inst: asset.log_inst,
    customer: asset.customer_assets_customers
        ? {
            id: asset.customer_assets_customers.id,
            name: asset.customer_assets_customers.name,
        }
        : null,
    asset_type: asset.customer_asset_types
        ? {
            id: asset.customer_asset_types.id,
            name: asset.customer_asset_types.name,
        }
        : null,
    brand: asset.customer_asset_brand
        ? {
            id: asset.customer_asset_brand.id,
            name: asset.customer_asset_brand.name,
        }
        : null,
    technician: asset.customer_assets_users
        ? {
            id: asset.customer_assets_users.id,
            name: asset.customer_assets_users.name,
        }
        : null,
});
exports.customerAssetsController = {
    async createCustomerAsset(req, res) {
        try {
            const data = req.body;
            const asset = await prisma_client_1.default.customer_assets.create({
                data: {
                    customer_id: Number(data.customer_id),
                    asset_type_id: Number(data.asset_type_id),
                    brand_id: data.brand_id ? Number(data.brand_id) : null,
                    model: data.model || null,
                    serial_number: data.serial_number || null,
                    capacity: data.capacity ? Number(data.capacity) : null,
                    install_date: data.install_date ? new Date(data.install_date) : null,
                    status: data.status || 'working',
                    last_scanned_date: data.last_scanned_date
                        ? new Date(data.last_scanned_date)
                        : null,
                    remarks: data.remarks || null,
                    technician_id: data.technician_id ? Number(data.technician_id) : null,
                    warranty_expiry: data.warranty_expiry
                        ? new Date(data.warranty_expiry)
                        : null,
                    maintenance_contract: data.maintenance_contract || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    customer_assets_customers: true,
                    customer_asset_types: true,
                    customer_asset_brand: true,
                    customer_assets_users: true,
                },
            });
            res.status(201).json({
                message: 'Customer asset created successfully',
                data: serializeCustomerAsset(asset),
            });
        }
        catch (error) {
            console.error('Create Customer Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllCustomerAssets(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { code: { contains: searchLower } },
                        { model: { contains: searchLower } },
                        { serial_number: { contains: searchLower } },
                        { status: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.customer_assets,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    customer_assets_customers: true,
                    customer_asset_types: true,
                    customer_asset_brand: true,
                    customer_assets_users: true,
                },
            });
            res.success('Customer assets retrieved successfully', data.map((asset) => serializeCustomerAsset(asset)), 200, pagination);
        }
        catch (error) {
            console.error('Get All Customer Assets Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCustomerAssetById(req, res) {
        try {
            const { id } = req.params;
            const asset = await prisma_client_1.default.customer_assets.findUnique({
                where: { id: Number(id) },
                include: {
                    customer_assets_customers: true,
                    customer_asset_types: true,
                    customer_asset_brand: true,
                    customer_assets_users: true,
                },
            });
            if (!asset)
                return res.status(404).json({ message: 'Customer asset not found' });
            res.json({
                message: 'Customer asset fetched successfully',
                data: serializeCustomerAsset(asset),
            });
        }
        catch (error) {
            console.error('Get Customer Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCustomerAsset(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.customer_assets.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Customer asset not found' });
            const data = {
                ...req.body,
                install_date: req.body.install_date
                    ? new Date(req.body.install_date)
                    : null,
                last_scanned_date: req.body.last_scanned_date
                    ? new Date(req.body.last_scanned_date)
                    : null,
                warranty_expiry: req.body.warranty_expiry
                    ? new Date(req.body.warranty_expiry)
                    : null,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const asset = await prisma_client_1.default.customer_assets.update({
                where: { id: Number(id) },
                data,
                include: {
                    customer_assets_customers: true,
                    customer_asset_types: true,
                    customer_asset_brand: true,
                    customer_assets_users: true,
                },
            });
            res.json({
                message: 'Customer asset updated successfully',
                data: serializeCustomerAsset(asset),
            });
        }
        catch (error) {
            console.error('Update Customer Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCustomerAsset(req, res) {
        try {
            const { id } = req.params;
            const asset = await prisma_client_1.default.customer_assets.findUnique({
                where: { id: Number(id) },
            });
            if (!asset)
                return res.status(404).json({ message: 'Customer asset not found' });
            await prisma_client_1.default.customer_assets.delete({ where: { id: Number(id) } });
            res.json({ message: 'Customer asset deleted successfully' });
        }
        catch (error) {
            console.error('Delete Customer Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=customerAssets.controller.js.map