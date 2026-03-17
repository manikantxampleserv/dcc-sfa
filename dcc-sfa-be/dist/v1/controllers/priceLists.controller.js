"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceListsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializePriceList = (pl) => ({
    id: pl.id,
    name: pl.name,
    description: pl.description,
    currency_code: pl.currency_code,
    valid_from: pl.valid_from,
    valid_to: pl.valid_to,
    is_active: pl.is_active,
    createdate: pl.createdate,
    createdby: pl.createdby,
    updatedate: pl.updatedate,
    updatedby: pl.updatedby,
    log_inst: pl.log_inst,
    pricelist_item: pl.pricelist_item || [],
    route_pricelist: pl.route_pricelist || [],
});
exports.priceListsController = {
    async upsertPriceList(req, res) {
        const data = req.body;
        const userId = req.user?.id || 1;
        try {
            let priceList;
            if (data.id) {
                priceList = await prisma_client_1.default.pricelists.update({
                    where: { id: data.id },
                    data: {
                        name: data.name,
                        description: data.description,
                        currency_code: data.currency_code || 'INR',
                        valid_from: data.valid_from ? new Date(data.valid_from) : null,
                        valid_to: data.valid_to ? new Date(data.valid_to) : null,
                        is_active: data.is_active || 'Y',
                        updatedate: new Date(),
                        updatedby: userId,
                        log_inst: { increment: 1 },
                    },
                });
            }
            else {
                priceList = await prisma_client_1.default.pricelists.create({
                    data: {
                        name: data.name,
                        description: data.description,
                        currency_code: data.currency_code || 'INR',
                        valid_from: data.valid_from ? new Date(data.valid_from) : null,
                        valid_to: data.valid_to ? new Date(data.valid_to) : null,
                        is_active: data.is_active || 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                    },
                });
            }
            if (Array.isArray(data.pricelist_item)) {
                const existingItems = await prisma_client_1.default.pricelist_items.findMany({
                    where: { pricelist_id: priceList.id },
                });
                const requestIds = data.pricelist_item
                    .map((i) => i.id)
                    .filter(Boolean);
                await prisma_client_1.default.pricelist_items.deleteMany({
                    where: {
                        pricelist_id: priceList.id,
                        id: { notIn: requestIds.length ? requestIds : [0] },
                    },
                });
                for (const item of data.pricelist_item) {
                    const itemData = {
                        product_id: item.product_id,
                        unit_price: item.unit_price,
                        uom: item.uom,
                        discount_percent: item.discount_percent,
                        effective_from: item.effective_from
                            ? new Date(item.effective_from)
                            : null,
                        effective_to: item.effective_to
                            ? new Date(item.effective_to)
                            : null,
                        is_active: item.is_active || 'Y',
                    };
                    if (item.id && existingItems.find(e => e.id === item.id)) {
                        await prisma_client_1.default.pricelist_items.update({
                            where: { id: item.id },
                            data: {
                                ...itemData,
                                updatedate: new Date(),
                                updatedby: userId,
                                log_inst: { increment: 1 },
                            },
                        });
                    }
                    else {
                        await prisma_client_1.default.pricelist_items.create({
                            data: {
                                ...itemData,
                                pricelist_id: priceList.id,
                                createdate: new Date(),
                                createdby: userId,
                                log_inst: 1,
                            },
                        });
                    }
                }
            }
            const finalPriceList = await prisma_client_1.default.pricelists.findUnique({
                where: { id: priceList.id },
                include: {
                    pricelist_item: true,
                    route_pricelist: true,
                },
            });
            res.status(200).json({
                message: 'Price list processed successfully',
                data: serializePriceList(finalPriceList),
            });
        }
        catch (error) {
            console.error('Error processing price list:', error);
            res.status(500).json({
                message: 'Error processing price list',
                error: error.message,
            });
        }
    },
    async getAllPriceLists(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { description: { contains: searchLower } },
                        { currency_code: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.pricelists,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: { pricelist_item: true, route_pricelist: true },
            });
            const totalPriceLists = await prisma_client_1.default.pricelists.count();
            const activePriceLists = await prisma_client_1.default.pricelists.count({
                where: { is_active: 'Y' },
            });
            const inactivePriceLists = await prisma_client_1.default.pricelists.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const newPriceListsThisMonth = await prisma_client_1.default.pricelists.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Price lists retrieved successfully', data.map((p) => serializePriceList(p)), 200, pagination, {
                total_price_lists: totalPriceLists,
                active_price_lists: activePriceLists,
                inactive_price_lists: inactivePriceLists,
                new_price_lists_this_month: newPriceListsThisMonth,
            });
        }
        catch (error) {
            console.error('Get PriceLists Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getPriceListsById(req, res) {
        try {
            const { id } = req.params;
            const priceList = await prisma_client_1.default.pricelists.findUnique({
                where: { id: Number(id) },
                include: { pricelist_item: true, route_pricelist: true },
            });
            if (!priceList)
                return res.status(404).json({ message: 'Price list not found' });
            res.json({
                message: 'Price list fetched successfully',
                data: serializePriceList(priceList),
            });
        }
        catch (error) {
            console.error('Get PriceList Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deletePriceLists(req, res) {
        try {
            const { id } = req.params;
            const existingPriceList = await prisma_client_1.default.pricelists.findUnique({
                where: { id: Number(id) },
            });
            if (!existingPriceList)
                return res.status(404).json({ message: 'Price list not found' });
            await prisma_client_1.default.pricelists.delete({ where: { id: Number(id) } });
            res.json({ message: 'Price list deleted successfully' });
        }
        catch (error) {
            console.error('Delete PriceList Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=priceLists.controller.js.map