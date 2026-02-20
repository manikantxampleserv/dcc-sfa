"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockTransferLinesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeStockTransferLine = (line) => ({
    id: line.id,
    stock_transfer_request_id: line.stock_transfer_request_id,
    product_id: line.product_id,
    batch_id: line.batch_id,
    quantity: line.quantity,
    is_active: line.is_active,
    createdate: line.createdate,
    createdby: line.createdby,
    updatedate: line.updatedate,
    updatedby: line.updatedby,
    log_inst: line.log_inst,
    batch: line.batch_lots
        ? {
            id: line.batch_lots.id,
            batch_number: line.batch_lots.batch_number,
            quantity: line.batch_lots.quantity,
        }
        : null,
    product: line.stock_transfer_lines_products
        ? {
            id: line.stock_transfer_lines_products.id,
            name: line.stock_transfer_lines_products.name,
            code: line.stock_transfer_lines_products.code,
        }
        : null,
    stock_transfer_request: line.stock_transfer_requests
        ? {
            id: line.stock_transfer_requests.id,
            request_number: line.stock_transfer_requests.request_number,
            source_type: line.stock_transfer_requests.source_type,
            destination_type: line.stock_transfer_requests.destination_type,
            status: line.stock_transfer_requests.status,
        }
        : null,
});
exports.stockTransferLinesController = {
    async getAllStockTransferLines(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        {
                            stock_transfer_lines_products: {
                                name: { contains: searchLower },
                            },
                        },
                        {
                            stock_transfer_requests: {
                                request_number: { contains: searchLower },
                            },
                        },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.stock_transfer_lines,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    batch_lots: true,
                    stock_transfer_lines_products: true,
                    stock_transfer_requests: true,
                },
            });
            const totalRecords = await prisma_client_1.default.stock_transfer_lines.count();
            const activeRecords = await prisma_client_1.default.stock_transfer_lines.count({
                where: { is_active: 'Y' },
            });
            const inactiveRecords = await prisma_client_1.default.stock_transfer_lines.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const stockTransferLinesByMonth = await prisma_client_1.default.stock_transfer_lines.count({
                where: {
                    createdate: {
                        gte: new Date(now.getFullYear(), now.getMonth(), 1),
                        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                    },
                },
            });
            res.success('Stock transfer lines fetched successfully', data.map((l) => serializeStockTransferLine(l)), 200, pagination, {
                total_records: totalRecords,
                active_records: activeRecords,
                inactive_records: inactiveRecords,
                stock_transfer_lines_by_month: stockTransferLinesByMonth,
            });
        }
        catch (error) {
            console.error('Get All Stock Transfer Lines Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    // GET BY ID
    async getStockTransferLineById(req, res) {
        try {
            const { id } = req.params;
            const record = await prisma_client_1.default.stock_transfer_lines.findUnique({
                where: { id: Number(id) },
                include: {
                    batch_lots: true,
                    stock_transfer_lines_products: true,
                    stock_transfer_requests: true,
                },
            });
            if (!record)
                return res
                    .status(404)
                    .json({ message: 'Stock transfer line not found' });
            res.json({
                message: 'Stock transfer line fetched successfully',
                data: serializeStockTransferLine(record),
            });
        }
        catch (error) {
            console.error('Get Stock Transfer Line By ID Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    // UPDATE
    async updateStockTransferLine(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.stock_transfer_lines.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res
                    .status(404)
                    .json({ message: 'Stock transfer line not found' });
            const updated = await prisma_client_1.default.stock_transfer_lines.update({
                where: { id: Number(id) },
                data: {
                    ...req.body,
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                },
                include: {
                    batch_lots: true,
                    stock_transfer_lines_products: true,
                    stock_transfer_requests: true,
                },
            });
            res.json({
                message: 'Stock transfer line updated successfully',
                data: serializeStockTransferLine(updated),
            });
        }
        catch (error) {
            console.error('Update Stock Transfer Line Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    // DELETE
    async deleteStockTransferLine(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.stock_transfer_lines.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res
                    .status(404)
                    .json({ message: 'Stock transfer line not found' });
            await prisma_client_1.default.stock_transfer_lines.delete({ where: { id: Number(id) } });
            res.json({ message: 'Stock transfer line deleted successfully' });
        }
        catch (error) {
            console.error('Delete Stock Transfer Line Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=stockTransferLines.controller.js.map