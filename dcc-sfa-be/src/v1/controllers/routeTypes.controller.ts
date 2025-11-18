import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface RouteTypeSerialized {
  id: number;
  name: string;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

const serializeRouteType = (routeType: any): RouteTypeSerialized => ({
  id: routeType.id,
  name: routeType.name,
  is_active: routeType.is_active,
  createdate: routeType.createdate,
  createdby: routeType.createdby,
  updatedate: routeType.updatedate,
  updatedby: routeType.updatedby,
  log_inst: routeType.log_inst,
});

export const routeTypesController = {
  async createRouteType(req: Request, res: Response) {
    try {
      const { name, is_active } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Route type name is required' });
      }

      const routeType = await prisma.route_type.create({
        data: {
          name,
          is_active: is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: 1,
        },
      });

      res.status(201).json({
        message: 'Route type created successfully',
        data: serializeRouteType(routeType),
      });
    } catch (error: any) {
      console.error('Create Route Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllRouteTypes(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          name: { contains: searchLower },
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.route_type,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      const totalRouteTypes = await prisma.route_type.count();
      const activeRouteTypes = await prisma.route_type.count({
        where: { is_active: 'Y' },
      });
      const inactiveRouteTypes = await prisma.route_type.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const routeTypesThisMonth = await prisma.route_type.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Route types retrieved successfully',
        data.map((routeType: any) => serializeRouteType(routeType)),
        200,
        pagination,
        {
          total_route_types: totalRouteTypes,
          active_route_types: activeRouteTypes,
          inactive_route_types: inactiveRouteTypes,
          route_types_this_month: routeTypesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Route Types Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getRouteTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const routeType = await prisma.route_type.findUnique({
        where: { id: Number(id) },
      });

      if (!routeType) {
        return res.status(404).json({ message: 'Route type not found' });
      }

      res.json({
        message: 'Route type fetched successfully',
        data: serializeRouteType(routeType),
      });
    } catch (error: any) {
      console.error('Get Route Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateRouteType(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingRouteType = await prisma.route_type.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRouteType) {
        return res.status(404).json({ message: 'Route type not found' });
      }

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const routeType = await prisma.route_type.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Route type updated successfully',
        data: serializeRouteType(routeType),
      });
    } catch (error: any) {
      console.error('Update Route Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteRouteType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingRouteType = await prisma.route_type.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRouteType) {
        return res.status(404).json({ message: 'Route type not found' });
      }

      await prisma.route_type.delete({ where: { id: Number(id) } });

      res.json({ message: 'Route type deleted successfully' });
    } catch (error: any) {
      console.error('Delete Route Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
