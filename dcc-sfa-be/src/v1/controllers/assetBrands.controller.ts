import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetBrandSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: string;
  createdby: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  asset_count?: number;
}

const serializeAssetBrand = (assetBrand: any): AssetBrandSerialized => ({
  id: assetBrand.id,
  name: assetBrand.name,
  code: assetBrand.code,
  description: assetBrand.description,
  is_active: assetBrand.is_active,
  createdby: assetBrand.createdby,
  createdate: assetBrand.createdate,
  updatedate: assetBrand.updatedate,
  updatedby: assetBrand.updatedby,
  asset_count: assetBrand._count?.asset_master_brands || 0,
});

export const assetBrandsController = {
  async createAssetBrand(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res
          .status(400)
          .json({ message: 'Asset brand name is required' });
      }
      const existingName = await prisma.asset_brands.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
          },
        },
      });

      if (existingName) {
        return res.status(400).json({
          message:
            'Asset brand name already exists. Please use a different name.',
        });
      }
      const generateCode = async (name: string): Promise<string> => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }

        const baseCode = `AB-${abbreviation}`;

        const existingCodes = await prisma.asset_brands.findMany({
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
        const existingCode = await prisma.asset_brands.findFirst({
          where: { code: data.code.trim() },
        });

        if (existingCode) {
          return res.status(400).json({
            message: 'Code already exists. Please use a different code.',
          });
        }
      }

      if (data.code && data.code.trim() !== '') {
        const existingCode = await prisma.asset_brands.findFirst({
          where: {
            code: {
              equals: data.code.trim(),
            },
          },
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

      const assetBrand = await prisma.asset_brands.create({
        data: {
          ...data,
          code: finalCode,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Asset brand created successfully',
        data: serializeAssetBrand(assetBrand),
      });
    } catch (error: any) {
      console.error('Create Asset Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetBrands(req: Request, res: Response) {
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

      const totalAssetBrands = await prisma.asset_brands.count();
      const activeAssetBrands = await prisma.asset_brands.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssetBrands = await prisma.asset_brands.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newAssetBrandsThisMonth = await prisma.asset_brands.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_asset_brands: totalAssetBrands,
        active_asset_brands: activeAssetBrands,
        inactive_asset_brands: inactiveAssetBrands,
        new_asset_brands: newAssetBrandsThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_brands,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          _count: {
            select: {
              asset_master_brands: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Asset brands retrieved successfully',
        data: data.map((d: any) => serializeAssetBrand(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Asset Brands Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAssetBrandById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assetBrand = await prisma.asset_brands.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              asset_master_brands: true,
            },
          },
          asset_master_brands: {
            select: {
              id: true,
              name: true,
              code: true,
              serial_number: true,
              current_status: true,
            },
          },
        },
      });

      if (!assetBrand) {
        return res.status(404).json({ message: 'Asset brand not found' });
      }

      res.json({
        message: 'Asset brand fetched successfully',
        data: serializeAssetBrand(assetBrand),
      });
    } catch (error: any) {
      console.error('Get Asset Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAssetBrand = await prisma.asset_brands.findUnique({
        where: { id: Number(id) },
      });

      if (!existingAssetBrand) {
        return res.status(404).json({ message: 'Asset brand not found' });
      }

      const generateCode = async (name: string): Promise<string> => {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
          abbreviation = firstWord;
        }

        const baseCode = `AB-${abbreviation}`;

        const existingCodes = await prisma.asset_brands.findMany({
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
        const existingCode = await prisma.asset_brands.findFirst({
          where: {
            code: req.body.code.trim(),
            id: {
              not: Number(req.params.id),
            },
          },
        });

        if (existingCode) {
          return res.status(400).json({
            message: 'Code already exists. Please use a different code.',
          });
        }
      }

      const nameToUse = req.body.name || existingAssetBrand.name;
      const finalCode =
        req.body.code && req.body.code.trim() !== ''
          ? req.body.code.trim()
          : await generateCode(nameToUse);

      const data = {
        ...req.body,
        code: finalCode,
        updatedate: new Date(),
      };

      const assetBrand = await prisma.asset_brands.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Asset brand updated successfully',
        data: serializeAssetBrand(assetBrand),
      });
    } catch (error: any) {
      console.error('Update Asset Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAssetBrand = await prisma.asset_brands.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              asset_master_brands: true,
            },
          },
        },
      });

      if (!existingAssetBrand) {
        return res.status(404).json({ message: 'Asset brand not found' });
      }

      if (existingAssetBrand._count.asset_master_brands > 0) {
        return res.status(400).json({
          message: 'Cannot delete asset brand. It is being used by assets.',
          data: {
            assetCount: existingAssetBrand._count.asset_master_brands,
          },
        });
      }

      await prisma.asset_brands.delete({ where: { id: Number(id) } });

      res.json({ message: 'Asset brand deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetBrandsDropdown(req: Request, res: Response) {
    try {
      const assetBrands = await prisma.asset_brands.findMany({
        where: {
          is_active: 'Y',
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        message: 'Asset brands dropdown retrieved successfully',
        data: assetBrands,
      });
    } catch (error: any) {
      console.error('Get Asset Brands Dropdown Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
