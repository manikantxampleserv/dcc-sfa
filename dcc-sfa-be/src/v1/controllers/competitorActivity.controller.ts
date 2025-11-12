import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CompetitorActivitySerialized {
  id: number;
  customer_id: number;
  visit_id?: number | null;
  brand_name: string;
  product_name?: string | null;
  observed_price?: number | null;
  promotion_details?: string | null;
  visibility_score?: number | null;
  image_url?: string | null;
  remarks?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  competitor_activity_customers?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  visits?: {
    id: number;
    visit_date: Date;
    purpose?: string | null;
  } | null;
}

const serializeCompetitorActivity = (
  activity: any
): CompetitorActivitySerialized => ({
  id: activity.id,
  customer_id: activity.customer_id,
  visit_id: activity.visit_id,
  brand_name: activity.brand_name,
  product_name: activity.product_name,
  observed_price: activity.observed_price,
  promotion_details: activity.promotion_details,
  visibility_score: activity.visibility_score,
  image_url: activity.image_url,
  remarks: activity.remarks,
  is_active: activity.is_active,
  createdate: activity.createdate,
  createdby: activity.createdby,
  updatedate: activity.updatedate,
  updatedby: activity.updatedby,
  competitor_activity_customers: activity.competitor_activity_customers,
  visits: activity.visits,
});

export const competitorActivityController = {
  async createCompetitorActivity(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.brand_name) {
        return res.status(400).json({ message: 'Brand name is required' });
      }
      if (!data.customer_id) {
        return res.status(400).json({ message: 'Customer ID is required' });
      }

      const competitorActivity = await prisma.competitor_activity.create({
        data: {
          ...data,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          competitor_activity_customers: {
            select: { id: true, name: true, code: true },
          },
          visits: {
            select: { id: true, visit_date: true, purpose: true },
          },
        },
      });

      res.status(201).json({
        message: 'Competitor activity created successfully',
        data: serializeCompetitorActivity(competitorActivity),
      });
    } catch (error: any) {
      console.error('Create Competitor Activity Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCompetitorActivities(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        status,
        customer_id,
        brand_name,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(status && {
          is_active: String(status).toLowerCase() === 'active' ? 'Y' : 'N',
        }),
        ...(search && {
          OR: [
            { brand_name: { contains: searchLower } },
            { product_name: { contains: searchLower } },
            { promotion_details: { contains: searchLower } },
            { remarks: { contains: searchLower } },
          ],
        }),
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(brand_name && { brand_name: brand_name as string }),
      };

      const totalActivities = await prisma.competitor_activity.count();
      const activeActivities = await prisma.competitor_activity.count({
        where: { is_active: 'Y' },
      });
      const inactiveActivities = await prisma.competitor_activity.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newActivitiesThisMonth = await prisma.competitor_activity.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_records: totalActivities,
        active_records: activeActivities,
        inactive_records: inactiveActivities,
        this_month_records: newActivitiesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.competitor_activity,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          competitor_activity_customers: {
            select: { id: true, name: true, code: true },
          },
          visits: {
            select: { id: true, visit_date: true, purpose: true },
          },
        },
      });

      res.json({
        success: true,
        message: 'Competitor activities retrieved successfully',
        data: data.map((d: any) => serializeCompetitorActivity(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Competitor Activities Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getCompetitorActivityById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const competitorActivity = await prisma.competitor_activity.findUnique({
        where: { id: Number(id) },
        include: {
          competitor_activity_customers: {
            select: { id: true, name: true, code: true },
          },
          visits: {
            select: { id: true, visit_date: true, purpose: true },
          },
        },
      });

      if (!competitorActivity) {
        return res
          .status(404)
          .json({ message: 'Competitor activity not found' });
      }

      res.json({
        message: 'Competitor activity fetched successfully',
        data: serializeCompetitorActivity(competitorActivity),
      });
    } catch (error: any) {
      console.error('Get Competitor Activity Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCompetitorActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingActivity = await prisma.competitor_activity.findUnique({
        where: { id: Number(id) },
      });

      if (!existingActivity) {
        return res
          .status(404)
          .json({ message: 'Competitor activity not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const competitorActivity = await prisma.competitor_activity.update({
        where: { id: Number(id) },
        data,
        include: {
          competitor_activity_customers: {
            select: { id: true, name: true, code: true },
          },
          visits: {
            select: { id: true, visit_date: true, purpose: true },
          },
        },
      });

      res.json({
        message: 'Competitor activity updated successfully',
        data: serializeCompetitorActivity(competitorActivity),
      });
    } catch (error: any) {
      console.error('Update Competitor Activity Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCompetitorActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingActivity = await prisma.competitor_activity.findUnique({
        where: { id: Number(id) },
      });

      if (!existingActivity) {
        return res
          .status(404)
          .json({ message: 'Competitor activity not found' });
      }

      await prisma.competitor_activity.delete({ where: { id: Number(id) } });

      res.json({ message: 'Competitor activity deleted successfully' });
    } catch (error: any) {
      console.error('Delete Competitor Activity Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
