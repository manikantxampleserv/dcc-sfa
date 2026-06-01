import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface RegionSerialized {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  district_regions?: Array<{
    id: number;
    name: string;
    code?: string | null;
  }>;
}

const generateRegionCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastRegion = await prisma.regions.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastRegion && lastRegion.code) {
    const match = lastRegion.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const serializeRegion = (
  region: any,
  includeDistricts = false
): RegionSerialized => ({
  id: region.id,
  name: region.name,
  code: region.code,
  description: region.description,
  is_active: region.is_active,
  createdate: region.createdate,
  createdby: region.createdby,
  updatedate: region.updatedate,
  updatedby: region.updatedby,
  log_inst: region.log_inst,
  district_regions:
    includeDistricts && region.district_regions
      ? region.district_regions.map((district: any) => ({
          id: district.id,
          name: district.name,
          code: district.code,
        }))
      : [],
});

export const regionsController = {
  async createRegions(req: any, res: any) {
    try {
      const data = req.body;

      if (!data.name) {
        return res.status(400).json({ message: 'Region name is required' });
      }

      const existingRegion = await prisma.regions.findFirst({
        where: { name: data.name },
      });

      if (existingRegion) {
        return res
          .status(400)
          .json({ message: 'Region with this name already exists' });
      }

      const region = await prisma.regions.create({
        data: {
          name: data.name,
          code: data.code || (await generateRegionCode(data.name)),
          description: data.description || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || data.createdby || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          district_regions: true,
        },
      });

      res.status(201).json({
        message: 'Region created successfully',
        data: serializeRegion(region, true),
      });
    } catch (error: any) {
      console.error('Create Region Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllRegions(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.regions,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          district_regions: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const totalRegions = await prisma.regions.count();
      const activeRegions = await prisma.regions.count({
        where: { is_active: 'Y' },
      });
      const inactiveRegions = await prisma.regions.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newRegionsThisMonth = await prisma.regions.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Regions retrieved successfully',
        data.map((r: any) => serializeRegion(r, true)),
        200,
        pagination,
        {
          total_regions: totalRegions,
          active_regions: activeRegions,
          inactive_regions: inactiveRegions,
          new_regions_this_month: newRegionsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Regions Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getRegionsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const region = await prisma.regions.findUnique({
        where: { id: Number(id) },
        include: {
          district_regions: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!region) {
        return res.status(404).json({ message: 'Region not found' });
      }

      res.json({
        message: 'Region fetched successfully',
        data: serializeRegion(region, true),
      });
    } catch (error: any) {
      console.error('Get Region Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateRegions(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingRegion = await prisma.regions.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRegion) {
        return res.status(404).json({ message: 'Region not found' });
      }

      const data = req.body;

      // Check for duplicate name (excluding current record)
      if (data.name && data.name !== existingRegion.name) {
        const duplicateRegion = await prisma.regions.findFirst({
          where: { name: data.name },
        });

        if (duplicateRegion) {
          return res
            .status(400)
            .json({ message: 'Region with this name already exists' });
        }
      }

      const updatedRegion = await prisma.regions.update({
        where: { id: Number(id) },
        data: {
          ...data,
          updatedate: new Date(),
          updatedby: req.user?.id,
        },
        include: {
          district_regions: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.json({
        message: 'Region updated successfully',
        data: serializeRegion(updatedRegion, true),
      });
    } catch (error: any) {
      console.error('Update Region Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteRegions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingRegion = await prisma.regions.findUnique({
        where: { id: Number(id) },
        include: {
          district_regions: {
            select: { id: true },
          },
        },
      });

      if (!existingRegion) {
        return res.status(404).json({ message: 'Region not found' });
      }

      // Check for associated districts
      if (existingRegion.district_regions.length > 0) {
        return res.status(400).json({
          message: `Cannot delete region. It has ${existingRegion.district_regions.length} associated district(s). Please reassign or delete the districts first.`,
        });
      }

      await prisma.regions.delete({ where: { id: Number(id) } });

      res.json({ message: 'Region deleted successfully' });
    } catch (error: any) {
      console.error('Delete Region Error:', error);

      if (
        error.code === 'P2003' ||
        error.message.includes('Foreign key constraint violated')
      ) {
        return res.status(400).json({
          message:
            'Cannot delete region. It is referenced by other records. Please update or delete those records first.',
        });
      }

      res.status(500).json({ message: error.message });
    }
  },
};
