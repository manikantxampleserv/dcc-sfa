"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetMaintenanceController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeAssetMaintenance = (m) => ({
    id: m.id,
    asset_id: m.asset_id,
    maintenance_date: m.maintenance_date,
    issue_reported: m.issue_reported,
    action_taken: m.action_taken,
    technician_id: m.technician_id,
    cost: m.cost ? Number(m.cost) : null,
    remarks: m.remarks,
    is_active: m.is_active,
    createdate: m.createdate,
    createdby: m.createdby,
    updatedate: m.updatedate,
    updatedby: m.updatedby,
    log_inst: m.log_inst,
    spares: Array.isArray(m.spares)
        ? m.spares.map((s) => ({
            id: s.id,
            name: s.name,
            cost: Number(s.cost) || 0,
        }))
        : [],
    asset_maintenance_master: m.asset_maintenance_master
        ? {
            id: m.asset_maintenance_master.id,
            name: m.asset_maintenance_master.name,
            serial_number: m.asset_maintenance_master.serial_number,
            asset_master_asset_types: m.asset_maintenance_master
                .asset_master_asset_types
                ? {
                    id: m.asset_maintenance_master.asset_master_asset_types.id,
                    name: m.asset_maintenance_master.asset_master_asset_types.name,
                }
                : null,
        }
        : null,
    asset_maintenance_technician: m.asset_maintenance_technician
        ? {
            id: m.asset_maintenance_technician.id,
            name: m.asset_maintenance_technician.name,
            email: m.asset_maintenance_technician.email,
            profile_image: m.asset_maintenance_technician.profile_image,
        }
        : null,
});
exports.assetMaintenanceController = {
    async createAssetMaintenance(req, res) {
        try {
            const { spares, ...maintenanceData } = req.body;
            if (!maintenanceData.asset_id ||
                !maintenanceData.technician_id ||
                !maintenanceData.maintenance_date) {
                return res.status(400).json({
                    message: 'asset_id, technician_id, and maintenance_date are required',
                });
            }
            const asset = await prisma_client_1.default.asset_master.findUnique({
                where: { id: maintenanceData.asset_id },
            });
            if (!asset) {
                return res.status(404).json({
                    message: 'Asset not found',
                });
            }
            const sparesToCreate = Array.isArray(spares) && spares.length > 0
                ? spares
                    .filter((s) => s && typeof s.name === 'string' && s.name.trim())
                    .map((s) => ({
                    name: s.name.trim(),
                    cost: Math.max(0, Number(s.cost) || 0),
                    createdby: req.user?.id || 1,
                }))
                : [];
            const record = await prisma_client_1.default.asset_maintenance.create({
                data: {
                    ...maintenanceData,
                    maintenance_date: new Date(maintenanceData.maintenance_date),
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                    log_inst: maintenanceData.log_inst || 1,
                    ...(sparesToCreate.length > 0
                        ? {
                            spares: {
                                create: sparesToCreate,
                            },
                        }
                        : {}),
                },
                include: {
                    asset_maintenance_master: {
                        include: {
                            asset_master_asset_types: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    asset_maintenance_technician: true,
                    spares: true,
                },
            });
            res.status(201).json({
                message: 'Asset maintenance record created successfully',
                data: serializeAssetMaintenance(record),
            });
        }
        catch (error) {
            console.error('Create Asset Maintenance Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllAssetMaintenance(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { issue_reported: { contains: searchLower } },
                        { action_taken: { contains: searchLower } },
                        { remarks: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_maintenance,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    asset_maintenance_master: {
                        include: {
                            asset_master_asset_types: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    asset_maintenance_technician: true,
                    spares: true,
                },
            });
            const totalRecords = await prisma_client_1.default.asset_maintenance.count();
            const activeRecords = await prisma_client_1.default.asset_maintenance.count({
                where: { is_active: 'Y' },
            });
            const inactiveRecords = await prisma_client_1.default.asset_maintenance.count({
                where: { is_active: 'N' },
            });
            const thisMonthRecords = await prisma_client_1.default.asset_maintenance.count({
                where: {
                    createdate: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                    },
                },
            });
            res.success('Asset maintenance records retrieved successfully', data.map((m) => serializeAssetMaintenance(m)), 200, pagination, {
                total_records: totalRecords,
                active_records: activeRecords,
                inactive_records: inactiveRecords,
                this_month_records: thisMonthRecords,
            });
        }
        catch (error) {
            console.error('Get Asset Maintenance Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetMaintenanceById(req, res) {
        try {
            const { id } = req.params;
            const record = await prisma_client_1.default.asset_maintenance.findUnique({
                where: { id: Number(id) },
                include: {
                    asset_maintenance_master: {
                        include: {
                            asset_master_asset_types: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    asset_maintenance_technician: true,
                    spares: true,
                },
            });
            if (!record)
                return res.status(404).json({ message: 'Asset maintenance not found' });
            res.json({
                message: 'Asset maintenance fetched successfully',
                data: serializeAssetMaintenance(record),
            });
        }
        catch (error) {
            console.error('Get Asset Maintenance Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetMaintenance(req, res) {
        try {
            const { id } = req.params;
            const maintenanceId = Number(id);
            const existing = await prisma_client_1.default.asset_maintenance.findUnique({
                where: { id: maintenanceId },
            });
            if (!existing)
                return res.status(404).json({ message: 'Asset maintenance not found' });
            const { spares, ...updateData } = req.body;
            const updated = await prisma_client_1.default.$transaction(async (tx) => {
                if (spares !== undefined) {
                    await tx.asset_maintenance_spares.deleteMany({
                        where: { asset_maintenance_id: maintenanceId },
                    });
                    if (Array.isArray(spares) && spares.length > 0) {
                        const sparesToCreate = spares
                            .filter((s) => s && typeof s.name === 'string' && s.name.trim())
                            .map((s) => ({
                            asset_maintenance_id: maintenanceId,
                            name: s.name.trim(),
                            cost: Math.max(0, Number(s.cost) || 0),
                            createdby: req.user?.id || 1,
                        }));
                        if (sparesToCreate.length > 0) {
                            await tx.asset_maintenance_spares.createMany({
                                data: sparesToCreate,
                            });
                        }
                    }
                }
                return tx.asset_maintenance.update({
                    where: { id: maintenanceId },
                    data: {
                        ...updateData,
                        ...(updateData.maintenance_date
                            ? { maintenance_date: new Date(updateData.maintenance_date) }
                            : {}),
                        updatedby: req.user?.id || updateData.updatedby || 1,
                        updatedate: new Date(),
                    },
                    include: {
                        asset_maintenance_master: {
                            include: {
                                asset_master_asset_types: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                        asset_maintenance_technician: true,
                        spares: true,
                    },
                });
            });
            res.json({
                message: 'Asset maintenance updated successfully',
                data: serializeAssetMaintenance(updated),
            });
        }
        catch (error) {
            console.error('Update Asset Maintenance Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetMaintenance(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.asset_maintenance.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Asset maintenance not found' });
            await prisma_client_1.default.asset_maintenance.delete({ where: { id: Number(id) } });
            res.json({ message: 'Asset maintenance deleted successfully' });
        }
        catch (error) {
            console.error('Delete Asset Maintenance Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=assetMaintenance.controller.js.map