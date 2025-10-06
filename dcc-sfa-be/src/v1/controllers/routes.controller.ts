import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface RouteSerialized {
  id: number;
  parent_id: number;
  depot_id: number;
  name: string;
  code: string;
  description?: string | null;
  salesperson_id?: number | null;
  start_location?: string | null;
  end_location?: string | null;
  estimated_distance?: number | null;
  estimated_time?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_routes?: { id: number; name: string }[];
  routes_depots?: { id: number; name: string; code: string };
  routes_zones?: { id: number; name: string };
  routes_salesperson?: { id: number; name: string; email: string } | null;
  visits?: { id: number; name: string }[];
}

const generateRoutesCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastRoutes = await prisma.routes.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastRoutes && lastRoutes.code) {
    const match = lastRoutes.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

  return code;
};
const serializeRoute = (route: any): RouteSerialized => ({
  id: route.id,
  parent_id: route.parent_id,
  depot_id: route.depot_id,
  name: route.name,
  code: route.code,
  description: route.description,
  salesperson_id: route.salesperson_id,
  start_location: route.start_location,
  end_location: route.end_location,
  estimated_distance: route.estimated_distance,
  estimated_time: route.estimated_time,
  is_active: route.is_active,
  createdate: route.createdate,
  createdby: route.createdby,
  updatedate: route.updatedate,
  updatedby: route.updatedby,
  log_inst: route.log_inst,
  customer_routes:
    route.customer_routes?.map((c: any) => ({ id: c.id, name: c.name })) || [],
  routes_depots: route.routes_depots
    ? {
        id: route.routes_depots.id,
        name: route.routes_depots.name,
        code: route.routes_depots.code,
      }
    : undefined,
  routes_zones: route.routes_zones
    ? { id: route.routes_zones.id, name: route.routes_zones.name }
    : undefined,
  routes_salesperson: route.routes_salesperson
    ? {
        id: route.routes_salesperson.id,
        name: route.routes_salesperson.name,
        email: route.routes_salesperson.email,
      }
    : null,
  visits: route.visits?.map((v: any) => ({ id: v.id, name: v.name })) || [],
});

export const routesController = {
  async createRoutes(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.name || !data.depot_id || !data.parent_id) {
        return res
          .status(400)
          .json({ message: 'Name, depot_id, and parent_id are required' });
      }
      const newCode = await generateRoutesCode(data.name);
      const route = await prisma.routes.create({
        data: {
          ...data,
          code: newCode,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          customer_routes: true,
          routes_depots: true,
          routes_zones: true,
          routes_salesperson: true,
          visits: true,
        },
      });

      res.status(201).json({
        message: 'Route created successfully',
        data: serializeRoute(route),
      });
    } catch (error: any) {
      console.error('Create Route Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getRoutes(req: any, res: any) {
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
        model: prisma.routes,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_routes: true,
          routes_depots: true,
          routes_zones: true,
          routes_salesperson: true,
          visits: true,
        },
      });

      res.success(
        'Routes retrieved successfully',
        data.map((route: any) => serializeRoute(route)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Get Routes Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getRoutesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const route = await prisma.routes.findUnique({
        where: { id: Number(id) },
        include: {
          customer_routes: true,
          routes_depots: true,
          routes_zones: true,
          routes_salesperson: true,
          visits: true,
        },
      });

      if (!route) return res.status(404).json({ message: 'Route not found' });

      res.json({
        message: 'Route fetched successfully',
        data: serializeRoute(route),
      });
    } catch (error: any) {
      console.error('Get Route Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateRoutes(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingRoute = await prisma.routes.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRoute)
        return res.status(404).json({ message: 'Route not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };
      const route = await prisma.routes.update({
        where: { id: Number(id) },
        data,
        include: {
          customer_routes: true,
          routes_depots: true,
          routes_zones: true,
          routes_salesperson: true,
          visits: true,
        },
      });

      res.json({
        message: 'Route updated successfully',
        data: serializeRoute(route),
      });
    } catch (error: any) {
      console.error('Update Route Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteRoutes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingRoute = await prisma.routes.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRoute)
        return res.status(404).json({ message: 'Route not found' });

      await prisma.routes.delete({ where: { id: Number(id) } });

      res.json({ message: 'Route deleted successfully' });
    } catch (error: any) {
      console.error('Delete Route Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
