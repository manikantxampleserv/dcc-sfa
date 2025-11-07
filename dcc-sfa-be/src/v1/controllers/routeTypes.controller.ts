import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const routeTypesController = {
  async getRouteTypes(req: Request, res: Response) {
    try {
      const routeTypes = await prisma.route_type.findMany({
        where: {
          is_active: 'Y',
        },
        orderBy: {
          name: 'asc',
        },
      });

      res.json({
        success: true,
        message: 'Route types retrieved successfully',
        data: routeTypes,
      });
    } catch (error: any) {
      console.error('Get Route Types Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
