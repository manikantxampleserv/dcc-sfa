"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetWarrantyClaimsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeAssetWarrantyClaim = (claim) => ({
    id: claim.id,
    asset_id: claim.asset_id,
    claim_date: claim.claim_date,
    issue_description: claim.issue_description,
    claim_status: claim.claim_status,
    resolved_date: claim.resolved_date,
    notes: claim.notes,
    is_active: claim.is_active,
    createdate: claim.createdate,
    createdby: claim.createdby,
    updatedate: claim.updatedate,
    updatedby: claim.updatedby,
    log_inst: claim.log_inst,
    asset_master_warranty_claims: claim.asset_master_warranty_claims
        ? {
            id: claim.asset_master_warranty_claims.id,
            name: claim.asset_master_warranty_claims.name,
            serial_number: claim.asset_master_warranty_claims.serial_number,
        }
        : null,
});
exports.assetWarrantyClaimsController = {
    async createAssetWarrantyClaims(req, res) {
        try {
            const data = req.body;
            if (!data.asset_id || !data.claim_date) {
                return res
                    .status(400)
                    .json({ message: 'asset_id and claim_date are required' });
            }
            const newClaim = await prisma_client_1.default.asset_warranty_claims.create({
                data: {
                    ...data,
                    claim_date: new Date(data.claim_date),
                    resolved_date: data.resolved_date
                        ? new Date(data.resolved_date)
                        : null,
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                    log_inst: data.log_inst || 1,
                },
                include: {
                    asset_master_warranty_claims: true,
                },
            });
            res.status(201).json({
                message: 'Asset warranty claim created successfully',
                data: serializeAssetWarrantyClaim(newClaim),
            });
        }
        catch (error) {
            console.error('Create Warranty Claim Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllAssetWarrantyClaims(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const filters = {
                ...(search && {
                    OR: [
                        {
                            issue_description: {
                                contains: search,
                            },
                        },
                        {
                            claim_status: { contains: search },
                        },
                        { notes: { contains: search } },
                    ],
                }),
                ...(status === 'active' && { is_active: 'Y' }),
                ...(status === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_warranty_claims,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    asset_master_warranty_claims: true,
                },
            });
            const total = await prisma_client_1.default.asset_warranty_claims.count();
            const active = await prisma_client_1.default.asset_warranty_claims.count({
                where: { is_active: 'Y' },
            });
            const inactive = await prisma_client_1.default.asset_warranty_claims.count({
                where: { is_active: 'N' },
            });
            res.success('Asset warranty claims fetched successfully', data.map((c) => serializeAssetWarrantyClaim(c)), 200, pagination, {
                total_records: total,
                active_records: active,
                inactive_records: inactive,
            });
        }
        catch (error) {
            console.error('Get All Warranty Claims Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetWarrantyClaimsById(req, res) {
        try {
            const { id } = req.params;
            const claim = await prisma_client_1.default.asset_warranty_claims.findUnique({
                where: { id: Number(id) },
                include: {
                    asset_master_warranty_claims: true,
                },
            });
            if (!claim)
                return res.status(404).json({ message: 'Warranty claim not found' });
            res.json({
                message: 'Asset warranty claim fetched successfully',
                data: serializeAssetWarrantyClaim(claim),
            });
        }
        catch (error) {
            console.error('Get Warranty Claim Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetWarrantyClaims(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.asset_warranty_claims.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Warranty claim not found' });
            const updated = await prisma_client_1.default.asset_warranty_claims.update({
                where: { id: Number(id) },
                data: {
                    ...req.body,
                    claim_date: req.body.claim_date
                        ? new Date(req.body.claim_date)
                        : existing.claim_date,
                    resolved_date: req.body.resolved_date
                        ? new Date(req.body.resolved_date)
                        : existing.resolved_date,
                    updatedby: req.user?.id || 1,
                    updatedate: new Date(),
                },
                include: {
                    asset_master_warranty_claims: true,
                },
            });
            res.json({
                message: 'Asset warranty claim updated successfully',
                data: serializeAssetWarrantyClaim(updated),
            });
        }
        catch (error) {
            console.error('Update Warranty Claim Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetWarrantyClaims(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.asset_warranty_claims.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Warranty claim not found' });
            await prisma_client_1.default.asset_warranty_claims.delete({
                where: { id: Number(id) },
            });
            res.json({ message: 'Asset warranty claim deleted successfully' });
        }
        catch (error) {
            console.error('Delete Warranty Claim Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=assetWarrantyClaims.controller.js.map