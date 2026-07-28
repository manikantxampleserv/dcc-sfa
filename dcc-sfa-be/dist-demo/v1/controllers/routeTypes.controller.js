"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeTypesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeRouteType = (routeType) => ({
    id: routeType.id,
    name: routeType.name,
    is_active: routeType.is_active,
    createdate: routeType.createdate,
    createdby: routeType.createdby,
    updatedate: routeType.updatedate,
    updatedby: routeType.updatedby,
    log_inst: routeType.log_inst,
});
exports.routeTypesController = {
    async createRouteType(req, res) {
        try {
            const { name, is_active } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Route type name is required' });
            }
            const routeType = await prisma_client_1.default.route_type.create({
                data: {
                    name,
                    is_active: is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: 1,
                },
            });
            res.status(201).json({
                message: 'Route type created successfully',
                data: serializeRouteType(routeType),
            });
        }
        catch (error) {
            console.error('Create Route Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllRouteTypes(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    name: { contains: searchLower },
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.route_type,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const totalRouteTypes = await prisma_client_1.default.route_type.count();
            const activeRouteTypes = await prisma_client_1.default.route_type.count({
                where: { is_active: 'Y' },
            });
            const inactiveRouteTypes = await prisma_client_1.default.route_type.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const routeTypesThisMonth = await prisma_client_1.default.route_type.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Route types retrieved successfully', data.map((routeType) => serializeRouteType(routeType)), 200, pagination, {
                total_route_types: totalRouteTypes,
                active_route_types: activeRouteTypes,
                inactive_route_types: inactiveRouteTypes,
                route_types_this_month: routeTypesThisMonth,
            });
        }
        catch (error) {
            console.error('Get Route Types Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getRouteTypeById(req, res) {
        try {
            const { id } = req.params;
            const routeType = await prisma_client_1.default.route_type.findUnique({
                where: { id: Number(id) },
            });
            if (!routeType) {
                return res.status(404).json({ message: 'Route type not found' });
            }
            res.json({
                message: 'Route type fetched successfully',
                data: serializeRouteType(routeType),
            });
        }
        catch (error) {
            console.error('Get Route Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateRouteType(req, res) {
        try {
            const { id } = req.params;
            const existingRouteType = await prisma_client_1.default.route_type.findUnique({
                where: { id: Number(id) },
            });
            if (!existingRouteType) {
                return res.status(404).json({ message: 'Route type not found' });
            }
            const data = {
                ...req.body,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const routeType = await prisma_client_1.default.route_type.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Route type updated successfully',
                data: serializeRouteType(routeType),
            });
        }
        catch (error) {
            console.error('Update Route Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteRouteType(req, res) {
        try {
            const { id } = req.params;
            const existingRouteType = await prisma_client_1.default.route_type.findUnique({
                where: { id: Number(id) },
            });
            if (!existingRouteType) {
                return res.status(404).json({ message: 'Route type not found' });
            }
            await prisma_client_1.default.route_type.delete({ where: { id: Number(id) } });
            res.json({ message: 'Route type deleted successfully' });
        }
        catch (error) {
            console.error('Delete Route Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=routeTypes.controller.js.map