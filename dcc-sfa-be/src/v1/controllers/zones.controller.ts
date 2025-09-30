import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface ZoneSerialized {
  id: number;
  parent_id: number;
  depot_id?: number | null;
  name: string;
  code: string;
  description?: string | null;
  supervisor_id?: number | null;
  is_active: string;
  createdby: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  promotions?: { id: number; name: string }[];
  routes_zones?: { id: number; name: string }[];
  user_zones?: { id: number; name: string; email: string }[];
  zone_depots?: { id: number; name: string; code: string } | null;
}

const generatedDepotCode = async (name: string) => {
  const prefix = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const lastZone = await prisma.zones.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { id: 'desc' },
    select: { code: true },
  });
  let newNumber = 1;
  if (lastZone && lastZone.code) {
    const match = lastZone.code.match(new RegExp(`${prefix}(\\d+)`));
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}${newNumber.toString().padStart(3, '0')}`;
};
const serializeZone = (zone: any): ZoneSerialized => ({
  id: zone.id,
  parent_id: zone.parent_id,
  depot_id: zone.depot_id,
  name: zone.name,
  code: zone.code,
  description: zone.description,
  supervisor_id: zone.supervisor_id,
  is_active: zone.is_active,
  createdby: zone.createdby,
  createdate: zone.createdate,
  updatedate: zone.updatedate,
  updatedby: zone.updatedby,
  log_inst: zone.log_inst,
  promotions: zone.promotions
    ? zone.promotions.map((p: any) => ({ id: p.id, name: p.name }))
    : [],
  routes_zones: zone.routes_zones
    ? zone.routes_zones.map((r: any) => ({ id: r.id, name: r.name }))
    : [],
  user_zones: zone.user_zones
    ? zone.user_zones.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }))
    : [],
  zone_depots: zone.zone_depots
    ? {
        id: zone.zone_depots.id,
        name: zone.zone_depots.name,
        code: zone.zone_depots.code,
      }
    : null,
});

export const zonesController = {
  async createZone(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Zone name is required' });
      }

      const newCode = await generatedDepotCode(data.name);
      const zone = await prisma.zones.create({
        data: {
          ...data,
          code: newCode,

          createdby: data.createdby || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          promotions: true,
          routes_zones: true,
          user_zones: true,
          zone_depots: true,
        },
      });

      res.status(201).json({
        message: 'Zone created successfully',
        data: serializeZone(zone),
      });
    } catch (error: any) {
      console.error('Create Zone Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getZones(req: any, res: any) {
    try {
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.zones,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          promotions: true,
          routes_zones: true,
          user_zones: true,
          zone_depots: true,
        },
      });

      const totalZones = await prisma.zones.count();
      const activeZones = await prisma.zones.count({
        where: { is_active: 'Y' },
      });
      const inactiveZones = await prisma.zones.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const newZonesThisMonth = await prisma.zones.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success({
        message: 'Zones retrieved successfully',
        data: data.map(serializeZone),
        pagination,
        stats: {
          totalZones,
          activeZones,
          inactiveZones,
          newZonesThisMonth,
        },
      });
    } catch (error: any) {
      console.error('Get Zones Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  async getZoneById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const zone = await prisma.zones.findUnique({
        where: { id: Number(id) },
        include: {
          promotions: true,
          routes_zones: true,
          user_zones: true,
          zone_depots: true,
        },
      });

      if (!zone) {
        return res.status(404).json({ message: 'Zone not found' });
      }

      res.json({
        message: 'Zone fetched successfully',
        data: serializeZone(zone),
      });
    } catch (error: any) {
      console.error('Get Zone Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateZone(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingZone = await prisma.zones.findUnique({
        where: { id: Number(id) },
      });

      if (!existingZone) {
        return res.status(404).json({ message: 'Zone not found' });
      }

      const data = { ...req.body, updatedate: new Date() };
      const zone = await prisma.zones.update({
        where: { id: Number(id) },
        data,
        include: {
          promotions: true,
          routes_zones: true,
          user_zones: true,
          zone_depots: true,
        },
      });

      res.json({
        message: 'Zone updated successfully',
        data: serializeZone(zone),
      });
    } catch (error: any) {
      console.error('Update Zone Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete zone
  async deleteZone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingZone = await prisma.zones.findUnique({
        where: { id: Number(id) },
      });

      if (!existingZone) {
        return res.status(404).json({ message: 'Zone not found' });
      }

      await prisma.zones.delete({ where: { id: Number(id) } });

      res.json({ message: 'Zone deleted successfully' });
    } catch (error: any) {
      console.error('Delete Zone Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
