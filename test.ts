import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { uploadFile, deleteFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

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
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const filters: any = {
        ...(search && {
          OR: [
            { document_type: { contains: search, mode: 'insensitive' } },
            { document_number: { contains: search, mode: 'insensitive' } },
            { issuing_authority: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_documents,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        message: 'Customer documents retrieved successfully',
        data: data.map((d: any) => serializeCustomerDocument(d)),
        pagination,
      });
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
