"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zonesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateZoneCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastZone = await prisma_client_1.default.zones.findFirst({
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
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
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
    routes_zones: zone.routes_zones
        ? zone.routes_zones.map((r) => ({ id: r.id, name: r.name }))
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
            const newCode = await generateZoneCode(data.name);
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
                    routes_zones: true,
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
            const { page, limit, search } = req.query;
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
                    routes_zones: true,
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
                    routes_zones: true,
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
                    routes_zones: true,
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
            const existingZone = await prisma_client_1.default.zones.findUnique({
                where: { id: Number(id) },
            });
            if (!existingZone) {
                return res.status(404).json({ message: 'Zone not found' });
            }
            await prisma_client_1.default.zones.delete({ where: { id: Number(id) } });
            res.json({ message: 'Zone deleted successfully' });
        }
        catch (error) {
            console.error('Delete Zone Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=zones.controller.js.map