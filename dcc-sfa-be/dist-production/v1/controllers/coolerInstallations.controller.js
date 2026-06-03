"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coolerInstallationsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const requests_controller_1 = require("./requests.controller");
const serializeCoolerInstallation = (cooler, currentApprover = null) => {
    const { coolers_customers: customer, users: technician, cooler_asset_master: asset_master, } = cooler;
    const { asset_master_asset_types: asset_type, asset_master_asset_sub_types: asset_sub_type, asset_master_brands: brand, } = asset_master || {};
    return {
        id: cooler.id,
        customer_id: cooler.customer_id,
        code: cooler.code,
        asset_master_id: cooler.asset_master_id,
        brand: cooler.brand,
        model: cooler.model,
        serial_number: cooler.serial_number,
        capacity: cooler.capacity,
        install_date: cooler.install_date?.toISOString(),
        last_service_date: cooler.last_service_date?.toISOString(),
        next_service_due: cooler.next_service_due?.toISOString(),
        cooler_type_id: cooler.cooler_type_id,
        cooler_sub_type_id: cooler.cooler_sub_type_id,
        status: cooler.status,
        temperature: cooler.temperature ? Number(cooler.temperature) : null,
        energy_rating: cooler.energy_rating,
        warranty_expiry: cooler.warranty_expiry?.toISOString(),
        maintenance_contract: cooler.maintenance_contract,
        technician_id: cooler.technician_id,
        last_scanned_date: cooler.last_scanned_date?.toISOString(),
        is_active: cooler.is_active,
        createdate: cooler.createdate?.toISOString(),
        createdby: cooler.createdby,
        updatedate: cooler.updatedate?.toISOString(),
        updatedby: cooler.updatedby,
        approval_status: cooler.approval_status,
        current_approver: currentApprover || null,
        customer: customer
            ? { id: customer.id, name: customer.name, code: customer.code }
            : null,
        technician: technician
            ? {
                id: technician.id,
                name: technician.name,
                email: technician.email,
                profile_image: technician.profile_image,
                employee_id: technician.employee_id,
            }
            : null,
        asset_master: asset_master
            ? {
                id: asset_master.id,
                name: asset_master?.name,
                serial_number: asset_master.serial_number,
                current_status: asset_master.current_status,
                current_location: asset_master.current_location,
                asset_type: asset_type
                    ? { id: asset_type.id, name: asset_type.name }
                    : null,
                asset_sub_type: asset_sub_type
                    ? { id: asset_sub_type.id, name: asset_sub_type.name }
                    : null,
                brand: brand ? { id: brand.id, name: brand.name } : null,
            }
            : null,
    };
};
exports.coolerInstallationsController = {
    async createCoolerInstallation(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.id || 1;
            if (!data.customer_id) {
                return res.status(400).json({
                    message: 'Customer ID is required',
                });
            }
            if (!data.asset_master_id) {
                return res.status(400).json({
                    message: 'Asset Master ID is required',
                });
            }
            const assetMasterData = await prisma_client_1.default.asset_master.findUnique({
                where: {
                    id: Number(data.asset_master_id),
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    serial_number: true,
                    depot_id: true,
                    outlet_id: true,
                    current_location: true,
                    current_status: true,
                },
            });
            if (!assetMasterData) {
                return res.status(400).json({
                    message: 'Asset Master not found',
                });
            }
            const existingCooler = await prisma_client_1.default.coolers.findFirst({
                where: {
                    asset_master_id: Number(data.asset_master_id),
                    approval_status: {
                        in: ['P', 'A'],
                    },
                },
            });
            if (existingCooler) {
                return res.status(400).json({
                    message: 'This asset already has an active/pending cooler installation',
                });
            }
            const cooler = await prisma_client_1.default.coolers.create({
                data: {
                    ...data,
                    code: assetMasterData.code,
                    approval_status: 'P',
                    createdby: data.createdby ? Number(data.createdby) : userId,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                    install_date: data.install_date
                        ? new Date(data.install_date)
                        : undefined,
                    last_service_date: data.last_service_date
                        ? new Date(data.last_service_date)
                        : undefined,
                    next_service_due: data.next_service_due
                        ? new Date(data.next_service_due)
                        : undefined,
                    warranty_expiry: data.warranty_expiry
                        ? new Date(data.warranty_expiry)
                        : undefined,
                    last_scanned_date: data.last_scanned_date
                        ? new Date(data.last_scanned_date)
                        : undefined,
                },
                include: {
                    coolers_customers: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_image: true,
                        },
                    },
                    cooler_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_sub_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_asset_master: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            serial_number: true,
                            current_status: true,
                            current_location: true,
                            asset_master_asset_types: true,
                            asset_master_asset_sub_types: true,
                            asset_master_brands: true,
                        },
                    },
                },
            });
            const movement = await prisma_client_1.default.asset_movements.create({
                data: {
                    movement_type: 'installation',
                    movement_date: new Date(),
                    performed_by: userId,
                    createdby: userId,
                    createdate: new Date(),
                    log_inst: 1,
                    status: 'P',
                    approval_status: 'P',
                    from_direction: 'depot',
                    to_direction: 'outlet',
                    from_depot_id: assetMasterData.depot_id || null,
                    from_customer_id: null,
                    to_customer_id: cooler.customer_id,
                    notes: `Cooler installation for asset ${assetMasterData.code}`,
                    asset_movement_assets: {
                        create: [
                            {
                                asset_id: cooler.asset_master_id,
                                createdby: userId,
                                createdate: new Date(),
                                log_inst: 1,
                            },
                        ],
                    },
                },
                include: {
                    asset_movement_assets: true,
                },
            });
            await prisma_client_1.default.coolers.update({
                where: {
                    id: cooler.id,
                },
                data: {
                    asset_movement_id: movement.id,
                },
            });
            await (0, requests_controller_1.createRequest)({
                requester_id: userId,
                request_type: 'ASSET_MOVEMENT_APPROVAL',
                reference_id: movement.id,
                request_data: JSON.stringify({
                    movement_id: movement.id,
                    cooler_id: cooler.id,
                    asset_id: cooler.asset_master_id,
                }),
                createdby: userId,
                log_inst: 1,
            });
            console.log(`Asset movement approval request created for movement ${movement.id}`);
            return res.status(201).json({
                success: true,
                message: 'Cooler installation created and asset movement sent for approval successfully',
                data: {
                    ...serializeCoolerInstallation(cooler),
                },
            });
        }
        catch (error) {
            console.error('Create Cooler Installation Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getCoolerInstallations(req, res) {
        try {
            const { page, limit, search, isActive, status, customer_id, approval_status, technician_id, user_id, filter_status, } = req.query;
            const page_num = page ? parseInt(page, 10) : 1;
            const limit_num = limit ? parseInt(limit, 10) : 10;
            const searchLower = search ? search.toLowerCase() : '';
            const inspectorFilter = technician_id || user_id;
            const filters = {
                ...(isActive && { is_active: isActive }),
                ...(search && {
                    OR: [
                        { code: { contains: searchLower } },
                        { brand: { contains: searchLower } },
                        { model: { contains: searchLower } },
                        { serial_number: { contains: searchLower } },
                        { status: { contains: searchLower } },
                        { energy_rating: { contains: searchLower } },
                        { maintenance_contract: { contains: searchLower } },
                        { coolers_customers: { name: { contains: searchLower } } },
                        { users: { name: { contains: searchLower } } },
                    ],
                }),
                ...(status
                    ? { status: status }
                    : filter_status === 'Removed' && {
                        status: { not: 'Removed' },
                    }),
                ...(approval_status && {
                    approval_status: approval_status,
                }),
                ...(customer_id && {
                    customer_id: parseInt(customer_id),
                }),
                ...(inspectorFilter !== undefined &&
                    inspectorFilter !== null &&
                    inspectorFilter !== '' && {
                    technician_id: inspectorFilter === 'null'
                        ? null
                        : parseInt(inspectorFilter, 10),
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.coolers,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    coolers_customers: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_image: true,
                            employee_id: true,
                        },
                    },
                    cooler_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_sub_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_asset_master: {
                        select: {
                            id: true,
                            name: true,
                            serial_number: true,
                            current_status: true,
                            current_location: true,
                            asset_master_asset_types: true,
                            asset_master_asset_sub_types: true,
                            asset_master_brands: true,
                        },
                    },
                },
            });
            const statsFilter = {};
            const totalCoolers = await prisma_client_1.default.coolers.count({
                where: statsFilter,
            });
            const activeCoolers = await prisma_client_1.default.coolers.count({
                where: {
                    is_active: 'Y',
                },
            });
            const inactiveCoolers = await prisma_client_1.default.coolers.count({
                where: {
                    is_active: 'N',
                },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newCoolersThisMonth = await prisma_client_1.default.coolers.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            // Get current pending approvers for the asset movements linked to the coolers
            const movementIds = data
                .map((d) => d.asset_movement_id)
                .filter((id) => id !== null && id !== undefined);
            const approvalRequests = await prisma_client_1.default.sfa_d_requests.findMany({
                where: {
                    reference_id: { in: movementIds },
                    request_type: 'ASSET_MOVEMENT_APPROVAL',
                },
                include: {
                    sfa_d_requests_approvals_request: {
                        where: {
                            status: 'P',
                        },
                        orderBy: {
                            sequence: 'asc',
                        },
                        include: {
                            sfa_d_requests_approvals_approver: {
                                select: {
                                    name: true,
                                    email: true,
                                    employee_id: true,
                                    profile_image: true,
                                },
                            },
                        },
                    },
                },
            });
            const approverMap = new Map();
            for (const req of approvalRequests) {
                if (req.reference_id !== null &&
                    req.sfa_d_requests_approvals_request.length > 0) {
                    const firstPendingStep = req.sfa_d_requests_approvals_request[0];
                    if (firstPendingStep.sfa_d_requests_approvals_approver) {
                        const approver = firstPendingStep.sfa_d_requests_approvals_approver;
                        approverMap.set(req.reference_id, JSON.stringify({
                            name: approver.name,
                            email: approver.email || '',
                            profile_image: approver.profile_image || null,
                            employee_id: approver.employee_id || '',
                        }));
                    }
                }
            }
            const stats = {
                total_coolers: totalCoolers,
                active_coolers: activeCoolers,
                inactive_coolers: inactiveCoolers,
                new_coolers_this_month: newCoolersThisMonth,
            };
            res.json({
                success: true,
                message: 'Cooler installations retrieved successfully',
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
                data: data.map((d) => serializeCoolerInstallation(d, d.asset_movement_id ? approverMap.get(d.asset_movement_id) : null)),
            });
        }
        catch (error) {
            console.error('Get Cooler Installations Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getCoolerInstallationById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res
                    .status(400)
                    .json({ message: 'Invalid cooler installation ID' });
            }
            const cooler = await prisma_client_1.default.coolers.findUnique({
                where: { id: Number(id) },
                include: {
                    coolers_customers: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_image: true,
                        },
                    },
                    cooler_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_sub_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_asset_master: {
                        select: {
                            id: true,
                            name: true,
                            serial_number: true,
                            current_status: true,
                            current_location: true,
                            asset_master_asset_types: true,
                            asset_master_asset_sub_types: true,
                            asset_master_brands: true,
                        },
                    },
                },
            });
            if (!cooler) {
                return res
                    .status(404)
                    .json({ message: 'Cooler installation not found' });
            }
            let currentApproverName = null;
            if (cooler.asset_movement_id) {
                const request = await prisma_client_1.default.sfa_d_requests.findFirst({
                    where: {
                        reference_id: cooler.asset_movement_id,
                        request_type: 'ASSET_MOVEMENT_APPROVAL',
                    },
                    include: {
                        sfa_d_requests_approvals_request: {
                            where: {
                                status: 'P',
                            },
                            orderBy: {
                                sequence: 'asc',
                            },
                            take: 1,
                            include: {
                                sfa_d_requests_approvals_approver: {
                                    select: {
                                        name: true,
                                        email: true,
                                        profile_image: true,
                                        employee_id: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (request && request.sfa_d_requests_approvals_request.length > 0) {
                    const firstPendingStep = request.sfa_d_requests_approvals_request[0];
                    const approver = firstPendingStep.sfa_d_requests_approvals_approver;
                    currentApproverName = approver
                        ? JSON.stringify({
                            name: approver.name,
                            email: approver.email || '',
                            profile_image: approver.profile_image || null,
                            employee_id: approver.employee_id || '',
                        })
                        : null;
                }
            }
            res.json({
                message: 'Cooler installation fetched successfully',
                data: serializeCoolerInstallation(cooler, currentApproverName),
            });
        }
        catch (error) {
            console.error('Get Cooler Installation Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCoolerInstallation(req, res) {
        try {
            const { id } = req.params;
            const existingCooler = await prisma_client_1.default.coolers.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCooler) {
                return res
                    .status(404)
                    .json({ message: 'Cooler installation not found' });
            }
            const { code, ...restData } = req.body;
            const data = {
                ...restData,
                ...(code && code.trim() !== '' && { code }),
                updatedate: new Date(),
                install_date: req.body.install_date
                    ? new Date(req.body.install_date)
                    : undefined,
                last_service_date: req.body.last_service_date
                    ? new Date(req.body.last_service_date)
                    : undefined,
                next_service_due: req.body.next_service_due
                    ? new Date(req.body.next_service_due)
                    : undefined,
                warranty_expiry: req.body.warranty_expiry
                    ? new Date(req.body.warranty_expiry)
                    : undefined,
                last_scanned_date: req.body.last_scanned_date
                    ? new Date(req.body.last_scanned_date)
                    : undefined,
            };
            if (data.code && data.code !== existingCooler.code) {
                const existingCode = await prisma_client_1.default.coolers.findFirst({
                    where: {
                        code: data.code,
                        id: { not: Number(id) },
                    },
                });
                if (existingCode) {
                    return res
                        .status(400)
                        .json({ message: 'Cooler code already exists' });
                }
            }
            const cooler = await prisma_client_1.default.coolers.update({
                where: { id: Number(id) },
                data,
                include: {
                    coolers_customers: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_image: true,
                        },
                    },
                    cooler_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_sub_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_asset_master: {
                        select: {
                            id: true,
                            name: true,
                            serial_number: true,
                            current_status: true,
                            current_location: true,
                            asset_master_asset_types: true,
                            asset_master_asset_sub_types: true,
                            asset_master_brands: true,
                        },
                    },
                },
            });
            if (cooler.asset_master_id && data.status === 'Installed') {
                try {
                    const customer = cooler.coolers_customers;
                    const toLocation = customer
                        ? `${customer.name} (${customer.code})`
                        : 'Customer Location';
                    await prisma_client_1.default.asset_master.update({
                        where: { id: cooler.asset_master_id },
                        data: {
                            current_status: 'Installed',
                            current_location: toLocation,
                            updatedate: new Date(),
                            updatedby: req.body.updatedby ? Number(req.body.updatedby) : 1,
                        },
                    });
                }
                catch (assetUpdateError) {
                    console.error('Error syncing asset master status:', assetUpdateError);
                }
            }
            res.json({
                message: 'Cooler installation updated successfully',
                data: serializeCoolerInstallation(cooler),
            });
        }
        catch (error) {
            console.error('Update Cooler Installation Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCoolerInstallation(req, res) {
        try {
            const { id } = req.params;
            const existingCooler = await prisma_client_1.default.coolers.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCooler) {
                return res
                    .status(404)
                    .json({ message: 'Cooler installation not found' });
            }
            const relatedInspections = await prisma_client_1.default.cooler_inspections.count({
                where: { cooler_id: Number(id) },
            });
            if (relatedInspections > 0) {
                return res.status(400).json({
                    message: `Cannot delete cooler installation. It has ${relatedInspections} related inspection(s). Please delete the inspections first or contact support.`,
                });
            }
            await prisma_client_1.default.coolers.delete({ where: { id: Number(id) } });
            res.json({ message: 'Cooler installation deleted successfully' });
        }
        catch (error) {
            console.error('Delete Cooler Installation Error:', error);
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete cooler installation. It has related records that must be deleted first.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    async updateCoolerStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, value } = req.body;
            if (!id || isNaN(Number(id))) {
                return res
                    .status(400)
                    .json({ message: 'Invalid cooler installation ID' });
            }
            if (!status || !value) {
                return res
                    .status(400)
                    .json({ message: 'Status field and value are required' });
            }
            const allowedStatuses = ['status', 'is_active'];
            const allowedOperationalStatuses = [
                'working',
                'maintenance',
                'broken',
                'offline',
            ];
            const allowedActiveValues = ['Y', 'N'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid status field. Allowed values: status, is_active',
                });
            }
            if (status === 'status' && !allowedOperationalStatuses.includes(value)) {
                return res.status(400).json({
                    message: 'Invalid operational status. Must be one of: working, maintenance, broken, offline',
                });
            }
            if (status === 'is_active' && !allowedActiveValues.includes(value)) {
                return res.status(400).json({
                    message: 'Invalid active status. Must be one of: Y, N',
                });
            }
            const existingCooler = await prisma_client_1.default.coolers.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCooler) {
                return res
                    .status(404)
                    .json({ message: 'Cooler installation not found' });
            }
            const updatedCooler = await prisma_client_1.default.coolers.update({
                where: { id: Number(id) },
                data: {
                    [status]: value,
                    updatedate: new Date(),
                    updatedby: req.user?.id,
                },
                include: {
                    coolers_customers: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_image: true,
                        },
                    },
                    cooler_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_sub_types: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    cooler_asset_master: {
                        select: {
                            id: true,
                            serial_number: true,
                            current_status: true,
                            current_location: true,
                            asset_master_asset_types: true,
                            asset_master_asset_sub_types: true,
                            asset_master_brands: true,
                        },
                    },
                },
            });
            const readableStatusMap = {
                status: 'operational status',
                is_active: 'Is Active',
            };
            const readableStatus = readableStatusMap[status] || status;
            res.json({
                message: `Cooler ${readableStatus} updated successfully`,
                data: serializeCoolerInstallation(updatedCooler),
            });
        }
        catch (error) {
            console.error('Update Cooler Status Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCoolerStatusOptions(req, res) {
        try {
            const statusOptions = [
                { value: 'working', label: 'Working', color: 'success' },
                { value: 'maintenance', label: 'Maintenance', color: 'warning' },
                { value: 'broken', label: 'Broken', color: 'error' },
                { value: 'offline', label: 'Offline', color: 'default' },
            ];
            res.json({
                success: true,
                message: 'Status options retrieved successfully',
                data: statusOptions,
            });
        }
        catch (error) {
            console.error('Get Status Options Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=coolerInstallations.controller.js.map