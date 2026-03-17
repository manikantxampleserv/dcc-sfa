"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockTransferRequestsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeStockTransferRequest = (request) => ({
    id: request.id,
    request_number: request.request_number,
    source_type: request.source_type,
    source_id: request.source_id,
    destination_type: request.destination_type,
    destination_id: request.destination_id,
    requested_by: request.requested_by,
    requested_at: request.requested_at,
    status: request.status,
    approved_by: request.approved_by,
    approved_at: request.approved_at,
    is_active: request.is_active,
    createdate: request.createdate,
    createdby: request.createdby,
    updatedate: request.updatedate,
    updatedby: request.updatedby,
    log_inst: request.log_inst,
    requested_by_user: request.stock_transfer_requests_requested_by
        ? {
            id: request.stock_transfer_requests_requested_by.id,
            name: request.stock_transfer_requests_requested_by.name,
            email: request.stock_transfer_requests_requested_by.email,
        }
        : null,
    approved_by_user: request.stock_transfer_requests_approved_by
        ? {
            id: request.stock_transfer_requests_approved_by.id,
            name: request.stock_transfer_requests_approved_by.name,
            email: request.stock_transfer_requests_approved_by.email,
        }
        : null,
    transfer_lines: request.stock_transfer_lines
        ? request.stock_transfer_lines.map((line) => ({
            id: line.id,
            product_id: line.product_id,
            batch_id: line.batch_id,
            quantity: line.quantity,
        }))
        : [],
    source: request.stock_transfer_requests_source
        ? {
            id: request.stock_transfer_requests_source.id,
            name: request.stock_transfer_requests_source.name,
            type: request.stock_transfer_requests_source.type,
            location: request.stock_transfer_requests_source.location,
            is_active: request.stock_transfer_requests_source.is_active,
            createdate: request.stock_transfer_requests_source.createdate,
            createdby: request.stock_transfer_requests_source.createdby,
            updatedate: request.stock_transfer_requests_source.updatedate,
            updatedby: request.stock_transfer_requests_source.updatedby,
            log_inst: request.stock_transfer_requests_source.log_inst,
        }
        : null,
    destination: request.stock_transfer_requests_destination
        ? {
            id: request.stock_transfer_requests_destination.id,
            name: request.stock_transfer_requests_destination.name,
            type: request.stock_transfer_requests_destination.type,
            location: request.stock_transfer_requests_destination.location,
            is_active: request.stock_transfer_requests_destination.is_active,
            createdate: request.stock_transfer_requests_destination.createdate,
            createdby: request.stock_transfer_requests_destination.createdby,
            updatedate: request.stock_transfer_requests_destination.updatedate,
            updatedby: request.stock_transfer_requests_destination.updatedby,
            log_inst: request.stock_transfer_requests_destination.log_inst,
        }
        : null,
});
const generateRequestNumber = async () => {
    const prefix = 'STR';
    const last = await prisma_client_1.default.stock_transfer_requests.findFirst({
        orderBy: { id: 'desc' },
        select: { request_number: true },
    });
    let newNumber = 1;
    if (last && last.request_number) {
        const match = last.request_number.match(/(\d+)$/);
        if (match)
            newNumber = parseInt(match[1], 10) + 1;
    }
    return `${prefix}${newNumber.toString().padStart(4, '0')}`;
};
exports.stockTransferRequestsController = {
    async upsertStockTransferRequest(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.id || 1;
            const isUpdate = !!data.id;
            let requestRecord;
            if (isUpdate) {
                const existingRequest = await prisma_client_1.default.stock_transfer_requests.findUnique({
                    where: { id: data.id },
                    include: { stock_transfer_lines: true },
                });
                if (!existingRequest) {
                    return res
                        .status(404)
                        .json({ message: 'Stock transfer request not found' });
                }
                const parentUpdateData = {
                    source_type: data.source_type,
                    source_id: data.source_id,
                    destination_type: data.destination_type,
                    destination_id: data.destination_id,
                    requested_by: data.requested_by,
                    status: data.status,
                    approved_by: data.approved_by,
                    approved_at: data.approved_at,
                    is_active: data.is_active,
                    updatedate: new Date(),
                    updatedby: userId,
                };
                if (data.stock_transfer_lines &&
                    Array.isArray(data.stock_transfer_lines)) {
                    const linesToCreate = [];
                    const linesToUpdate = [];
                    const lineIdsToKeep = [];
                    for (const line of data.stock_transfer_lines) {
                        if (line.id) {
                            linesToUpdate.push({
                                where: { id: line.id },
                                data: {
                                    product_id: line.product_id,
                                    batch_id: line.batch_id || null,
                                    quantity: line.quantity,
                                    updatedate: new Date(),
                                    updatedby: userId,
                                },
                            });
                            lineIdsToKeep.push(line.id);
                        }
                        else {
                            linesToCreate.push({
                                product_id: line.product_id,
                                batch_id: line.batch_id || null,
                                quantity: line.quantity,
                                createdby: userId,
                                createdate: new Date(),
                                log_inst: data.log_inst || 1,
                            });
                        }
                    }
                    const existingLineIds = existingRequest.stock_transfer_lines.map(l => l.id);
                    const lineIdsToDelete = existingLineIds.filter(id => !lineIdsToKeep.includes(id));
                    requestRecord = await prisma_client_1.default.$transaction(async (tx) => {
                        if (lineIdsToDelete.length > 0) {
                            await tx.stock_transfer_lines.deleteMany({
                                where: {
                                    id: { in: lineIdsToDelete },
                                    stock_transfer_request_id: data.id,
                                },
                            });
                        }
                        for (const lineUpdate of linesToUpdate) {
                            await tx.stock_transfer_lines.update(lineUpdate);
                        }
                        if (linesToCreate.length > 0) {
                            await tx.stock_transfer_lines.createMany({
                                data: linesToCreate.map(line => ({
                                    ...line,
                                    stock_transfer_request_id: data.id,
                                })),
                            });
                        }
                        return await tx.stock_transfer_requests.update({
                            where: { id: data.id },
                            data: parentUpdateData,
                            include: {
                                stock_transfer_lines: true,
                                stock_transfer_requests_requested_by: true,
                                stock_transfer_requests_approved_by: true,
                                stock_transfer_requests_source: true,
                                stock_transfer_requests_destination: true,
                            },
                        });
                    });
                }
                else {
                    requestRecord = await prisma_client_1.default.stock_transfer_requests.update({
                        where: { id: data.id },
                        data: parentUpdateData,
                        include: {
                            stock_transfer_lines: true,
                            stock_transfer_requests_requested_by: true,
                            stock_transfer_requests_approved_by: true,
                            stock_transfer_requests_source: true,
                            stock_transfer_requests_destination: true,
                        },
                    });
                }
                res.json({
                    message: 'Stock Transfer Request updated successfully',
                    data: serializeStockTransferRequest(requestRecord),
                });
            }
            else {
                const newRequestNumber = await generateRequestNumber();
                const createData = {
                    request_number: newRequestNumber,
                    source_type: data.source_type,
                    source_id: data.source_id,
                    destination_type: data.destination_type,
                    destination_id: data.destination_id,
                    requested_by: data.requested_by,
                    status: data.status || 'pending',
                    approved_by: data.approved_by || null,
                    approved_at: data.approved_at || null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: userId,
                    log_inst: data.log_inst || 1,
                };
                if (data.stock_transfer_lines &&
                    Array.isArray(data.stock_transfer_lines)) {
                    createData.stock_transfer_lines = {
                        createMany: {
                            data: data.stock_transfer_lines.map(line => ({
                                product_id: line.product_id,
                                batch_id: line.batch_id || null,
                                quantity: line.quantity,
                                createdby: userId,
                                createdate: new Date(),
                                log_inst: data.log_inst || 1,
                            })),
                        },
                    };
                }
                requestRecord = await prisma_client_1.default.stock_transfer_requests.create({
                    data: createData,
                    include: {
                        stock_transfer_lines: true,
                        stock_transfer_requests_requested_by: true,
                        stock_transfer_requests_approved_by: true,
                        stock_transfer_requests_source: true,
                        stock_transfer_requests_destination: true,
                    },
                });
                res.status(201).json({
                    message: 'Stock Transfer Request created successfully',
                    data: serializeStockTransferRequest(requestRecord),
                });
            }
        }
        catch (error) {
            console.error('Upsert Stock Transfer Request Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllStockTransferRequests(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { request_number: { contains: searchLower } },
                        { source_type: { contains: searchLower } },
                        { destination_type: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.stock_transfer_requests,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    stock_transfer_lines: true,
                    stock_transfer_requests_requested_by: true,
                    stock_transfer_requests_approved_by: true,
                    stock_transfer_requests_source: true,
                    stock_transfer_requests_destination: true,
                },
            });
            const [totalRequests, activeRequests, inactiveRequests, requestsThisMonth, pendingRequests, approvedRequests, inProgressRequests,] = await Promise.all([
                prisma_client_1.default.stock_transfer_requests.count(),
                prisma_client_1.default.stock_transfer_requests.count({ where: { is_active: 'Y' } }),
                prisma_client_1.default.stock_transfer_requests.count({ where: { is_active: 'N' } }),
                prisma_client_1.default.stock_transfer_requests.count({
                    where: {
                        createdate: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                }),
                prisma_client_1.default.stock_transfer_requests.count({ where: { status: 'pending' } }),
                prisma_client_1.default.stock_transfer_requests.count({ where: { status: 'approved' } }),
                prisma_client_1.default.stock_transfer_requests.count({
                    where: { status: 'in_progress' },
                }),
            ]);
            const stats = {
                total_requests: totalRequests,
                active_requests: activeRequests,
                inactive_requests: inactiveRequests,
                requests_this_month: requestsThisMonth,
                pending_requests: pendingRequests,
                approved_requests: approvedRequests,
                in_progress_requests: inProgressRequests,
            };
            res.success('Stock Transfer Requests fetched successfully', data.map((r) => serializeStockTransferRequest(r)), 200, pagination, stats);
        }
        catch (error) {
            console.error('Get Stock Transfer Requests Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getStockTransferRequestById(req, res) {
        try {
            const { id } = req.params;
            const record = await prisma_client_1.default.stock_transfer_requests.findUnique({
                where: { id: Number(id) },
                include: {
                    stock_transfer_lines: true,
                    stock_transfer_requests_requested_by: true,
                    stock_transfer_requests_approved_by: true,
                    stock_transfer_requests_source: true,
                    stock_transfer_requests_destination: true,
                },
            });
            if (!record)
                return res
                    .status(404)
                    .json({ message: 'Stock transfer request not found' });
            res.json({
                message: 'Stock transfer request fetched successfully',
                data: serializeStockTransferRequest(record),
            });
        }
        catch (error) {
            console.error('Get Stock Transfer Request by ID Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteStockTransferRequest(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.stock_transfer_requests.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res
                    .status(404)
                    .json({ message: 'Stock transfer request not found' });
            await prisma_client_1.default.stock_transfer_requests.delete({
                where: { id: Number(id) },
            });
            res.json({ message: 'Stock Transfer Request deleted successfully' });
        }
        catch (error) {
            console.error('Delete Stock Transfer Request Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=stockTransferRequests.controller.js.map