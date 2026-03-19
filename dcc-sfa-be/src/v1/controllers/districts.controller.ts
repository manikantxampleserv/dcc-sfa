import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface DistrictSerialized {
  id: number;
  region_id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  district_regions?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  cities_districts?: Array<{
    id: number;
    name: string;
    code?: string | null;
  }>;
}

const generateDistrictCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastDistrict = await prisma.districts.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastDistrict && lastDistrict.code) {
    const match = lastDistrict.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const serializeDistrict = (
  district: any,
  includeRegion = false,
  includeCities = false
): DistrictSerialized => ({
  id: district.id,
  region_id: district.region_id,
  name: district.name,
  code: district.code,
  description: district.description,
  is_active: district.is_active,
  createdate: district.createdate,
  createdby: district.createdby,
  updatedate: district.updatedate,
  updatedby: district.updatedby,
  log_inst: district.log_inst,
  district_regions:
    includeRegion && district.district_regions
      ? {
          id: district.district_regions.id,
          name: district.district_regions.name,
          code: district.district_regions.code,
        }
      : null,
  cities_districts:
    includeCities && district.cities_districts
      ? district.cities_districts.map((city: any) => ({
          id: city.id,
          name: city.name,
          code: city.code,
        }))
      : [],
});

export const districtsController = {
  async createDistricts(req: any, res: any) {
    try {
      const data = req.body;

      if (!data.name || !data.region_id) {
        return res.status(400).json({
          message: 'District name and region_id are required',
        });
      }

      const region = await prisma.regions.findUnique({
        where: { id: Number(data.region_id) },
      });

      if (!region) {
        return res.status(400).json({ message: 'Region not found' });
      }

      const existingDistrict = await prisma.districts.findFirst({
        where: {
          name: data.name,
          region_id: Number(data.region_id),
        },
      });

      if (existingDistrict) {
        return res.status(400).json({
          message: 'District with this name already exists in this region',
        });
      }

      const district = await prisma.districts.create({
        data: {
          name: data.name,
          region_id: Number(data.region_id),
          code: data.code || (await generateDistrictCode(data.name)),
          description: data.description || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || data.createdby || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          district_regions: true,
          cities_districts: true,
        },
      });

      res.status(201).json({
        message: 'District created successfully',
        data: serializeDistrict(district, true, true),
      });
    } catch (error: any) {
      console.error('Create District Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllDistricts(req: any, res: any) {
    try {
      const { page, limit, search, status, region_id } = req.query;
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
        ...(region_id && { region_id: Number(region_id) }),
      };

      const { data, pagination } = await paginate({
        model: prisma.districts,
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
          cities_districts: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const totalDistricts = await prisma.districts.count();
      const activeDistricts = await prisma.districts.count({
        where: { is_active: 'Y' },
      });
      const inactiveDistricts = await prisma.districts.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newDistrictsThisMonth = await prisma.districts.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Districts retrieved successfully',
        data.map((d: any) => serializeDistrict(d, true, true)),
        200,
        pagination,
        {
          total_districts: totalDistricts,
          active_districts: activeDistricts,
          inactive_districts: inactiveDistricts,
          new_districts_this_month: newDistrictsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Districts Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getDistrictsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const district = await prisma.districts.findUnique({
        where: { id: Number(id) },
        include: {
          district_regions: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cities_districts: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!district) {
        return res.status(404).json({ message: 'District not found' });
      }

      res.json({
        message: 'District fetched successfully',
        data: serializeDistrict(district, true, true),
      });
    } catch (error: any) {
      console.error('Get District Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateDistricts(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingDistrict = await prisma.districts.findUnique({
        where: { id: Number(id) },
      });

      if (!existingDistrict) {
        return res.status(404).json({ message: 'District not found' });
      }

      const data = req.body;

      if (data.region_id) {
        const region = await prisma.regions.findUnique({
          where: { id: Number(data.region_id) },
        });

        if (!region) {
          return res.status(400).json({ message: 'Region not found' });
        }
      }

      if (data.name && data.name !== existingDistrict.name) {
        const duplicateDistrict = await prisma.districts.findFirst({
          where: {
            name: data.name,
            region_id: data.region_id
              ? Number(data.region_id)
              : existingDistrict.region_id,
          },
        });

        if (duplicateDistrict) {
          return res.status(400).json({
            message: 'District with this name already exists in this region',
          });
        }
      }

      const updatedDistrict = await prisma.districts.update({
        where: { id: Number(id) },
        data: {
          ...data,
          region_id: data.region_id
            ? Number(data.region_id)
            : existingDistrict.region_id,
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
          cities_districts: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.json({
        message: 'District updated successfully',
        data: serializeDistrict(updatedDistrict, true, true),
      });
    } catch (error: any) {
      console.error('Update District Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteDistricts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingDistrict = await prisma.districts.findUnique({
        where: { id: Number(id) },
        include: {
          cities_districts: {
            select: { id: true },
          },
        },
      });

      if (!existingDistrict) {
        return res.status(404).json({ message: 'District not found' });
      }

      if (existingDistrict.cities_districts.length > 0) {
        return res.status(400).json({
          message: `Cannot delete district. It has ${existingDistrict.cities_districts.length} associated cities. Please reassign or delete the cities first.`,
        });
      }

      await prisma.districts.delete({ where: { id: Number(id) } });

      res.json({ message: 'District deleted successfully' });
    } catch (error: any) {
      console.error('Delete District Error:', error);

      if (
        error.code === 'P2003' ||
        error.message.includes('Foreign key constraint violated')
      ) {
        return res.status(400).json({
          message:
            'Cannot delete district. It is referenced by other records. Please update or delete those records first.',
        });
      }

      res.status(500).json({ message: error.message });
    }
  },
};
