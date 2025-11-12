import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface RoutePriceListSerialized {
  id: number;
  route_id: number;
  pricelist_id: number;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  pricelist?: { id: number; name: string } | null;
}

const serializeRoutePriceList = (rpl: any): RoutePriceListSerialized => ({
  id: rpl.id,
  route_id: rpl.route_id,
  pricelist_id: rpl.pricelist_id,
  is_active: rpl.is_active,
  createdate: rpl.createdate,
  createdby: rpl.createdby,
  updatedate: rpl.updatedate,
  updatedby: rpl.updatedby,
  log_inst: rpl.log_inst,
  pricelist: rpl.route_pricelist
    ? { id: rpl.route_pricelist.id, name: rpl.route_pricelist.name }
    : null,
});

export const routePriceListController = {
  async createRoutePriceList(req: any, res: any) {
    try {
      const data = req.body;

      const routePriceList = await prisma.route_pricelists.create({
        data: {
          route_id: data.route_id,
          pricelist_id: data.pricelist_id,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: { route_pricelist: true },
      });

      res.status(201).json({
        message: 'Route price list created successfully',
        data: serializeRoutePriceList(routePriceList),
      });
    } catch (error: any) {
      console.error('Create RoutePriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllRoutePriceList(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          route_pricelist: { name: { contains: searchLower } },
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.route_pricelists,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { route_pricelist: true },
      });

      const total = await prisma.route_pricelists.count();
      const active = await prisma.route_pricelists.count({
        where: { is_active: 'Y' },
      });
      const inactive = await prisma.route_pricelists.count({
        where: { is_active: 'N' },
      });

      res.success(
        'Route price lists retrieved successfully',
        data.map((r: any) => serializeRoutePriceList(r)),
        200,
        pagination,
        {
          total_route_price_lists: total,
          active_route_price_lists: active,
          inactive_route_price_lists: inactive,
        }
      );
    } catch (error: any) {
      console.error('Get RoutePriceLists Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getRoutePriceListById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const routePriceList = await prisma.route_pricelists.findUnique({
        where: { id: Number(id) },
        include: { route_pricelist: true },
      });

      if (!routePriceList)
        return res.status(404).json({ message: 'Route price list not found' });

      res.json({
        message: 'Route price list fetched successfully',
        data: serializeRoutePriceList(routePriceList),
      });
    } catch (error: any) {
      console.error('Get RoutePriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateRoutePriceList(req: any, res: any) {
    try {
      const { id } = req.params;

      const existing = await prisma.route_pricelists.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Route price list not found' });

      const data = req.body;

      const updated = await prisma.route_pricelists.update({
        where: { id: Number(id) },
        data: {
          route_id: data.route_id ?? existing.route_id,
          pricelist_id: data.pricelist_id ?? existing.pricelist_id,
          is_active: data.is_active ?? existing.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
          log_inst: data.log_inst ?? existing.log_inst,
        },
        include: { route_pricelist: true },
      });

      res.json({
        message: 'Route price list updated successfully',
        data: serializeRoutePriceList(updated),
      });
    } catch (error: any) {
      console.error('Update RoutePriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE
  async deleteRoutePriceList(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.route_pricelists.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Route price list not found' });

      await prisma.route_pricelists.delete({ where: { id: Number(id) } });

      res.json({ message: 'Route price list deleted successfully' });
    } catch (error: any) {
      console.error('Delete RoutePriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
