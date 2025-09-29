import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

// Interface for Depot serialization
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
  company?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

// Serialize depot data
const serializeDepot = (
  depot: any,
  includeCompany = false
): DepotSerialized => ({
  id: depot.id,
  parent_id: depot.parent_id,
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
  company:
    includeCompany && depot.companies
      ? {
          id: depot.companies.id,
          name: depot.companies.name,
          code: depot.companies.code,
        }
      : null,
});

export const depotsController = {
  async createDepots(req: Request, res: Response) {
    try {
      const data = req.body;
      const depot = await prisma.depots.create({
        data: {
          ...data,
          parent_id: Number(data.parent_id),
          createdby: Number(data.createdby),
          createdate: new Date(),
        },
        include: { companies: true },
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
        include: { companies: true },
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

  // GET Depot by ID
  async getDepotById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const depot = await prisma.depots.findUnique({
        where: { id: Number(id) },
        include: { companies: true },
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

  // UPDATE Depot
  async updateDepot(req: Request, res: Response) {
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
        include: { companies: true },
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

  // DELETE Depot
  async deleteDepot(req: Request, res: Response) {
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
