import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface TemplateSerialized {
  id: number;
  name: string;
  key: string;
  channel?: string | null;
  type?: string | null;
  subject: string;
  body: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeTemplate = (t: any): TemplateSerialized => ({
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

export const templatesController = {
  async createTemplates(req: any, res: any) {
    try {
      const data = req.body;

      const template = await prisma.sfa_d_templates.create({
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
    } catch (error: any) {
      console.error('Create Template Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getTemplates(req: any, res: any) {
    try {
      const { page, limit, search, channel, type } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
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

      const totalTemplates = await prisma.sfa_d_templates.count();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newTemplatesThisMonth = await prisma.sfa_d_templates.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const channels = await prisma.sfa_d_templates.findMany({
        select: { channel: true },
        distinct: ['channel'],
        where: { channel: { not: null } },
      });
      const types = await prisma.sfa_d_templates.findMany({
        select: { type: true },
        distinct: ['type'],
        where: { type: { not: null } },
      });

      const stats = {
        total_templates: totalTemplates,
        new_templates_this_month: newTemplatesThisMonth,
        total_channels: channels.map(c => c.channel).filter(Boolean).length,
        total_types: types.map(t => t.type).filter(Boolean).length,
        channels: channels.map(c => c.channel).filter(Boolean),
        types: types.map(t => t.type).filter(Boolean),
      };

      const { data, pagination } = await paginate({
        model: prisma.sfa_d_templates,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Templates retrieved successfully',
        data: data.map((t: any) => serializeTemplate(t)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Templates Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getTemplatesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await prisma.sfa_d_templates.findUnique({
        where: { id: Number(id) },
      });

      if (!template)
        return res.status(404).json({ message: 'Template not found' });

      res.json({
        message: 'Template fetched successfully',
        data: serializeTemplate(template),
      });
    } catch (error: any) {
      console.error('Get Template Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateTemplates(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingTemplate = await prisma.sfa_d_templates.findUnique({
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

      const updatedTemplate = await prisma.sfa_d_templates.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Template updated successfully',
        data: serializeTemplate(updatedTemplate),
      });
    } catch (error: any) {
      console.error('Update Template Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteTemplates(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await prisma.sfa_d_templates.findUnique({
        where: { id: Number(id) },
      });

      if (!template)
        return res.status(404).json({ message: 'Template not found' });

      await prisma.sfa_d_templates.delete({ where: { id: Number(id) } });

      res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
      console.error('Delete Template Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
