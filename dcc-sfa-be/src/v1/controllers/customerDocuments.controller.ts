import { Request, Response } from 'express';
import { uploadFile, deleteFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CustomerDocumentsSerialized {
  id: number;
  customer_id: number;
  document_type: string;
  document_number?: string | null;
  issue_date?: Date | null;
  expiry_date?: Date | null;
  issuing_authority?: string | null;
  file_path?: string | null;
  is_verified?: boolean | null;
  verified_by?: number | null;
  verified_at?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

const serializeCustomerDocument = (doc: any): CustomerDocumentsSerialized => ({
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

export const customerDocumentsController = {
  async createCustomerDocuments(req: any, res: any) {
    try {
      const data = req.body;

      let filePath: string | null = null;
      if (req.file) {
        const fileName = `customer-documents/${Date.now()}-${req.file.originalname}`;
        filePath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
      }

      const doc = await prisma.customer_documents.create({
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
    } catch (error: any) {
      console.error('Create Customer Document Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCustomerDocuments(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';
      const filters: any = {
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

      const { data, pagination } = await paginate({
        model: prisma.customer_documents,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });
      const totalCustomerDocuments = await prisma.customer_documents.count();
      const activeCustomerDocuments = await prisma.customer_documents.count({
        where: { is_active: 'Y' },
      });
      const inactiveCustomerDocuments = await prisma.customer_documents.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newCustomerDocumentsThisMonth =
        await prisma.customer_documents.count({
          where: {
            createdate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

      res.success(
        'Customer documents retrieved successfully',
        data.map((p: any) => serializeCustomerDocument(p)),
        200,
        pagination,
        {
          total_customer_documents: totalCustomerDocuments,
          active_customer_documents: activeCustomerDocuments,
          inactive_customer_documents: inactiveCustomerDocuments,
          new_customer_documents_this_month: newCustomerDocumentsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Customer Documents Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCustomerDocumentsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doc = await prisma.customer_documents.findUnique({
        where: { id: Number(id) },
      });

      if (!doc) return res.status(404).json({ message: 'Document not found' });

      res.json({
        message: 'Customer document fetched successfully',
        data: serializeCustomerDocument(doc),
      });
    } catch (error: any) {
      console.error('Get Customer Document Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCustomerDocuments(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingDoc = await prisma.customer_documents.findUnique({
        where: { id: Number(id) },
      });

      if (!existingDoc)
        return res.status(404).json({ message: 'Document not found' });

      let filePath: string | null = existingDoc.file_path;
      if (req.file) {
        const fileName = `customer-documents/${Date.now()}-${req.file.originalname}`;
        filePath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        if (existingDoc.file_path) await deleteFile(existingDoc.file_path);
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

      const updatedDoc = await prisma.customer_documents.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Customer document updated successfully',
        data: serializeCustomerDocument(updatedDoc),
      });
    } catch (error: any) {
      console.error('Update Customer Document Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomerDocuments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doc = await prisma.customer_documents.findUnique({
        where: { id: Number(id) },
      });

      if (!doc) return res.status(404).json({ message: 'Document not found' });

      if (doc.file_path) await deleteFile(doc.file_path);

      await prisma.customer_documents.delete({ where: { id: Number(id) } });

      res.json({ message: 'Customer document deleted successfully' });
    } catch (error: any) {
      console.error('Delete Customer Document Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
