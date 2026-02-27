"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetMovementsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const helpers_1 = require("../../helpers");
const requests_controller_1 = require("./requests.controller");
const contractGeneration_service_1 = require("../../services/contractGeneration.service");
const serializeAssetMovement = (movement) => {
    return {
        id: movement.id,
        asset_ids: movement.asset_movement_assets?.map((aa) => aa.asset_id) || [],
        from_direction: movement.from_direction,
        from_depot_id: movement.from_depot_id,
        from_customer_id: movement.from_customer_id,
        to_direction: movement.to_direction,
        to_depot_id: movement.to_depot_id,
        to_customer_id: movement.to_customer_id,
        movement_type: movement.movement_type,
        movement_date: movement.movement_date,
        performed_by: movement.performed_by,
        notes: movement.notes,
        status: movement.status,
        approval_status: movement.approval_status,
        approved_by: movement.approved_by,
        approved_at: movement.approved_at,
        is_active: movement.is_active,
        createdate: movement.createdate,
        createdby: movement.createdby,
        updatedate: movement.updatedate,
        updatedby: movement.updatedby,
        log_inst: movement.log_inst,
        asset_movement_assets: movement.asset_movement_assets?.map((aa) => ({
            id: aa.id,
            asset_id: aa.asset_id,
            asset_master: aa.asset_movement_assets_asset
                ? {
                    id: aa.asset_movement_assets_asset.id,
                    name: aa.asset_movement_assets_asset.name,
                    serial_number: aa.asset_movement_assets_asset.serial_number,
                    asset_master_asset_types: aa.asset_movement_assets_asset
                        .asset_master_asset_types
                        ? {
                            id: aa.asset_movement_assets_asset.asset_master_asset_types
                                .id,
                            name: aa.asset_movement_assets_asset
                                .asset_master_asset_types.name,
                        }
                        : null,
                }
                : null,
        })) || [],
        asset_movement_from_depot: movement.asset_movement_from_depot
            ? {
                id: movement.asset_movement_from_depot.id,
                name: movement.asset_movement_from_depot.name,
            }
            : null,
        asset_movement_from_customer: movement.asset_movement_from_customer
            ? {
                id: movement.asset_movement_from_customer.id,
                name: movement.asset_movement_from_customer.name,
            }
            : null,
        asset_movement_to_depot: movement.asset_movement_to_depot
            ? {
                id: movement.asset_movement_to_depot.id,
                name: movement.asset_movement_to_depot.name,
            }
            : null,
        asset_movement_to_customer: movement.asset_movement_to_customer
            ? {
                id: movement.asset_movement_to_customer.id,
                name: movement.asset_movement_to_customer.name,
            }
            : null,
        asset_movements_performed_by: movement.asset_movements_performed_by
            ? {
                id: movement.asset_movements_performed_by.id,
                name: movement.asset_movements_performed_by.name,
                email: movement.asset_movements_performed_by.email,
            }
            : null,
    };
};
exports.assetMovementsController = {
    async createAssetMovements(req, res) {
        try {
            const data = req.body;
            const assetIds = Array.isArray(data.asset_ids)
                ? data.asset_ids
                : [data.asset_id];
            if (!assetIds.length || !data.performed_by || !data.movement_type) {
                return res.status(400).json({
                    message: 'asset_ids (array or single), performed_by, and movement_type are required',
                });
            }
            const currentAssets = await prisma_client_1.default.asset_master.findMany({
                where: { id: { in: assetIds } },
            });
            if (currentAssets.length !== assetIds.length) {
                return res.status(404).json({
                    message: 'One or more assets not found',
                    missing_assets: assetIds.filter((id) => !currentAssets.find((asset) => asset.id === id)),
                });
            }
            let assetStatusUpdate = '';
            let fromDepotId = null;
            let toDepotId = null;
            let fromCustomerId = null;
            let toCustomerId = null;
            let fromDirection = '';
            let toDirection = '';
            if (data.from_direction === 'depot' && data.from_depot_id) {
                fromDirection = 'depot';
                fromDepotId = data.from_depot_id;
            }
            else if (data.from_direction === 'outlet' && data.from_customer_id) {
                fromDirection = 'outlet';
                fromCustomerId = data.from_customer_id;
            }
            if (data.to_direction === 'depot' && data.to_depot_id) {
                toDirection = 'depot';
                toDepotId = data.to_depot_id;
            }
            else if (data.to_direction === 'outlet' && data.to_customer_id) {
                toDirection = 'outlet';
                toCustomerId = data.to_customer_id;
            }
            if (fromDepotId) {
                const fromDepot = await prisma_client_1.default.depots.findUnique({
                    where: { id: fromDepotId },
                });
                if (!fromDepot) {
                    return res.status(400).json({ message: 'From depot not found' });
                }
            }
            if (toDepotId) {
                const toDepot = await prisma_client_1.default.depots.findUnique({
                    where: { id: toDepotId },
                });
                if (!toDepot) {
                    return res.status(400).json({ message: 'To depot not found' });
                }
            }
            if (fromCustomerId) {
                const fromCustomer = await prisma_client_1.default.customers.findUnique({
                    where: { id: fromCustomerId },
                });
                if (!fromCustomer) {
                    return res.status(400).json({ message: 'From customer not found' });
                }
            }
            if (toCustomerId) {
                const toCustomer = await prisma_client_1.default.customers.findUnique({
                    where: { id: toCustomerId },
                });
                if (!toCustomer) {
                    return res.status(400).json({ message: 'To customer not found' });
                }
            }
            switch (data.movement_type.toLowerCase()) {
                case 'transfer':
                    assetStatusUpdate = 'Available';
                    break;
                case 'maintenance':
                case 'repair':
                    assetStatusUpdate = 'Under Maintenance';
                    console.log(`Maintenance records will be created after approval for maintenance/repair movement`);
                    break;
                case 'installation':
                    assetStatusUpdate = 'Installed';
                    break;
                case 'disposal':
                    assetStatusUpdate = 'Retired';
                    break;
                case 'return':
                    assetStatusUpdate = 'Available';
                    break;
                default:
                    return res.status(400).json({
                        message: 'Invalid movement_type. Must be one of: transfer, maintenance, repair, disposal, return, installation',
                    });
            }
            const assetMovement = await prisma_client_1.default.$transaction(async (tx) => {
                const assetMovement = await tx.asset_movements.create({
                    data: {
                        from_direction: data.from_direction,
                        to_direction: data.to_direction,
                        from_depot_id: fromDepotId,
                        from_customer_id: fromCustomerId,
                        to_depot_id: toDepotId,
                        to_customer_id: toCustomerId,
                        movement_type: data.movement_type,
                        movement_date: new Date(data.movement_date),
                        performed_by: data.performed_by,
                        notes: data.notes,
                        status: 'P',
                        is_active: data.is_active || 'Y',
                        createdby: req.user?.id || 1,
                        createdate: new Date(),
                        log_inst: data.log_inst || 1,
                        asset_movement_assets: {
                            create: assetIds.map((assetId) => ({
                                asset_id: assetId,
                                createdby: req.user?.id || 1,
                                createdate: new Date(),
                                log_inst: 1,
                            })),
                        },
                    },
                    include: {
                        asset_movement_assets: {
                            include: {
                                asset_movement_assets_asset: {
                                    include: {
                                        asset_master_asset_types: {
                                            select: { id: true, name: true },
                                        },
                                    },
                                },
                            },
                        },
                        asset_movements_performed_by: true,
                        asset_movement_from_depot: {
                            select: { id: true, name: true },
                        },
                        asset_movement_from_customer: {
                            select: { id: true, name: true },
                        },
                        asset_movement_to_depot: {
                            select: { id: true, name: true },
                        },
                        asset_movement_to_customer: {
                            select: { id: true, name: true },
                        },
                    },
                });
                return assetMovement;
            });
            setTimeout(async () => {
                try {
                    await (0, helpers_1.createAssetMovementApprovalWorkflow)(assetMovement.id, `AMV-${assetMovement.id.toString().padStart(5, '0')}`, data.performed_by, data.priority || 'medium', {
                        asset_ids: assetIds,
                        from_direction: data.from_direction,
                        to_direction: data.to_direction,
                        from_depot_id: fromDepotId,
                        from_customer_id: fromCustomerId,
                        to_depot_id: toDepotId,
                        to_customer_id: toCustomerId,
                        movement_type: data.movement_type,
                        movement_date: data.movement_date,
                        notes: data.notes,
                    }, req.user?.id || 1);
                    console.log(`Approval workflow created for asset movement: AMV-${assetMovement.id.toString().padStart(5, '0')}`);
                }
                catch (workflowError) {
                    console.error('Error creating approval workflow:', workflowError);
                }
                try {
                    await (0, requests_controller_1.createRequest)({
                        requester_id: data.performed_by,
                        request_type: 'ASSET_MOVEMENT_APPROVAL',
                        reference_id: assetMovement.id,
                        createdby: req.user?.id || 1,
                        log_inst: 1,
                    });
                    console.log(`Legacy approval request created for asset movement: ${assetMovement.id}`);
                }
                catch (requestError) {
                    console.error('Error creating legacy approval request:', requestError);
                }
            }, 500);
            res.status(201).json({
                message: 'Asset movement created successfully',
                data: serializeAssetMovement(assetMovement),
            });
        }
        catch (error) {
            console.error('Create Asset Movement Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllAssetMovements(req, res) {
        try {
            const { page, limit, search, status, asset_type_id, performed_by } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        {
                            asset_movement_assets: {
                                some: {
                                    asset_movement_assets_asset: {
                                        OR: [
                                            { serial_number: { contains: searchLower } },
                                            { current_location: { contains: searchLower } },
                                            { current_status: { contains: searchLower } },
                                            { assigned_to: { contains: searchLower } },
                                            {
                                                asset_master_asset_types: {
                                                    name: { contains: searchLower },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                        { from_direction: { contains: searchLower } },
                        { to_direction: { contains: searchLower } },
                        { movement_type: { contains: searchLower } },
                        { notes: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
                ...(performed_by && { performed_by: Number(performed_by) }),
                ...(asset_type_id && {
                    asset_movement_assets: {
                        some: {
                            asset_movement_assets_asset: {
                                asset_type_id: Number(asset_type_id),
                            },
                        },
                    },
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.asset_movements,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    asset_movement_assets: {
                        include: {
                            asset_movement_assets_asset: {
                                include: {
                                    asset_master_asset_types: {
                                        select: { id: true, name: true },
                                    },
                                },
                            },
                        },
                    },
                    asset_movements_performed_by: true,
                    asset_movement_from_depot: {
                        select: { id: true, name: true },
                    },
                    asset_movement_from_customer: {
                        select: { id: true, name: true },
                    },
                    asset_movement_to_depot: {
                        select: { id: true, name: true },
                    },
                    asset_movement_to_customer: {
                        select: { id: true, name: true },
                    },
                },
            });
            const totalAssetMovements = await prisma_client_1.default.asset_movements.count();
            const activeAssetMovements = await prisma_client_1.default.asset_movements.count({
                where: { is_active: 'Y' },
            });
            const inactiveAssetMovements = await prisma_client_1.default.asset_movements.count({
                where: { is_active: 'N' },
            });
            const thisMonthAssetMovements = await prisma_client_1.default.asset_movements.count({
                where: {
                    createdate: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                    },
                },
            });
            res.success('Asset movements retrieved successfully', data.map((m) => serializeAssetMovement(m)), 200, pagination, {
                total_records: totalAssetMovements,
                active_records: activeAssetMovements,
                inactive_records: inactiveAssetMovements,
                this_month_records: thisMonthAssetMovements,
            });
        }
        catch (error) {
            console.error('Get Asset Movements Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAssetMovementsById(req, res) {
        try {
            const { id } = req.params;
            const movement = await prisma_client_1.default.asset_movements.findUnique({
                where: { id: Number(id) },
                include: {
                    asset_movement_assets: {
                        include: {
                            asset_movement_assets_asset: {
                                include: {
                                    asset_master_asset_types: {
                                        select: { id: true, name: true },
                                    },
                                },
                            },
                        },
                    },
                    asset_movements_performed_by: true,
                },
            });
            if (!movement) {
                return res.status(404).json({ message: 'Asset movement not found' });
            }
            res.json({
                message: 'Asset movement fetched successfully',
                data: serializeAssetMovement(movement),
            });
        }
        catch (error) {
            console.error('Get Asset Movement Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateAssetMovements(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const existing = await prisma_client_1.default.asset_movements.findUnique({
                where: { id: Number(id) },
            });
            if (!existing) {
                return res.status(404).json({ message: 'Asset movement not found' });
            }
            // Extract asset_ids from request body and filter it out from the main update
            const { asset_ids, priority, ...updateData } = data;
            // Only include fields that exist in the asset_movements schema
            const validUpdateData = {};
            const allowedFields = [
                'from_direction',
                'to_direction',
                'movement_type',
                'movement_date',
                'performed_by',
                'notes',
                'status',
                'approval_status',
                'approved_by',
                'approved_at',
                'from_depot_id',
                'from_customer_id',
                'to_depot_id',
                'to_customer_id',
                'is_active',
                'updatedby',
                'updatedate',
            ];
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    validUpdateData[field] = updateData[field];
                }
            });
            if (existing.approval_status === 'A' &&
                (updateData.asset_ids ||
                    updateData.from_direction ||
                    updateData.to_direction ||
                    updateData.movement_type ||
                    updateData.performed_by ||
                    updateData.notes)) {
                console.log(`Asset movement ${id} was approved, resetting approval status due to update`);
                validUpdateData.approval_status = 'P';
                validUpdateData.approved_by = null;
                validUpdateData.approved_at = null;
                setTimeout(async () => {
                    try {
                        console.log(`Creating approval workflow for updated asset movement: ${id}`);
                        await (0, helpers_1.createAssetMovementApprovalWorkflow)(Number(id), `AMV-${Number(id).toString().padStart(5, '0')}`, existing.performed_by, 'medium', {
                            asset_ids: updateData.asset_ids || [],
                            from_direction: updateData.from_direction || existing.from_direction,
                            to_direction: updateData.to_direction || existing.to_direction,
                            from_depot_id: updateData.from_depot_id || existing.from_depot_id,
                            from_customer_id: updateData.from_customer_id || existing.from_customer_id,
                            to_depot_id: updateData.to_depot_id || existing.to_depot_id,
                            to_customer_id: updateData.to_customer_id || existing.to_customer_id,
                            movement_type: updateData.movement_type || existing.movement_type,
                            movement_date: updateData.movement_date || existing.movement_date,
                            notes: updateData.notes || existing.notes,
                        }, req.user?.id || 1);
                        console.log(`Approval workflow created for updated asset movement: AMV-${Number(id).toString().padStart(5, '0')}`);
                    }
                    catch (workflowError) {
                        console.error('Error creating approval workflow for updated movement:', workflowError);
                    }
                    try {
                        console.log(`Creating approval request for updated asset movement: ${id}`);
                        await (0, requests_controller_1.createRequest)({
                            requester_id: existing.performed_by,
                            request_type: 'ASSET_MOVEMENT_APPROVAL',
                            reference_id: Number(id),
                            createdby: req.user?.id || 1,
                            log_inst: 1,
                        });
                        console.log(`Approval request created for updated asset movement: ${Number(id)}`);
                    }
                    catch (requestError) {
                        console.error('Error creating approval request for updated movement:', requestError);
                    }
                }, 500);
            }
            const updated = await prisma_client_1.default.$transaction(async (tx) => {
                const movementUpdate = await tx.asset_movements.update({
                    where: { id: Number(id) },
                    data: {
                        ...validUpdateData,
                        movement_date: validUpdateData.movement_date
                            ? new Date(validUpdateData.movement_date)
                            : undefined,
                        updatedby: req.user?.id || 1,
                        updatedate: new Date(),
                    },
                    include: {
                        asset_movement_assets: {
                            include: {
                                asset_movement_assets_asset: {
                                    include: {
                                        asset_master_asset_types: {
                                            select: { id: true, name: true },
                                        },
                                    },
                                },
                            },
                        },
                        asset_movements_performed_by: true,
                        asset_movement_from_depot: {
                            select: { id: true, name: true },
                        },
                        asset_movement_from_customer: {
                            select: { id: true, name: true },
                        },
                        asset_movement_to_depot: {
                            select: { id: true, name: true },
                        },
                        asset_movement_to_customer: {
                            select: { id: true, name: true },
                        },
                    },
                });
                if (asset_ids && Array.isArray(asset_ids)) {
                    await tx.asset_movement_assets.deleteMany({
                        where: { movement_id: Number(id) },
                    });
                    if (asset_ids.length > 0) {
                        await tx.asset_movement_assets.createMany({
                            data: asset_ids.map((assetId) => ({
                                movement_id: Number(id),
                                asset_id: assetId,
                                createdby: req.user?.id || 1,
                                createdate: new Date(),
                                log_inst: 1,
                            })),
                        });
                    }
                }
                return await tx.asset_movements.findUnique({
                    where: { id: Number(id) },
                    include: {
                        asset_movement_assets: {
                            include: {
                                asset_movement_assets_asset: {
                                    include: {
                                        asset_master_asset_types: {
                                            select: { id: true, name: true },
                                        },
                                    },
                                },
                            },
                        },
                        asset_movements_performed_by: true,
                        asset_movement_from_depot: {
                            select: { id: true, name: true },
                        },
                        asset_movement_from_customer: {
                            select: { id: true, name: true },
                        },
                        asset_movement_to_depot: {
                            select: { id: true, name: true },
                        },
                        asset_movement_to_customer: {
                            select: { id: true, name: true },
                        },
                    },
                });
            });
            res.json({
                message: 'Asset movement updated successfully',
                data: serializeAssetMovement(updated),
            });
        }
        catch (error) {
            console.error('Update Asset Movement Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAssetMovements(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.asset_movements.findUnique({
                where: { id: Number(id) },
            });
            if (!existing) {
                return res.status(404).json({ message: 'Asset movement not found' });
            }
            await prisma_client_1.default.asset_movements.delete({ where: { id: Number(id) } });
            res.json({ message: 'Asset movement deleted successfully' });
        }
        catch (error) {
            console.error('Delete Asset Movement Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async generateContract(req, res) {
        try {
            const { id } = req.params;
            const contractService = new contractGeneration_service_1.ContractGenerationService();
            const assetMovement = await prisma_client_1.default.asset_movements.findUnique({
                where: { id: Number(id) },
            });
            if (!assetMovement) {
                return res.status(404).json({ message: 'Asset movement not found' });
            }
            if (assetMovement.approval_status !== 'A') {
                return res.status(400).json({
                    message: 'Asset movement must be approved before generating contract',
                });
            }
            const existingContract = await contractService.getContractByAssetMovementId(Number(id));
            if (existingContract) {
                return res
                    .status(400)
                    .json({ message: 'Contract already exists for this asset movement' });
            }
            const contractRecord = await contractService.generateContractOnApproval(Number(id));
            res.status(201).json({
                message: 'Contract generated and uploaded successfully',
                data: {
                    contract_id: contractRecord.id,
                    contract_number: contractRecord.contract_number,
                    contract_url: contractRecord.contract_url,
                    contract_date: contractRecord.contract_date,
                },
            });
        }
        catch (error) {
            console.error('Generate Contract Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async downloadContract(req, res) {
        try {
            const { id } = req.params;
            const contractService = new contractGeneration_service_1.ContractGenerationService();
            const contract = await contractService.getContractByAssetMovementId(Number(id));
            if (!contract) {
                return res
                    .status(404)
                    .json({ message: 'Contract not found for this asset movement' });
            }
            res.redirect(302, contract.contract_url);
        }
        catch (error) {
            console.error('Download Contract Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getContractInfo(req, res) {
        try {
            const { id } = req.params;
            const contractService = new contractGeneration_service_1.ContractGenerationService();
            const contract = await contractService.getContractByAssetMovementId(Number(id));
            if (!contract) {
                return res
                    .status(404)
                    .json({ message: 'Contract not found for this asset movement' });
            }
            res.json({
                message: 'Contract info retrieved successfully',
                data: {
                    contract_id: contract.id,
                    contract_number: contract.contract_number,
                    contract_url: contract.contract_url,
                    contract_date: contract.contract_date,
                },
            });
        }
        catch (error) {
            console.error('Get Contract Info Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=assetMovements.controller.js.map