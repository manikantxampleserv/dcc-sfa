"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depotsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generatedDepotCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastDepots = await prisma_client_1.default.depots.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastDepots && lastDepots.code) {
        const match = lastDepots.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeDepot = (depot, includeCompany = false) => ({
    id: depot.id,
    parent_id: Number(depot.parent_id),
    name: depot.name,
    code: depot.code,
    address: depot.address,
    city: depot.city,
    state: depot.state,
    zipcode: depot.zipcode,
    phone_number: depot.phone_number,
    email: depot.email,
    manager_id: depot.manager_id,
    supervisor_id: depot.supervisor_id,
    coordinator_id: depot.coordinator_id,
    latitude: depot.latitude ? Number(depot.latitude) : null,
    longitude: depot.longitude ? Number(depot.longitude) : null,
    is_active: depot.is_active,
    created_by: depot.createdby,
    createdate: depot.createdate,
    updatedate: depot.updatedate,
    updatedby: depot.updatedby,
    depot_companies: includeCompany && depot.depot_companies
        ? {
            id: depot.depot_companies.id,
            name: depot.depot_companies.name,
            code: depot.depot_companies.code,
        }
        : null,
    user_depot: depot.user_depot
        ? depot.user_depot.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
        }))
        : [],
    depots_manager: depot.depots_manager
        ? {
            id: depot.depots_manager.id,
            name: depot.depots_manager.name,
            email: depot.depots_manager.email,
        }
        : null,
    depots_supervisior: depot.depots_supervisior
        ? {
            id: depot.depots_supervisior.id,
            name: depot.depots_supervisior.name,
            email: depot.depots_supervisior.email,
        }
        : null,
    depots_coodrinator: depot.depots_coodrinator
        ? {
            id: depot.depots_coodrinator.id,
            name: depot.depots_coodrinator.name,
            email: depot.depots_coodrinator.email,
        }
        : null,
});
exports.depotsController = {
    async createDepots(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Depot name is required' });
            }
            const newCode = await generatedDepotCode(data.name);
            const depot = await prisma_client_1.default.depots.create({
                data: {
                    ...data,
                    code: data.code || newCode,
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
                include: {
                    depot_companies: true,
                    user_depot: true,
                    depots_manager: true,
                    depots_supervisior: true,
                    depots_coodrinator: true,
                },
            });
            res.status(201).json({
                message: 'Depot created successfully',
                data: serializeDepot(depot, true),
            });
        }
        catch (error) {
            console.error('Create Depot Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getDepots(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, parent_id, depot_id, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: isActive,
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                        { email: { contains: searchLower } },
                        { city: { contains: searchLower } },
                    ],
                }),
                ...(parent_id && { parent_id: Number(parent_id) }),
                ...(depot_id && { id: Number(depot_id) }),
            };
            const totalDepots = await prisma_client_1.default.depots.count();
            const activeDepots = await prisma_client_1.default.depots.count({
                where: { is_active: 'Y' },
            });
            const inactiveDepots = await prisma_client_1.default.depots.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newDepotsThisMonth = await prisma_client_1.default.depots.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_depots: totalDepots,
                active_depots: activeDepots,
                inactive_depots: inactiveDepots,
                new_depots: newDepotsThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.depots,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    depot_companies: true,
                    user_depot: true,
                    depots_manager: true,
                    depots_supervisior: true,
                    depots_coodrinator: true,
                },
            });
            res.json({
                success: true,
                message: 'Depots retrieved successfully',
                data: data.map((d) => serializeDepot(d, true)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Depots Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getDepotsById(req, res) {
        try {
            const { id } = req.params;
            const depot = await prisma_client_1.default.depots.findUnique({
                where: { id: Number(id) },
                include: {
                    depot_companies: true,
                    user_depot: true,
                    depots_manager: true,
                    depots_supervisior: true,
                    depots_coodrinator: true,
                },
            });
            if (!depot) {
                return res.status(404).json({ message: 'Depot not found' });
            }
            res.json({
                message: 'Depot fetched successfully',
                data: serializeDepot(depot, true),
            });
        }
        catch (error) {
            console.error('Get Depot Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateDepots(req, res) {
        try {
            const { id } = req.params;
            const existingDepot = await prisma_client_1.default.depots.findUnique({
                where: { id: Number(id) },
            });
            if (!existingDepot) {
                return res.status(404).json({ message: 'Depot not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const depot = await prisma_client_1.default.depots.update({
                where: { id: Number(id) },
                data,
                include: {
                    depot_companies: true,
                    user_depot: true,
                    depots_manager: true,
                    depots_supervisior: true,
                    depots_coodrinator: true,
                },
            });
            res.json({
                message: 'Depot updated successfully',
                data: serializeDepot(depot, true),
            });
        }
        catch (error) {
            console.error('Update Depot Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteDepots(req, res) {
        try {
            const { id } = req.params;
            const existingDepot = await prisma_client_1.default.depots.findUnique({
                where: { id: Number(id) },
            });
            if (!existingDepot) {
                return res.status(404).json({ message: 'Depot not found' });
            }
            // Check for dependent zones
            const dependentZones = await prisma_client_1.default.zones.findMany({
                where: { depot_id: Number(id) },
            });
            if (dependentZones.length > 0) {
                // Option 1: Update zones to remove depot reference
                await prisma_client_1.default.zones.updateMany({
                    where: { depot_id: Number(id) },
                    data: { depot_id: null },
                });
                // Option 2: If you want to prevent deletion when zones exist, uncomment below:
                // return res.status(400).json({
                //   message: `Cannot delete depot. It is referenced by ${dependentZones.length} zone(s). Please reassign or delete the zones first.`,
                // });
            }
            await prisma_client_1.default.depots.delete({ where: { id: Number(id) } });
            res.json({
                message: 'Depot deleted successfully',
                warning: dependentZones.length > 0
                    ? `${dependentZones.length} zone(s) were updated to remove depot reference`
                    : undefined,
            });
        }
        catch (error) {
            if (error.code === 'P2003' ||
                error.message.includes('Foreign key constraint violated')) {
                return res.status(400).json({
                    message: 'Cannot delete depot. It is referenced by other records. Please update or delete those records first.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=depots.controller.js.map