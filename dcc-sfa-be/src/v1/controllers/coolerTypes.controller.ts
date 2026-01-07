import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CoolerTypeSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeCoolerType = (coolerType: any): CoolerTypeSerialized => ({
  id: coolerType.id,
  name: coolerType.name,
  code: coolerType.code,
  description: coolerType.description,
  is_active: coolerType.is_active,
  created_by: coolerType.createdby,
  createdate: coolerType.createdate,
  updatedate: coolerType.updatedate,
  updatedby: coolerType.updatedby,
});

export const coolerTypesController = {
  async createCoolerType(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res
          .status(400)
          .json({ message: 'Cooler type name is required' });
      }

      const generateCode = (name: string): string => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }
        return `CT-${abbreviation}`;
      };

      const coolerType = await prisma.cooler_types.create({
        data: {
          ...data,
          code:
            data.code && data.code.trim() !== ''
              ? data.code
              : generateCode(data.name),
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Cooler type created successfully',
        data: serializeCoolerType(coolerType),
      });
    } catch (error: any) {
      console.error('Create Cooler Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCoolerTypes(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', search = '', isActive } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
      };

      const totalCoolerTypes = await prisma.cooler_types.count();
      const activeCoolerTypes = await prisma.cooler_types.count({
        where: { is_active: 'Y' },
      });
      const inactiveCoolerTypes = await prisma.cooler_types.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newCoolerTypesThisMonth = await prisma.cooler_types.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_cooler_types: totalCoolerTypes,
        active_cooler_types: activeCoolerTypes,
        inactive_cooler_types: inactiveCoolerTypes,
        new_cooler_types: newCoolerTypesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.cooler_types,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Cooler types retrieved successfully',
        data: data.map((d: any) => serializeCoolerType(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Cooler Types Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getCoolerTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coolerType = await prisma.cooler_types.findUnique({
        where: { id: Number(id) },
      });

      if (!coolerType) {
        return res.status(404).json({ message: 'Cooler type not found' });
      }

      res.json({
        message: 'Cooler type fetched successfully',
        data: serializeCoolerType(coolerType),
      });
    } catch (error: any) {
      console.error('Get Cooler Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCoolerType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCoolerType = await prisma.cooler_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCoolerType) {
        return res.status(404).json({ message: 'Cooler type not found' });
      }

      const generateCode = (name: string): string => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }
        return `CT-${abbreviation}`;
      };

      const nameToUse = req.body.name || existingCoolerType.name;
      const codeToUse =
        req.body.code && req.body.code.trim() !== ''
          ? req.body.code
          : generateCode(nameToUse);

      const data = {
        ...req.body,
        code: codeToUse,
        updatedate: new Date(),
      };

      const coolerType = await prisma.cooler_types.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Cooler type updated successfully',
        data: serializeCoolerType(coolerType),
      });
    } catch (error: any) {
      console.error('Update Cooler Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCoolerType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCoolerType = await prisma.cooler_types.findUnique({
        where: { id: Number(id) },
        include: {
          cooler_sub_types_cooler_types: true,
        },
      });

      if (!existingCoolerType) {
        return res.status(404).json({ message: 'Cooler type not found' });
      }

      const hasCoolerSubTypes =
        existingCoolerType.cooler_sub_types_cooler_types.length > 0;

      if (hasCoolerSubTypes) {
        return res.status(400).json({
          message:
            'Cannot delete cooler type. It has associated cooler sub-types.',
          details: {
            cooler_sub_types_count:
              existingCoolerType.cooler_sub_types_cooler_types.length,
            message:
              'Please delete or reassign the associated cooler sub-types first.',
          },
        });
      }

      await prisma.cooler_types.delete({ where: { id: Number(id) } });

      res.json({ message: 'Cooler type deleted successfully' });
    } catch (error: any) {
      console.error('Delete Cooler Type Error:', error);

      // Handle foreign key constraint violations
      if (error.code === 'P2003') {
        return res.status(400).json({
          message: 'Cannot delete cooler type due to existing dependencies.',
          details: {
            constraint: error.meta?.field || 'foreign_key_constraint',
            message: 'This cooler type is referenced by other records.',
          },
        });
      }

      res.status(500).json({ message: error.message });
    }
  },

  async getCoolerTypesDropdown(req: Request, res: Response) {
    try {
      const coolerTypes = await prisma.cooler_types.findMany({
        where: { is_active: 'Y' },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        message: 'Cooler types dropdown retrieved successfully',
        data: coolerTypes,
      });
    } catch (error: any) {
      console.error('Get Cooler Types Dropdown Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
