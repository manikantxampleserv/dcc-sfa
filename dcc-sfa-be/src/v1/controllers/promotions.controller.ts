import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface PromotionSerialized {
  id: number;
  name: string;
  code: string;
  type: string;
  description?: string | null;
  start_date: Date;
  end_date: Date;
  depot_id?: number | null;
  zone_id?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  promotion_depots?: { id: number; name: string; code: string } | null;
  promotion_zones?: { id: number; name: string } | null;
}
const generatePromotionCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastZone = await prisma.zones.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastZone && lastZone.code) {
    const match = lastZone.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const serializePromotion = (p: any): PromotionSerialized => ({
  id: p.id,
  name: p.name,
  code: p.code,
  type: p.type,
  description: p.description,
  start_date: p.start_date,
  end_date: p.end_date,
  depot_id: p.depot_id,
  zone_id: p.zone_id,
  is_active: p.is_active,
  createdate: p.createdate,
  createdby: p.createdby,
  updatedate: p.updatedate,
  updatedby: p.updatedby,
  log_inst: p.log_inst,
  promotion_depots: p.promotion_depots
    ? {
        id: p.promotion_depots.id,
        name: p.promotion_depots.name,
        code: p.promotion_depots.code,
      }
    : null,
  promotion_zones: p.promotion_zones
    ? { id: p.promotion_zones.id, name: p.promotion_zones.name }
    : null,
});

export const promotionsController = {
  async createPromotions(req: Request, res: Response) {
    try {
      const data = req.body;
      const code = await generatePromotionCode(data.name);

      const promotion = await prisma.promotions.create({
        data: {
          ...data,
          code,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          promotion_depots: true,
          promotion_zones: true,
        },
      });

      res.status(201).json({
        message: 'Promotion created successfully',
        data: serializePromotion(promotion),
      });
    } catch (error: any) {
      console.error('Create Promotion Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllPromotions(req: any, res: any) {
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
            { type: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.promotions,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { promotion_depots: true, promotion_zones: true },
      });

      const totatalPromotions = await prisma.promotions.count();
      const activePromotions = await prisma.promotions.count({
        where: { is_active: 'Y' },
      });
      const inactivePromotions = await prisma.promotions.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const newPromotionsThisMonth = await prisma.promotions.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Promotions retrieved successfully',
        data.map((p: any) => serializePromotion(p)),
        200,
        pagination,
        {
          totatalPromotions,
          activePromotions,
          inactivePromotions,
          newPromotionsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Promotions Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPromotionsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promotion = await prisma.promotions.findUnique({
        where: { id: Number(id) },
        include: { promotion_depots: true, promotion_zones: true },
      });

      if (!promotion)
        return res.status(404).json({ message: 'Promotion not found' });

      res.status(200).json({
        message: 'Promotion fetched successfully',
        data: serializePromotion(promotion),
      });
    } catch (error: any) {
      console.error('Get Promotion Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updatePromotions(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingPromotion = await prisma.promotions.findUnique({
        where: { id: Number(id) },
      });
      if (!existingPromotion)
        return res.status(404).json({ message: 'Promotion not found' });

      const data = {
        ...req.body,
        start_date: req.body.start_date
          ? new Date(req.body.start_date)
          : undefined,
        end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };

      const promotion = await prisma.promotions.update({
        where: { id: Number(id) },
        data,
        include: { promotion_depots: true, promotion_zones: true },
      });

      res.json({
        message: 'Promotion updated successfully',
        data: serializePromotion(promotion),
      });
    } catch (error: any) {
      console.error('Update Promotion Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deletePromotions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingPromotion = await prisma.promotions.findUnique({
        where: { id: Number(id) },
      });
      if (!existingPromotion)
        return res.status(404).json({ message: 'Promotion not found' });

      await prisma.promotions.delete({ where: { id: Number(id) } });

      res.json({ message: 'Promotion deleted successfully' });
    } catch (error: any) {
      console.error('Delete Promotion Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
