"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routePriceListController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeRoutePriceList = (rpl) => ({
    id: rpl.id,
    route_id: rpl.route_id,
    depot_id: rpl.depot_id,
    customer_id: rpl.customer_id,
    customer_category_id: rpl.customer_category_id,
    pricelist_id: rpl.pricelist_id,
    is_active: rpl.is_active,
    createdate: rpl.createdate,
    createdby: rpl.createdby,
    updatedate: rpl.updatedate,
    updatedby: rpl.updatedby,
    log_inst: rpl.log_inst,
    pricelist: rpl.route_pricelist
        ? { id: rpl.route_pricelist.id, name: rpl.route_pricelist.name }
        : null,
});
exports.routePriceListController = {
    async createRoutePriceList(req, res) {
        try {
            const data = req.body;
            const routePriceList = await prisma_client_1.default.route_pricelists.create({
                data: {
                    route_id: data.route_id,
                    depot_id: data.depot_id,
                    customer_id: data.customer_id,
                    customer_category_id: data.customer_category_id,
                    pricelist_id: data.pricelist_id,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
            });
            res.status(201).json({
                message: 'Price list assignment created successfully',
                data: serializeRoutePriceList(routePriceList),
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getAllRoutePriceList(req, res) {
        try {
            const { page, limit, search, status, route_id, depot_id, customer_id, customer_category_id, } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    route_pricelist: { name: { contains: searchLower } },
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
                ...(route_id && { route_id: Number(route_id) }),
                ...(depot_id && { depot_id: Number(depot_id) }),
                ...(customer_id && { customer_id: Number(customer_id) }),
                ...(customer_category_id && {
                    customer_category_id: Number(customer_category_id),
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.route_pricelists,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: { route_pricelist: true },
            });
            const total = await prisma_client_1.default.route_pricelists.count();
            const active = await prisma_client_1.default.route_pricelists.count({
                where: { is_active: 'Y' },
            });
            const inactive = await prisma_client_1.default.route_pricelists.count({
                where: { is_active: 'N' },
            });
            res.success('Route price lists retrieved successfully', data.map((r) => serializeRoutePriceList(r)), 200, pagination, {
                total_route_price_lists: total,
                active_route_price_lists: active,
                inactive_route_price_lists: inactive,
            });
        }
        catch (error) {
            console.error('Get RoutePriceLists Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getRoutePriceListById(req, res) {
        try {
            const { id } = req.params;
            const routePriceList = await prisma_client_1.default.route_pricelists.findUnique({
                where: { id: Number(id) },
            });
            if (!routePriceList)
                return res.status(404).json({ message: 'Route price list not found' });
            res.json({
                message: 'Route price list fetched successfully',
                data: serializeRoutePriceList(routePriceList),
            });
        }
        catch (error) {
            console.error('Get RoutePriceList Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateRoutePriceList(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.route_pricelists.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Route price list not found' });
            const data = req.body;
            const updated = await prisma_client_1.default.route_pricelists.update({
                where: { id: Number(id) },
                data: {
                    route_id: data.route_id ?? existing.route_id,
                    depot_id: data.depot_id ?? existing.depot_id,
                    customer_id: data.customer_id ?? existing.customer_id,
                    customer_category_id: data.customer_category_id ?? existing.customer_category_id,
                    pricelist_id: data.pricelist_id ?? existing.pricelist_id,
                    is_active: data.is_active ?? existing.is_active,
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                    log_inst: data.log_inst ?? existing.log_inst,
                },
            });
            res.json({
                message: 'Route price list updated successfully',
                data: serializeRoutePriceList(updated),
            });
        }
        catch (error) {
            console.error('Update RoutePriceList Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    // DELETE
    async deleteRoutePriceList(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.route_pricelists.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Route price list not found' });
            await prisma_client_1.default.route_pricelists.delete({ where: { id: Number(id) } });
            res.json({ message: 'Route price list deleted successfully' });
        }
        catch (error) {
            console.error('Delete RoutePriceList Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=routePriceList.controller.js.map