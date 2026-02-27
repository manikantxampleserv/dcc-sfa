import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetSubTypeSerialized {
  id: number;
  name: string;
  code: string;
  asset_type_id: number;
  description?: string | null;
  is_active: string;
  createdby: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  asset_type?: {
    id: number;
    name: string;
  } | null;
}

const serializeAssetSubType = (assetSubType: any): AssetSubTypeSerialized => ({
  id: assetSubType.id,
  name: assetSubType.name,
  code: assetSubType.code,
  asset_type_id: assetSubType.asset_type_id,
  description: assetSubType.description,
  is_active: assetSubType.is_active,
  createdby: assetSubType.createdby,
  createdate: assetSubType.createdate,
  updatedate: assetSubType.updatedate,
  updatedby: assetSubType.updatedby,
  asset_type: assetSubType.asset_sub_types_asset_types
    ? {
        id: assetSubType.asset_sub_types_asset_types.id,
        name: assetSubType.asset_sub_types_asset_types.name,
      }
    : null,
});

export const assetSubTypesController = {
  async createAssetSubType(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res
          .status(400)
          .json({ message: 'Asset sub type name is required' });
      }
      if (!data.asset_type_id) {
        return res.status(400).json({ message: 'Asset type is required' });
      }

      const generateCode = async (name: string): Promise<string> => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }

        const baseCode = `AST-${abbreviation}`;

        const existingCodes = await prisma.asset_sub_types.findMany({
          where: {
            code: {
              startsWith: baseCode,
            },
          },
          select: {
            code: true,
          },
          orderBy: {
            code: 'desc',
          },
        });

        let nextNumber = 1;
        if (existingCodes.length > 0) {
          const lastCode = existingCodes[0].code;
          const match = lastCode.match(
            new RegExp(
              `${baseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`
            )
          );
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }

        return `${baseCode}-${nextNumber.toString().padStart(2, '0')}`;
      };

      if (data.code && data.code.trim() !== '') {
        const existingCode = await prisma.asset_sub_types.findFirst({
          where: { code: data.code.trim() },
        });

        if (existingCode) {
          return res.status(400).json({
            message: 'Code already exists. Please use a different code.',
          });
        }
      }

      const finalCode =
        data.code && data.code.trim() !== ''
          ? data.code.trim()
          : await generateCode(data.name);

      const assetSubType = await prisma.asset_sub_types.create({
        data: {
          ...data,
          code: finalCode,
          asset_type_id: Number(data.asset_type_id),
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Asset sub type created successfully',
        data: serializeAssetSubType(assetSubType),
      });
    } catch (error: any) {
      console.error('Create Asset Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetSubTypes(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive,
        assetTypeId,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(assetTypeId && { asset_type_id: Number(assetTypeId) }),
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
      };

      const totalAssetSubTypes = await prisma.asset_sub_types.count();
      const activeAssetSubTypes = await prisma.asset_sub_types.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssetSubTypes = await prisma.asset_sub_types.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newAssetSubTypesThisMonth = await prisma.asset_sub_types.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_asset_sub_types: totalAssetSubTypes,
        active_asset_sub_types: activeAssetSubTypes,
        inactive_asset_sub_types: inactiveAssetSubTypes,
        new_asset_sub_types: newAssetSubTypesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_sub_types,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          asset_sub_types_asset_types: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Asset sub types retrieved successfully',
        data: data.map((d: any) => serializeAssetSubType(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Asset Sub Types Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAssetSubTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assetSubType = await prisma.asset_sub_types.findUnique({
        where: { id: Number(id) },
        include: {
          asset_sub_types_asset_types: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!assetSubType) {
        return res.status(404).json({ message: 'Asset sub type not found' });
      }

      res.json({
        message: 'Asset sub type fetched successfully',
        data: serializeAssetSubType(assetSubType),
      });
    } catch (error: any) {
      console.error('Get Asset Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetSubType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAssetSubType = await prisma.asset_sub_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingAssetSubType) {
        return res.status(404).json({ message: 'Asset sub type not found' });
      }

      const generateCode = async (name: string): Promise<string> => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }

        const baseCode = `AST-${abbreviation}`;

        const existingCodes = await prisma.asset_sub_types.findMany({
          where: {
            code: {
              startsWith: baseCode,
            },
            id: {
              not: Number(req.params.id),
            },
          },
          select: {
            code: true,
          },
          orderBy: {
            code: 'desc',
          },
        });

        let nextNumber = 1;
        if (existingCodes.length > 0) {
          const lastCode = existingCodes[0].code;
          const match = lastCode.match(
            new RegExp(
              `${baseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`
            )
          );
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }

        return `${baseCode}-${nextNumber.toString().padStart(2, '0')}`;
      };

      if (req.body.code && req.body.code.trim() !== '') {
        const existingCode = await prisma.asset_sub_types.findFirst({
          where: {
            code: req.body.code.trim(),
            id: {
              not: Number(req.params.id), // Exclude current record
            },
          },
        });

        if (existingCode) {
          return res.status(400).json({
            message: 'Code already exists. Please use a different code.',
          });
        }
      }

      const nameToUse = req.body.name || existingAssetSubType.name;
      const finalCode =
        req.body.code && req.body.code.trim() !== ''
          ? req.body.code.trim()
          : await generateCode(nameToUse);

      const data = {
        ...req.body,
        code: finalCode,
        ...(req.body.asset_type_id && {
          asset_type_id: Number(req.body.asset_type_id),
        }),
        updatedate: new Date(),
      };

      const assetSubType = await prisma.asset_sub_types.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Asset sub type updated successfully',
        data: serializeAssetSubType(assetSubType),
      });
    } catch (error: any) {
      console.error('Update Asset Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetSubType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAssetSubType = await prisma.asset_sub_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingAssetSubType) {
        return res.status(404).json({ message: 'Asset sub type not found' });
      }

      await prisma.asset_sub_types.delete({ where: { id: Number(id) } });

      res.json({ message: 'Asset sub type deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Sub Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetSubTypesDropdown(req: Request, res: Response) {
    try {
      const { asset_type_id } = req.query;
      const assetSubTypes = await prisma.asset_sub_types.findMany({
        where: {
          is_active: 'Y',
          ...(asset_type_id && { asset_type_id: Number(asset_type_id) }),
        },
        select: {
          id: true,
          name: true,
          code: true,
          asset_type_id: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        message: 'Asset sub types dropdown retrieved successfully',
        data: assetSubTypes,
      });
    } catch (error: any) {
      console.error('Get Asset Sub Types Dropdown Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
