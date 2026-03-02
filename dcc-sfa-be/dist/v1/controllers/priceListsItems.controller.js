"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceListItemsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializePriceListItem = (item) => ({
    id: item.id,
    pricelist_id: item.pricelist_id,
    product_id: item.product_id,
    unit_price: Number(item.unit_price),
    uom: item.uom,
    discount_percent: item.discount_percent
        ? Number(item.discount_percent)
        : null,
    effective_from: item.effective_from,
    effective_to: item.effective_to,
    is_active: item.is_active,
    createdate: item.createdate,
    createdby: item.createdby,
    updatedate: item.updatedate,
    updatedby: item.updatedby,
    log_inst: item.log_inst,
    product: item.pricelist_items_products
        ? {
            id: item.pricelist_items_products.id,
            name: item.pricelist_items_products.name,
            code: item.pricelist_items_products.code,
        }
        : null,
    pricelist: item.pricelist_item
        ? {
            id: item.pricelist_item.id,
            name: item.pricelist_item.name,
        }
        : null,
});
exports.priceListItemsController = {
    async createPriceListItems(req, res) {
        try {
            const data = req.body;
            const item = await prisma_client_1.default.pricelist_items.create({
                data: {
                    pricelist_id: data.pricelist_id,
                    product_id: data.product_id,
                    unit_price: data.unit_price,
                    uom: data.uom,
                    discount_percent: data.discount_percent,
                    effective_from: data.effective_from
                        ? new Date(data.effective_from)
                        : null,
                    effective_to: data.effective_to ? new Date(data.effective_to) : null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    pricelist_item: true,
                    pricelist_items_products: true,
                },
            });
            res.status(201).json({
                message: 'Price list item created successfully',
                data: serializePriceListItem(item),
            });
        }
        catch (error) {
            console.error('Create PriceListItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllPriceListItems(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [{ uom: { contains: searchLower } }],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.pricelist_items,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: { pricelist_item: true, pricelist_items_products: true },
            });
            const totalPriceListItems = await prisma_client_1.default.pricelist_items.count();
            const activePriceListItems = await prisma_client_1.default.pricelist_items.count({
                where: { is_active: 'Y' },
            });
            const inactivePriceListItems = await prisma_client_1.default.pricelist_items.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const totalPriceListItemsThisMonth = await prisma_client_1.default.pricelist_items.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Price list items retrieved successfully', data.map((i) => serializePriceListItem(i)), 200, pagination, {
                total_price_list_items_this_month: totalPriceListItemsThisMonth,
                total_price_list_items: totalPriceListItems,
                total_active_price_list_items: activePriceListItems,
                total_inactive_price_list_items: inactivePriceListItems,
            });
        }
        catch (error) {
            console.error('Get PriceListItems Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getPriceListItemsById(req, res) {
        try {
            const { id } = req.params;
            const item = await prisma_client_1.default.pricelist_items.findUnique({
                where: { id: Number(id) },
                include: { pricelist_item: true, pricelist_items_products: true },
            });
            if (!item)
                return res.status(404).json({ message: 'Price list item not found' });
            res.json({
                message: 'Price list item fetched successfully',
                data: serializePriceListItem(item),
            });
        }
        catch (error) {
            console.error('Get PriceListItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updatePriceListItems(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.pricelist_items.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Price list item not found' });
            const data = req.body;
            const updated = await prisma_client_1.default.pricelist_items.update({
                where: { id: Number(id) },
                data: {
                    pricelist_id: data.pricelist_id ?? existing.pricelist_id,
                    product_id: data.product_id ?? existing.product_id,
                    unit_price: data.unit_price ?? existing.unit_price,
                    uom: data.uom ?? existing.uom,
                    discount_percent: data.discount_percent ?? existing.discount_percent,
                    effective_from: data.effective_from
                        ? new Date(data.effective_from)
                        : existing.effective_from,
                    effective_to: data.effective_to
                        ? new Date(data.effective_to)
                        : existing.effective_to,
                    is_active: data.is_active ?? existing.is_active,
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                    log_inst: data.log_inst ?? existing.log_inst,
                },
                include: { pricelist_item: true, pricelist_items_products: true },
            });
            res.json({
                message: 'Price list item updated successfully',
                data: serializePriceListItem(updated),
            });
        }
        catch (error) {
            console.error('Update PriceListItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deletePriceListItems(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.pricelist_items.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Price list item not found' });
            await prisma_client_1.default.pricelist_items.delete({ where: { id: Number(id) } });
            res.json({ message: 'Price list item deleted successfully' });
        }
        catch (error) {
            console.error('Delete PriceListItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=priceListsItems.controller.js.map