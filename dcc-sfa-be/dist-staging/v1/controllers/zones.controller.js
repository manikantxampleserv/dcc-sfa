"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zonesController = exports.generateZoneCode = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateZoneCode = async (depotId) => {
    if (!depotId) {
        throw new Error('Depot ID is required for zone code generation');
    }
    const depot = await prisma_client_1.default.depots.findUnique({
        where: { id: depotId },
        select: { name: true },
    });
    if (!depot) {
        throw new Error('Depot not found');
    }
    const depotPrefix = depot.name
        .slice(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
    const lastZone = await prisma_client_1.default.zones.findFirst({
        where: {
            depot_id: depotId,
            code: {
                startsWith: `${depotPrefix}Z`,
            },
        },
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastZone && lastZone.code) {
        const match = lastZone.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${depotPrefix}Z${newNumber.toString().padStart(2, '0')}`;
    return code;
};
exports.generateZoneCode = generateZoneCode;
const serializeZone = (zone) => ({
    id: zone.id,
    parent_id: zone.parent_id,
    depot_id: zone.depot_id,
    name: zone.name,
    code: zone.code,
    description: zone.description,
    supervisor_id: zone.supervisor_id,
    is_active: zone.is_active,
    createdby: zone.createdby,
    createdate: zone.createdate,
    updatedate: zone.updatedate,
    updatedby: zone.updatedby,
    log_inst: zone.log_inst,
    promotions: zone.promotion_zones_zones
        ? zone.promotion_zones_zones.map((pz) => ({
            id: pz.parent_id,
            name: pz.promotion_zones_promotions?.name || '',
        }))
        : [],
    route_zones: zone.route_zones
        ? zone.route_zones.map((r) => ({ id: r.id, name: r.name }))
        : undefined,
    zone_depots: zone.zone_depots
        ? {
            id: zone.zone_depots.id,
            name: zone.zone_depots.name,
            code: zone.zone_depots.code,
        }
        : null,
    supervisor: zone.zone_supervisor
        ? {
            id: zone.zone_supervisor.id,
            name: zone.zone_supervisor.name,
            email: zone.zone_supervisor.email,
        }
        : null,
});
exports.zonesController = {
    async createZone(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Zone name is required' });
            }
            let newCode;
            if (data.code) {
                newCode = data.code.trim();
                const existingCode = await prisma_client_1.default.zones.findFirst({
                    where: { code: newCode },
                });
                if (existingCode) {
                    return res.status(400).json({ message: 'Zone code already exists' });
                }
            }
            else {
                if (!data.depot_id) {
                    return res.status(400).json({
                        message: 'Either zone code or depot ID is required. Provide a zone code or depot ID for auto-generation.',
                    });
                }
                try {
                    newCode = await (0, exports.generateZoneCode)(data.depot_id);
                }
                catch (error) {
                    return res.status(400).json({ message: error.message });
                }
            }
            const existingZone = await prisma_client_1.default.zones.findFirst({
                where: {
                    name: {
                        equals: data.name.trim(),
                    },
                },
            });
            if (existingZone) {
                return res
                    .status(400)
                    .json({ message: 'Zone with this name already exists' });
            }
            if (data.depot_id && !data.parent_id) {
                data.parent_id = data.depot_id;
            }
            const zone = await prisma_client_1.default.zones.create({
                data: {
                    ...data,
                    code: newCode,
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
                include: {
                    promotion_zones_zones: {
                        include: {
                            promotion_zones_promotions: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    route_zones: true,
                    zone_depots: true,
                    zone_supervisor: true,
                },
            });
            res.status(201).json({
                message: 'Zone created successfully',
                data: serializeZone(zone),
            });
        }
        catch (error) {
            console.error('Create Zone Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getZones(req, res) {
        try {
            const { page, limit, search, isActive } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                    ],
                }),
                ...(isActive && { is_active: isActive }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.zones,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    promotion_zones_zones: {
                        include: {
                            promotion_zones_promotions: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    route_zones: true,
                    zone_depots: true,
                    zone_supervisor: true,
                },
            });
            const totalZones = await prisma_client_1.default.zones.count();
            const activeZones = await prisma_client_1.default.zones.count({
                where: { is_active: 'Y' },
            });
            const inactiveZones = await prisma_client_1.default.zones.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newZonesThisMonth = await prisma_client_1.default.zones.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Zones retrieved successfully', data.map((zone) => serializeZone(zone)), 200, pagination, {
                totalZones,
                active_zones: activeZones,
                inactive_zones: inactiveZones,
                new_zones: newZonesThisMonth,
            });
        }
        catch (error) {
            console.error('Get Zones Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getZoneById(req, res) {
        try {
            const { id } = req.params;
            const zone = await prisma_client_1.default.zones.findUnique({
                where: { id: Number(id) },
                include: {
                    promotion_zones_zones: {
                        include: {
                            promotion_zones_promotions: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    route_zones: true,
                    zone_depots: true,
                    zone_supervisor: true,
                },
            });
            if (!zone) {
                return res.status(404).json({ message: 'Zone not found' });
            }
            res.json({
                message: 'Zone fetched successfully',
                data: serializeZone(zone),
            });
        }
        catch (error) {
            console.error('Get Zone Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateZone(req, res) {
        try {
            const { id } = req.params;
            const existingZone = await prisma_client_1.default.zones.findUnique({
                where: { id: Number(id) },
            });
            if (!existingZone) {
                return res.status(404).json({ message: 'Zone not found' });
            }
            const data = {
                ...req.body,
                ...(req.body.depot_id &&
                    !req.body.parent_id && { parent_id: req.body.depot_id }),
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const zone = await prisma_client_1.default.zones.update({
                where: { id: Number(id) },
                data,
                include: {
                    promotion_zones_zones: {
                        include: {
                            promotion_zones_promotions: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    route_zones: true,
                    zone_depots: true,
                    zone_supervisor: true,
                },
            });
            res.json({
                message: 'Zone updated successfully',
                data: serializeZone(zone),
            });
        }
        catch (error) {
            console.error('Update Zone Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteZone(req, res) {
        try {
            const { id } = req.params;
            const zoneId = Number(id);
            const existingZone = await prisma_client_1.default.zones.findUnique({
                where: { id: zoneId },
            });
            if (!existingZone) {
                return res.status(404).json({ message: 'Zone not found' });
            }
            // Check for dependent records
            const dependentCustomers = await prisma_client_1.default.customers.count({
                where: { zones_id: zoneId },
            });
            const dependentUsers = await prisma_client_1.default.users.count({
                where: { zone_id: zoneId },
            });
            const dependentRoutes = await prisma_client_1.default.routes_zones.count({
                where: { zone_id: zoneId },
            });
            if (dependentCustomers > 0 || dependentUsers > 0 || dependentRoutes > 0) {
                return res.status(400).json({
                    message: 'Cannot delete zone. It is referenced by other records.',
                    details: {
                        customers: dependentCustomers,
                        users: dependentUsers,
                        routes: dependentRoutes,
                    },
                    suggestion: 'Please update or delete the dependent records first, or consider setting the zone as inactive instead.',
                });
            }
            // If no dependencies, proceed with deletion
            await prisma_client_1.default.zones.delete({ where: { id: zoneId } });
            res.json({ message: 'Zone deleted successfully' });
        }
        catch (error) {
            console.error('Delete Zone Error:', error);
            // Handle Prisma foreign key constraint error
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete zone. It is referenced by other records.',
                    suggestion: 'Please update or delete the dependent records first, or consider setting the zone as inactive instead.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    async getSupervisors(req, res) {
        try {
            const { search = '' } = req.query;
            const searchLower = search.toLowerCase().trim();
            const supervisors = await prisma_client_1.default.users.findMany({
                where: {
                    is_active: 'Y',
                    user_role: {
                        name: {
                            in: [
                                'area sales supervisor',
                                'Area Sales Supervisor',
                                'AREA SALES SUPERVISOR',
                                'areaSalesSupervisor',
                                'AreaSalesSupervisor',
                                'AreaSalesSupervisor',
                            ],
                        },
                        is_active: 'Y',
                    },
                    ...(searchLower && {
                        OR: [
                            {
                                name: {
                                    contains: searchLower,
                                },
                            },
                            {
                                email: {
                                    contains: searchLower,
                                },
                            },
                            {
                                employee_id: {
                                    contains: searchLower,
                                },
                            },
                        ],
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    employee_id: true,
                },
                orderBy: {
                    name: 'asc',
                },
                take: 50,
            });
            res.json({
                message: 'Supervisors retrieved successfully',
                data: supervisors,
            });
        }
        catch (error) {
            console.error('Get Supervisors Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=zones.controller.js.map