"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerDocumentsController = void 0;
const blackbaze_1 = require("../../utils/blackbaze");
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeCustomerDocument = (doc) => ({
    id: doc.id,
    customer_id: doc.customer_id,
    document_type: doc.document_type,
    document_number: doc.document_number,
    issue_date: doc.issue_date,
    expiry_date: doc.expiry_date,
    issuing_authority: doc.issuing_authority,
    file_path: doc.file_path,
    is_verified: doc.is_verified,
    verified_by: doc.verified_by,
    verified_at: doc.verified_at,
    is_active: doc.is_active,
    createdate: doc.createdate,
    createdby: doc.createdby,
    updatedate: doc.updatedate,
    updatedby: doc.updatedby,
    log_inst: doc.log_inst,
});
exports.customerDocumentsController = {
    async createCustomerDocuments(req, res) {
        try {
            const data = req.body;
            let filePath = null;
            if (req.file) {
                const fileName = `customer-documents/${Date.now()}-${req.file.originalname}`;
                filePath = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
            }
            const doc = await prisma_client_1.default.customer_documents.create({
                data: {
                    customer_id: Number(data.customer_id),
                    document_type: data.document_type,
                    document_number: data.document_number,
                    issue_date: data.issue_date ? new Date(data.issue_date) : null,
                    expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
                    issuing_authority: data.issuing_authority,
                    file_path: filePath,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
            });
            res.status(201).json({
                message: 'Customer document created successfully',
                data: serializeCustomerDocument(doc),
            });
        }
        catch (error) {
            console.error('Create Customer Document Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllCustomerDocuments(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { document_type: { contains: searchLower } },
                        { document_number: { contains: searchLower } },
                        { issuing_authority: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.customer_documents,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
            });
            const totalCustomerDocuments = await prisma_client_1.default.customer_documents.count();
            const activeCustomerDocuments = await prisma_client_1.default.customer_documents.count({
                where: { is_active: 'Y' },
            });
            const inactiveCustomerDocuments = await prisma_client_1.default.customer_documents.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const newCustomerDocumentsThisMonth = await prisma_client_1.default.customer_documents.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Customer documents retrieved successfully', data.map((p) => serializeCustomerDocument(p)), 200, pagination, {
                total_customer_documents: totalCustomerDocuments,
                active_customer_documents: activeCustomerDocuments,
                inactive_customer_documents: inactiveCustomerDocuments,
                new_customer_documents_this_month: newCustomerDocumentsThisMonth,
            });
        }
        catch (error) {
            console.error('Get Customer Documents Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCustomerDocumentsById(req, res) {
        try {
            const { id } = req.params;
            const doc = await prisma_client_1.default.customer_documents.findUnique({
                where: { id: Number(id) },
            });
            if (!doc)
                return res.status(404).json({ message: 'Document not found' });
            res.json({
                message: 'Customer document fetched successfully',
                data: serializeCustomerDocument(doc),
            });
        }
        catch (error) {
            console.error('Get Customer Document Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCustomerDocuments(req, res) {
        try {
            const { id } = req.params;
            const existingDoc = await prisma_client_1.default.customer_documents.findUnique({
                where: { id: Number(id) },
            });
            if (!existingDoc)
                return res.status(404).json({ message: 'Document not found' });
            let filePath = existingDoc.file_path;
            if (req.file) {
                const fileName = `customer-documents/${Date.now()}-${req.file.originalname}`;
                filePath = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
                if (existingDoc.file_path)
                    await (0, blackbaze_1.deleteFile)(existingDoc.file_path);
            }
            const data = {
                ...req.body,
                customer_id: req.body.customer_id
                    ? Number(req.body.customer_id)
                    : existingDoc.customer_id,
                issue_date: req.body.issue_date
                    ? new Date(req.body.issue_date)
                    : existingDoc.issue_date,
                expiry_date: req.body.expiry_date
                    ? new Date(req.body.expiry_date)
                    : existingDoc.expiry_date,
                file_path: filePath,
                updatedate: new Date(),
                updatedby: req.user?.id,
            };
            const updatedDoc = await prisma_client_1.default.customer_documents.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Customer document updated successfully',
                data: serializeCustomerDocument(updatedDoc),
            });
        }
        catch (error) {
            console.error('Update Customer Document Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCustomerDocuments(req, res) {
        try {
            const { id } = req.params;
            const doc = await prisma_client_1.default.customer_documents.findUnique({
                where: { id: Number(id) },
            });
            if (!doc)
                return res.status(404).json({ message: 'Document not found' });
            if (doc.file_path)
                await (0, blackbaze_1.deleteFile)(doc.file_path);
            await prisma_client_1.default.customer_documents.delete({ where: { id: Number(id) } });
            res.json({ message: 'Customer document deleted successfully' });
        }
        catch (error) {
            console.error('Delete Customer Document Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=customerDocuments.controller.js.map