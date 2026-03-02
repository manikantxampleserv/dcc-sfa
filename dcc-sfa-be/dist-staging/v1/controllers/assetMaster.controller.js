"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetMasterController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const blackbaze_1 = require("../../utils/blackbaze");
const generateAssetCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastAssetCode = await prisma_client_1.default.asset_master.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastAssetCode && lastAssetCode.code) {
        const match = lastAssetCode.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}-${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeAssetMaster = (asset) => ({
    id: asset.id,
    name: asset.name,
    code: asset.code,
    asset_type_id: asset.asset_type_id,
    asset_sub_type_id: asset.asset_sub_type_id,
    serial_number: asset.serial_number,
    purchase_date: asset.purchase_date ? new Date(asset.purchase_date) : null,
    warranty_expiry: asset.warranty_expiry
        ? new Date(asset.warranty_expiry)
        : null,
    current_location: asset.current_location,
    current_status: asset.current_status,
    assigned_to: asset.assigned_to,
    is_active: asset.is_active,
    createdate: asset.createdate,
    createdby: asset.createdby,
    updatedate: asset.updatedate,
    updatedby: asset.updatedby,
    log_inst: asset.log_inst,
    asset_master_image: asset.asset_master_image || [],
    asset_maintenance_master: asset.asset_maintenance_master || [],
    asset_movement_assets_asset: asset.asset_movement_assets_asset || [],
    asset_master_warranty_claims: asset.asset_master_warranty_claims || [],
    asset_master_asset_types: asset.asset_master_asset_types || null,
    asset_master_asset_sub_types: asset.asset_master_asset_sub_types || null,
});
exports.assetMasterController = {
    async createAssetMaster(req, res) {
        try {
            const { name, code, asset_type_id, asset_sub_type_id, serial_number, purchase_date, warranty_expiry, current_location, current_status, assigned_to, is_active, } = req.body;
            let assetImages = [];
            if (req.body.assetImages) {
                try {
                    assetImages = JSON.parse(req.body.assetImages);
                }
                catch {
                    assetImages = [];
                }
            }
            if (!name || !asset_type_id || !serial_number) {
                return res.status(400).json({
                    message: 'name, asset_type_id and serial_number are required',
                });
            }
            let assetCode;
            if (code && code.trim() !== '') {
                assetCode = code.trim();
                const existingAsset = await prisma_client_1.default.asset_master.findFirst({
                    where: { code: assetCode },
                });
                if (existingAsset) {
                    return res.status(400).json({ message: 'Asset code already exists' });
                }
            }
            else {
                assetCode = await generateAssetCode(name);
                let attempts = 0;
                while (attempts < 10) {
                    const existing = await prisma_client_1.default.asset_master.findFirst({
                        where: { code: assetCode },
                    });
                    if (!existing)
                        break;
                    assetCode = await generateAssetCode(name);
                    attempts++;
                }
                if (attempts >= 10) {
                    return res
                        .status(500)
                        .json({ message: 'Unable to generate unique asset code' });
                }
            }
            const duplicateAsset = await prisma_client_1.default.asset_master.findFirst({
                where: {
                    asset_type_id: Number(asset_type_id),
                },
            });
            if (duplicateAsset) {
                return res.status(409).json({
                    message: 'Asset with this asset type  already exists',
                });
            }
            const existingSerial = await prisma_client_1.default.asset_master.findFirst({
                where: {
                    serial_number: serial_number,
                },
            });
            if (existingSerial) {
                return res.status(409).json({
                    message: 'Asset with this serial number already exists',
                });
            }
            const assetData = {
                name,
                code: assetCode,
                asset_type_id: Number(asset_type_id),
                asset_sub_type_id: asset_sub_type_id ? Number(asset_sub_type_id) : null,
                serial_number,
                purchase_date: purchase_date ? new Date(purchase_date) : null,
                warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
                current_location,
                current_status,
                assigned_to: assigned_to ? String(assigned_to) : null,
                createdate: new Date(),
                createdby: req.user?.id || 1,
                is_active: is_active || 'Y',
                log_inst: 1,
            };
            const newAsset = await prisma_client_1.default.asset_master.create({
                data: assetData,
            });
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const caption = assetImages[i]?.caption || null;
                    const fileName = `asset-images/${Date.now()}-${file.originalname}`;
                    const imageUrl = await (0, blackbaze_1.uploadFile)(file.buffer, fileName, file.mimetype);
                    await prisma_client_1.default.asset_images.create({
                        data: {
                            asset_id: newAsset.id,
                            image_url: imageUrl,
                            caption,
                            uploaded_by: req.user?.name || 'System',
                            uploaded_at: new Date(),
                            is_active: 'Y',
                            createdate: new Date(),
                            createdby: req.user?.id || 1,
                            log_inst: 1,
                        },
                    });
                }
            }
            const createdAsset = await prisma_client_1.default.asset_master.findUnique({
                where: { id: newAsset.id },
                include: {
                    asset_master_image: true,
                    asset_maintenance_master: true,
                    asset_master_warranty_claims: true,
                    asset_master_asset_types: true,
                    asset_master_asset_sub_types: true,
                },
            });
            res.status(201).json({
                message: 'Asset created successfully with images',
                data: serializeAssetMaster(createdAsset),
            });
        }
        catch (error) {
            console.error('Create Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllAssetMaster(req, res) {
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
                        { serial_number: { contains: searchLower } },
                        { current_location: { contains: searchLower } },
                        { current_status: { contains: searchLower } },
                        { assigned_to: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_master,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    asset_master_image: true,
                    asset_maintenance_master: true,
                    asset_movement_assets_asset: {
                        include: {
                            asset_movement_assets_movement: {
                                select: {
                                    id: true,
                                    movement_type: true,
                                    movement_date: true,
                                    from_direction: true,
                                    to_direction: true,
                                    notes: true,
                                },
                            },
                        },
                    },
                    asset_master_warranty_claims: true,
                    asset_master_asset_types: true,
                    asset_master_asset_sub_types: true,
                },
            });
            const totalAssets = await prisma_client_1.default.asset_master.count();
            const activeAssets = await prisma_client_1.default.asset_master.count({
                where: { is_active: 'Y' },
            });
            const inactiveAssets = await prisma_client_1.default.asset_master.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const assetsThisMonth = await prisma_client_1.default.asset_master.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Assets retrieved successfully', data.map((asset) => serializeAssetMaster(asset)), 200, pagination, {
                total_assets: totalAssets,
                active_assets: activeAssets,
                inactive_assets: inactiveAssets,
                assets_this_month: assetsThisMonth,
            });
        }
        catch (error) {
            console.error('Get Assets Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetMasterById(req, res) {
        try {
            const { id } = req.params;
            const asset = await prisma_client_1.default.asset_master.findUnique({
                where: { id: Number(id) },
                include: {
                    asset_master_image: true,
                    asset_maintenance_master: true,
                    asset_master_warranty_claims: true,
                    asset_master_asset_types: true,
                    asset_master_asset_sub_types: true,
                },
            });
            if (!asset)
                return res.status(404).json({ message: 'Asset not found' });
            res.json({
                message: 'Asset fetched successfully',
                data: serializeAssetMaster(asset),
            });
        }
        catch (error) {
            console.error('Get Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetMaster(req, res) {
        try {
            const { id } = req.params;
            const existingAsset = await prisma_client_1.default.asset_master.findUnique({
                where: { id: Number(id) },
            });
            if (!existingAsset)
                return res.status(404).json({ message: 'Asset not found' });
            const data = {
                ...req.body,
                asset_sub_type_id: req.body.asset_sub_type_id
                    ? Number(req.body.asset_sub_type_id)
                    : existingAsset.asset_sub_type_id,
                assigned_to: req.body.assigned_to
                    ? String(req.body.assigned_to)
                    : existingAsset.assigned_to,
                purchase_date: req.body.purchase_date
                    ? new Date(req.body.purchase_date)
                    : existingAsset.purchase_date,
                warranty_expiry: req.body.warranty_expiry
                    ? new Date(req.body.warranty_expiry)
                    : existingAsset.warranty_expiry,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const asset = await prisma_client_1.default.asset_master.update({
                where: { id: Number(id) },
                data,
                include: {
                    asset_master_image: true,
                    asset_maintenance_master: true,
                    asset_master_warranty_claims: true,
                    asset_master_asset_types: true,
                    asset_master_asset_sub_types: true,
                },
            });
            res.json({
                message: 'Asset updated successfully',
                data: serializeAssetMaster(asset),
            });
        }
        catch (error) {
            console.error('Update Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetMaster(req, res) {
        try {
            const { id } = req.params;
            const existingAsset = await prisma_client_1.default.asset_master.findUnique({
                where: { id: Number(id) },
            });
            if (!existingAsset)
                return res.status(404).json({ message: 'Asset not found' });
            await prisma_client_1.default.asset_master.delete({ where: { id: Number(id) } });
            res.json({ message: 'Asset deleted successfully' });
        }
        catch (error) {
            console.error('Delete Asset Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=assetMaster.controller.js.map