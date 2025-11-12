import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetTypeSerialized {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeAssetType = (assetType: any): AssetTypeSerialized => ({
  id: assetType.id,
  name: assetType.name,
  description: assetType.description,
  category: assetType.category,
  brand: assetType.brand,
  is_active: assetType.is_active,
  created_by: assetType.createdby,
  createdate: assetType.createdate,
  updatedate: assetType.updatedate,
  updatedby: assetType.updatedby,
});

export const assetTypesController = {
  async createAssetType(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Asset type name is required' });
      }

      const assetType = await prisma.asset_types.create({
        data: {
          ...data,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Asset type created successfully',
        data: serializeAssetType(assetType),
      });
    } catch (error: any) {
      console.error('Create Asset Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetTypes(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive,
        category,
        brand,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: isActive as string,
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { description: { contains: searchLower } },
            { category: { contains: searchLower } },
            { brand: { contains: searchLower } },
          ],
        }),
        ...(category && { category: category as string }),
        ...(brand && { brand: brand as string }),
      };

      const totalAssetTypes = await prisma.asset_types.count();
      const activeAssetTypes = await prisma.asset_types.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssetTypes = await prisma.asset_types.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newAssetTypesThisMonth = await prisma.asset_types.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_asset_types: totalAssetTypes,
        active_asset_types: activeAssetTypes,
        inactive_asset_types: inactiveAssetTypes,
        new_asset_types: newAssetTypesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_types,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Asset types retrieved successfully',
        data: data.map((d: any) => serializeAssetType(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Asset Types Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAssetTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assetType = await prisma.asset_types.findUnique({
        where: { id: Number(id) },
      });

      if (!assetType) {
        return res.status(404).json({ message: 'Asset type not found' });
      }

      res.json({
        message: 'Asset type fetched successfully',
        data: serializeAssetType(assetType),
      });
    } catch (error: any) {
      console.error('Get Asset Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAssetType = await prisma.asset_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingAssetType) {
        return res.status(404).json({ message: 'Asset type not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const assetType = await prisma.asset_types.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Asset type updated successfully',
        data: serializeAssetType(assetType),
      });
    } catch (error: any) {
      console.error('Update Asset Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAssetType = await prisma.asset_types.findUnique({
        where: { id: Number(id) },
      });

      if (!existingAssetType) {
        return res.status(404).json({ message: 'Asset type not found' });
      }

      await prisma.asset_types.delete({ where: { id: Number(id) } });

      res.json({ message: 'Asset type deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
