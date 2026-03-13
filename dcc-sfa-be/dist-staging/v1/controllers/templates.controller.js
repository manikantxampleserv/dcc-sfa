"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templatesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeTemplate = (t) => ({
    id: t.id,
    name: t.name,
    key: t.key,
    channel: t.channel,
    type: t.type,
    subject: t.subject,
    body: t.body,
    createdate: t.createdate,
    createdby: t.createdby,
    updatedate: t.updatedate,
    updatedby: t.updatedby,
});
exports.templatesController = {
    async createTemplates(req, res) {
        try {
            const data = req.body;
            const template = await prisma_client_1.default.sfa_d_templates.create({
                data: {
                    name: data.name,
                    key: data.key,
                    channel: data.channel || null,
                    type: data.type || null,
                    subject: data.subject,
                    body: data.body,
                    createdate: new Date(),
                    createdby: req.user?.id,
                },
            });
            res.status(201).json({
                message: 'Template created successfully',
                data: serializeTemplate(template),
            });
        }
        catch (error) {
            console.error('Create Template Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getTemplates(req, res) {
        try {
            const { page, limit, search, channel, type } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { key: { contains: searchLower } },
                        { subject: { contains: searchLower } },
                        { body: { contains: searchLower } },
                    ],
                }),
                ...(channel && { channel: channel }),
                ...(type && { type: type }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.sfa_d_templates,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const totalTemplates = await prisma_client_1.default.sfa_d_templates.count();
            const channels = await prisma_client_1.default.sfa_d_templates.findMany({
                select: { channel: true },
                distinct: ['channel'],
                where: { channel: { not: null } },
            });
            const types = await prisma_client_1.default.sfa_d_templates.findMany({
                select: { type: true },
                distinct: ['type'],
                where: { type: { not: null } },
            });
            res.success('Templates retrieved successfully', data.map((t) => serializeTemplate(t)), 200, pagination, {
                total_templates: totalTemplates,
                channels: channels.map(c => c.channel).filter(Boolean),
                types: types.map(t => t.type).filter(Boolean),
            });
        }
        catch (error) {
            console.error('Get Templates Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getTemplatesById(req, res) {
        try {
            const { id } = req.params;
            const template = await prisma_client_1.default.sfa_d_templates.findUnique({
                where: { id: Number(id) },
            });
            if (!template)
                return res.status(404).json({ message: 'Template not found' });
            res.json({
                message: 'Template fetched successfully',
                data: serializeTemplate(template),
            });
        }
        catch (error) {
            console.error('Get Template Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateTemplates(req, res) {
        try {
            const { id } = req.params;
            const existingTemplate = await prisma_client_1.default.sfa_d_templates.findUnique({
                where: { id: Number(id) },
            });
            if (!existingTemplate)
                return res.status(404).json({ message: 'Template not found' });
            const { name, channel, type, subject, body } = req.body;
            const data = {
                ...(name && { name }),
                ...(channel !== undefined && { channel: channel || null }),
                ...(type !== undefined && { type: type || null }),
                ...(subject && { subject }),
                ...(body && { body }),
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const updatedTemplate = await prisma_client_1.default.sfa_d_templates.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Template updated successfully',
                data: serializeTemplate(updatedTemplate),
            });
        }
        catch (error) {
            console.error('Update Template Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteTemplates(req, res) {
        try {
            const { id } = req.params;
            const template = await prisma_client_1.default.sfa_d_templates.findUnique({
                where: { id: Number(id) },
            });
            if (!template)
                return res.status(404).json({ message: 'Template not found' });
            await prisma_client_1.default.sfa_d_templates.delete({ where: { id: Number(id) } });
            res.json({ message: 'Template deleted successfully' });
        }
        catch (error) {
            console.error('Delete Template Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=templates.controller.js.map