import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface DepotSerialized {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  phone_number?: string | null;
  email?: string | null;
  manager_id?: number | null;
  supervisor_id?: number | null;
  coordinator_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  depot_companies?: {
    id: number;
    name: string;
    code: string;
  } | null;
  user_depot?: {
    id: Number;
    email: String;
    name: String;
  };
  depots_manager?: { id: number; name: string; email: string } | null;
  depots_supervisior?: { id: number; name: string; email: string } | null;
  depots_coodrinator?: { id: number; name: string; email: string } | null;
}

const generatedDepotCode = async (name: string) => {
  const prefix = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const lastDepot = await prisma.depots.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { id: 'desc' },
    select: { code: true },
  });
  let newNumber = 1;
  if (lastDepot && lastDepot.code) {
    const match = lastDepot.code.match(new RegExp(`${prefix}(\\d+)`));
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}${newNumber.toString().padStart(3, '0')}`;
};

const serializeDepot = (
  depot: any,
  includeCompany = false
): DepotSerialized => ({
  id: depot.id,
  parent_id: Number(depot.parent_id),
  name: depot.name,
  code: depot.code,
  address: depot.address,
  city: depot.city,
  state: depot.state,
  zipcode: depot.zipcode,
  phone_number: depot.phone_number,
  email: depot.email,
  manager_id: depot.manager_id,
  supervisor_id: depot.supervisor_id,
  coordinator_id: depot.coordinator_id,
  latitude: depot.latitude ? Number(depot.latitude) : null,
  longitude: depot.longitude ? Number(depot.longitude) : null,
  is_active: depot.is_active,
  created_by: depot.createdby,
  createdate: depot.createdate,
  updatedate: depot.updatedate,
  updatedby: depot.updatedby,
  depot_companies:
    includeCompany && depot.depot_companies
      ? {
          id: depot.depot_companies.id,
          name: depot.depot_companies.name,
          code: depot.depot_companies.code,
        }
      : null,
  user_depot: depot.user_depot
    ? depot.user_depot.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      }))
    : [],
  depots_manager: depot.depots_manager
    ? {
        id: depot.depots_manager.id,
        name: depot.depots_manager.name,
        email: depot.depots_manager.email,
      }
    : null,
  depots_supervisior: depot.depots_supervisior
    ? {
        id: depot.depots_supervisior.id,
        name: depot.depots_supervisior.name,
        email: depot.depots_supervisior.email,
      }
    : null,
  depots_coodrinator: depot.depots_coodrinator
    ? {
        id: depot.depots_coodrinator.id,
        name: depot.depots_coodrinator.name,
        email: depot.depots_coodrinator.email,
      }
    : null,
});

export const depotsController = {
  async createDepots(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Depot name is required' });
      }

      const newCode = await generatedDepotCode(data.name);

      const depot = await prisma.depots.create({
        data: {
          ...data,
          code: newCode,

          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          depot_companies: true,
          user_depot: true,
          depots_manager: true,
          depots_supervisior: true,
          depots_coodrinator: true,
        },
      });

      res.status(201).json({
        message: 'Depot created successfully',
        data: serializeDepot(depot, true),
      });
    } catch (error: any) {
      console.error('Create Depot Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getDepots(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', search = '' } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { email: { contains: searchLower } },
            { city: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.depots,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          depot_companies: true,
          user_depot: true,
          depots_manager: true,
          depots_supervisior: true,
          depots_coodrinator: true,
        },
      });

      res.json({
        message: 'Depots retrieved successfully',
        data: data.map((d: any) => serializeDepot(d, true)),
        pagination,
      });
    } catch (error: any) {
      console.error('Get Depots Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getDepotsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const depot = await prisma.depots.findUnique({
        where: { id: Number(id) },
        include: { depot_companies: true, user_depot: true },
      });

      if (!depot) {
        return res.status(404).json({ message: 'Depot not found' });
      }

      res.json({
        message: 'Depot fetched successfully',
        data: serializeDepot(depot, true),
      });
    } catch (error: any) {
      console.error('Get Depot Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateDepots(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingDepot = await prisma.depots.findUnique({
        where: { id: Number(id) },
      });

      if (!existingDepot) {
        return res.status(404).json({ message: 'Depot not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const depot = await prisma.depots.update({
        where: { id: Number(id) },
        data,
        include: {
          depot_companies: true,
          user_depot: true,
          depots_manager: true,
          depots_supervisior: true,
          depots_coodrinator: true,
        },
      });

      res.json({
        message: 'Depot updated successfully',
        data: serializeDepot(depot, true),
      });
    } catch (error: any) {
      console.error('Update Depot Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteDepots(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingDepot = await prisma.depots.findUnique({
        where: { id: Number(id) },
      });

      if (!existingDepot) {
        return res.status(404).json({ message: 'Depot not found' });
      }

      await prisma.depots.delete({ where: { id: Number(id) } });

      res.json({ message: 'Depot deleted successfully' });
    } catch (error: any) {
      console.error('Delete Depot Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
