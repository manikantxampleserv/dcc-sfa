import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CoolerSubTypeSerialized {
  id: number;
  name: string;
  code: string;
  cooler_type_id: number;
  description?: string | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  cooler_type?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

const serializeCoolerSubType = (
  coolerSubType: any
): CoolerSubTypeSerialized => ({
  id: coolerSubType.id,
  name: coolerSubType.name,
  code: coolerSubType.code,
  cooler_type_id: coolerSubType.cooler_type_id,
  description: coolerSubType.description,
  is_active: coolerSubType.is_active,
  created_by: coolerSubType.createdby,
  createdate: coolerSubType.createdate,
  updatedate: coolerSubType.updatedate,
  updatedby: coolerSubType.updatedby,
  cooler_type: coolerSubType.cooler_sub_types_cooler_types
    ? {
        id: coolerSubType.cooler_sub_types_cooler_types.id,
        name: coolerSubType.cooler_sub_types_cooler_types.name,
        code: coolerSubType.cooler_sub_types_cooler_types.code,
      }
    : null,
});

export const coolerSubTypesController = {
  async createCoolerSubType(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res
          .status(400)
          .json({ message: 'Cooler sub type name is required' });
      }
      if (!data.cooler_type_id) {
        return res.status(400).json({ message: 'Cooler type is required' });
      }

      const generateCode = (name: string): string => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }
        return `CST-${abbreviation}`;
      };

      const coolerSubType = await prisma.cooler_sub_types.create({
        data: {
          ...data,
          code:
            data.code && data.code.trim() !== ''
              ? data.code
              : generateCode(data.name),
          cooler_type_id: Number(data.cooler_type_id),
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Cooler sub type created successfully',
        data: serializeCoolerSubType(coolerSubType),
      });
    } catch (error: any) {
      console.error('Create Cooler Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCoolerSubTypes(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive,
        coolerTypeId,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(coolerTypeId && { cooler_type_id: Number(coolerTypeId) }),
        ...(search && {
          OR: [
            { name: { contains: searchLower, mode: 'insensitive' } },
            { code: { contains: searchLower, mode: 'insensitive' } },
            { description: { contains: searchLower, mode: 'insensitive' } },
          ],
        }),
      };

      const totalCoolerSubTypes = await prisma.cooler_sub_types.count();
      const activeCoolerSubTypes = await prisma.cooler_sub_types.count({
        where: { is_active: 'Y' },
      });
      const inactiveCoolerSubTypes = await prisma.cooler_sub_types.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newCoolerSubTypesThisMonth = await prisma.cooler_sub_types.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_cooler_sub_types: totalCoolerSubTypes,
        active_cooler_sub_types: activeCoolerSubTypes,
        inactive_cooler_sub_types: inactiveCoolerSubTypes,
        new_cooler_sub_types: newCoolerSubTypesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.cooler_sub_types,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          cooler_sub_types_cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Cooler sub types retrieved successfully',
        data: data.map((d: any) => serializeCoolerSubType(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Cooler Sub Types Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getCoolerSubTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coolerSubType = await prisma.cooler_sub_types.findUnique({
        where: { id: Number(id) },
        include: {
          cooler_sub_types_cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!coolerSubType) {
        return res.status(404).json({ message: 'Cooler sub type not found' });
      }

      res.json({
        message: 'Cooler sub type fetched successfully',
        data: serializeCoolerSubType(coolerSubType),
      });
    } catch (error: any) {
      console.error('Get Cooler Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCoolerSubType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCoolerSubType = await prisma.cooler_sub_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCoolerSubType) {
        return res.status(404).json({ message: 'Cooler sub type not found' });
      }

      const generateCode = (name: string): string => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }
        return `CST-${abbreviation}`;
      };

      const nameToUse = req.body.name || existingCoolerSubType.name;
      const codeToUse =
        req.body.code && req.body.code.trim() !== ''
          ? req.body.code
          : generateCode(nameToUse);

      const data = {
        ...req.body,
        code: codeToUse,
        ...(req.body.cooler_type_id && {
          cooler_type_id: Number(req.body.cooler_type_id),
        }),
        updatedate: new Date(),
      };

      const coolerSubType = await prisma.cooler_sub_types.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Cooler sub type updated successfully',
        data: serializeCoolerSubType(coolerSubType),
      });
    } catch (error: any) {
      console.error('Update Cooler Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCoolerSubType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCoolerSubType = await prisma.cooler_sub_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCoolerSubType) {
        return res.status(404).json({ message: 'Cooler sub type not found' });
      }

      await prisma.cooler_sub_types.delete({ where: { id: Number(id) } });

      res.json({ message: 'Cooler sub type deleted successfully' });
    } catch (error: any) {
      console.error('Delete Cooler Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCoolerSubTypesDropdown(req: Request, res: Response) {
    try {
      const { cooler_type_id } = req.query;
      const coolerSubTypes = await prisma.cooler_sub_types.findMany({
        where: {
          is_active: 'Y',
          ...(cooler_type_id && { cooler_type_id: Number(cooler_type_id) }),
        },
        select: {
          id: true,
          name: true,
          code: true,
          cooler_type_id: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        message: 'Cooler sub types dropdown retrieved successfully',
        data: coolerSubTypes,
      });
    } catch (error: any) {
      console.error('Get Cooler Sub Types Dropdown Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
