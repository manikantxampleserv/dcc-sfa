"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerChannelsController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
const serializeCustomerChannel = (c) => ({
    id: c.id,
    channel_name: c.channel_name,
    channel_code: c.channel_code,
    is_active: c.is_active,
    createdate: c.createdate,
    createdby: c.createdby,
    updatedate: c.updatedate,
    updatedby: c.updatedby,
    log_inst: c.log_inst,
});
const generateCustomerChannelCode = async (channel_name) => {
    const prefix = channel_name.slice(0, 3).toUpperCase();
    const lastRecord = await prisma_client_1.default.customer_channel.findFirst({
        orderBy: { id: 'desc' },
        select: { channel_code: true },
    });
    let newNum = 1;
    if (lastRecord?.channel_code) {
        const match = lastRecord.channel_code.match(/(\d+)$/);
        if (match)
            newNum = Number(match[1]) + 1;
    }
    return `${prefix}${String(newNum).padStart(3, '0')}`;
};
exports.customerChannelsController = {
    async createCustomerChannels(req, res) {
        try {
            const data = req.body;
            if (!data.channel_name) {
                return res.error('channel_name is required', 400);
            }
            const code = await generateCustomerChannelCode(data.channel_name);
            const record = await prisma_client_1.default.customer_channel.create({
                data: {
                    ...data,
                    channel_code: code,
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                    log_inst: data.log_inst || 1,
                },
            });
            return res.success('Customer Channel created successfully', serializeCustomerChannel(record), 201);
        }
        catch (error) {
            console.error('Create Customer Channel Error:', error);
            return res.error(error.message || 'Failed to create customer channel', 500);
        }
    },
    async getAllCustomerChannels(req, res) {
        try {
            const { page, limit, search, is_active } = req.query;
            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;
            const searchLower = search ? String(search).toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { channel_name: { contains: searchLower } },
                        { channel_code: { contains: searchLower } },
                    ],
                }),
                ...(is_active && { is_active: is_active }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.customer_channel,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const total = await prisma_client_1.default.customer_channel.count();
            const active = await prisma_client_1.default.customer_channel.count({
                where: { is_active: 'Y' },
            });
            const inactive = await prisma_client_1.default.customer_channel.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newThisMonth = await prisma_client_1.default.customer_channel.count({
                where: {
                    createdate: {
                        gte: start,
                        lt: end,
                    },
                },
            });
            res.success('Customer channels retrieved successfully', data.map((c) => serializeCustomerChannel(c)), 200, pagination, {
                total,
                active,
                inactive,
                new_this_month: newThisMonth,
            });
        }
        catch (error) {
            console.error('Get Customer Channels Error:', error);
            return res.error(error.message || 'Failed to fetch customer channels', 500);
        }
    },
    async getCustomerChannelsById(req, res) {
        try {
            const { id } = req.params;
            const record = await prisma_client_1.default.customer_channel.findUnique({
                where: { id: Number(id) },
                include: { customer_channel_customer: true },
            });
            if (!record) {
                return res.error('Customer Channel not found', 404);
            }
            return res.success('Customer Channel fetched successfully', serializeCustomerChannel(record));
        }
        catch (error) {
            console.error('Get Customer Channel Error:', error);
            return res.error(error.message || 'Failed to fetch customer channel', 500);
        }
    },
    async updateCustomerChannels(req, res) {
        try {
            const { id } = req.params;
            const exists = await prisma_client_1.default.customer_channel.findUnique({
                where: { id: Number(id) },
            });
            if (!exists) {
                return res.error('Customer Channel not found', 404);
            }
            const updated = await prisma_client_1.default.customer_channel.update({
                where: { id: Number(id) },
                data: {
                    ...req.body,
                    updatedby: req.user?.id,
                    updatedate: new Date(),
                },
                include: { customer_channel_customer: true },
            });
            return res.success('Customer Channel updated successfully', serializeCustomerChannel(updated));
        }
        catch (error) {
            console.error('Update Customer Channel Error:', error);
            return res.error(error.message || 'Failed to update customer channel', 500);
        }
    },
    async deleteCustomerChannels(req, res) {
        try {
            const { id } = req.params;
            const exists = await prisma_client_1.default.customer_channel.findUnique({
                where: { id: Number(id) },
            });
            if (!exists) {
                return res.error('Customer Channel not found', 404);
            }
            await prisma_client_1.default.customer_channel.delete({
                where: { id: Number(id) },
            });
            return res.success('Customer Channel deleted successfully');
        }
        catch (error) {
            console.error('Delete Customer Channel Error:', error);
            return res.error(error.message || 'Failed to delete customer channel', 500);
        }
    },
};
//# sourceMappingURL=customerChannels.controller.js.map