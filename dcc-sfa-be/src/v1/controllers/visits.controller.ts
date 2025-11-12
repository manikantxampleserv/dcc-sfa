import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface VisitSerialized {
  id: number;
  customer_id: number;
  sales_person_id: number;
  route_id?: number | null;
  zones_id?: number | null;
  visit_date?: Date | null;
  visit_time?: string | null;
  purpose?: string | null;
  status?: string | null;
  start_time?: Date | null;
  end_time?: Date | null;
  duration?: number | null;
  start_latitude?: string | null;
  start_longitude?: string | null;
  end_latitude?: string | null;
  end_longitude?: string | null;
  check_in_time?: Date | null;
  check_out_time?: Date | null;
  orders_created?: number | null;
  amount_collected?: string | null;
  visit_notes?: string | null;
  customer_feedback?: string | null;
  next_visit_date?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer?: {
    id: number;
    name: string;
    outstanding_amount: number;
    credit_limit: number;
  } | null;
  salesperson?: { id: number; name: string; email: string } | null;
  route?: { id: number; name: string } | null;
  zone?: { id: number; name: string } | null;
}

const serializeVisit = (visit: any): VisitSerialized => ({
  id: visit.id,
  customer_id: visit.customer_id,
  sales_person_id: visit.sales_person_id,
  route_id: visit.route_id,
  zones_id: visit.zones_id,
  visit_date: visit.visit_date,
  visit_time: visit.visit_time,
  purpose: visit.purpose,
  status: visit.status,
  start_time: visit.start_time,
  end_time: visit.end_time,
  duration: visit.duration,
  start_latitude: visit.start_latitude,
  start_longitude: visit.start_longitude,
  end_latitude: visit.end_latitude,
  end_longitude: visit.end_longitude,
  check_in_time: visit.check_in_time,
  check_out_time: visit.check_out_time,
  orders_created: visit.orders_created,
  amount_collected: visit.amount_collected,
  visit_notes: visit.visit_notes,
  customer_feedback: visit.customer_feedback,
  next_visit_date: visit.next_visit_date,
  is_active: visit.is_active,
  createdate: visit.createdate,
  createdby: visit.createdby,
  updatedate: visit.updatedate,
  updatedby: visit.updatedby,
  log_inst: visit.log_inst,
  customer: visit.visit_customers
    ? {
        id: visit.visit_customers.id,
        name: visit.visit_customers.name,
        outstanding_amount: visit.visit_customers.outstanding_amount,
        credit_limit: visit.visit_customers.credit_limit,
      }
    : null,
  salesperson: visit.visits_salesperson
    ? {
        id: visit.visits_salesperson.id,
        name: visit.visits_salesperson.name,
        email: visit.visits_salesperson.email,
      }
    : null,
  route: visit.visit_routes
    ? { id: visit.visit_routes.id, name: visit.visit_routes.name }
    : null,
  zone: visit.visit_zones
    ? { id: visit.visit_zones.id, name: visit.visit_zones.name }
    : null,
});

export const visitsController = {
  async createVisits(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.customer_id || !data.sales_person_id) {
        return res
          .status(400)
          .json({ message: 'Customer ID and Sales Person ID are required' });
      }

      const processedData = {
        ...data,
        visit_date: data.visit_date ? new Date(data.visit_date) : undefined,
        start_time: data.start_time ? new Date(data.start_time) : undefined,
        end_time: data.end_time ? new Date(data.end_time) : undefined,
        check_in_time: data.check_in_time
          ? new Date(data.check_in_time)
          : undefined,
        check_out_time: data.check_out_time
          ? new Date(data.check_out_time)
          : undefined,
        next_visit_date: data.next_visit_date
          ? new Date(data.next_visit_date)
          : undefined,
      };

      const visit = await prisma.visits.create({
        data: {
          ...processedData,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          visit_customers: true,
          visits_salesperson: true,
          visit_routes: true,
          visit_zones: true,
        },
      });

      res.status(201).json({
        message: 'Visit created successfully',
        data: serializeVisit(visit),
      });
    } catch (error: any) {
      console.error('Create Visit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // async getAllVisits(req: any, res: any) {
  //   try {
  //     const { page, limit, search } = req.query;
  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 10;
  //     const searchLower = search ? (search as string).toLowerCase() : '';

  //     const filters: any = {
  //       ...(search && {
  //         OR: [
  //           { purpose: { contains: searchLower } },
  //           { status: { contains: searchLower } },
  //         ],
  //       }),
  //     };

  //     const { data, pagination } = await paginate({
  //       model: prisma.visits,
  //       filters,
  //       page: pageNum,
  //       limit: limitNum,
  //       orderBy: { createdate: 'desc' },
  //       include: {
  //         visit_customers: true,
  //         visits_salesperson: true,
  //         visit_routes: true,
  //         visit_zones: true,
  //       },
  //     });

  //     const totalVisits = await prisma.visits.count();
  //     const activeVisits = await prisma.visits.count({
  //       where: { is_active: 'Y' },
  //     });
  //     const inactiveVisits = await prisma.visits.count({
  //       where: { is_active: 'N' },
  //     });

  //     const now = new Date();
  //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  //     const newVisitsThisMonth = await prisma.visits.count({
  //       where: { createdate: { gte: startOfMonth, lte: endOfMonth } },
  //     });
  //     res.success(
  //       'Visits retrieved successfully',
  //       data.map((visit: any) => serializeVisit(visit)),
  //       200,
  //       pagination,
  //       {
  //         total_visits: totalVisits,
  //         active_visits: activeVisits,
  //         inactive_visits: inactiveVisits,
  //         new_visits: newVisitsThisMonth,
  //       }
  //     );
  //   } catch (error: any) {
  //     console.log('Get Visits Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  async getAllVisits(req: any, res: any) {
    try {
      const { page, limit, search, sales_person_id, status, isActive } =
        req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {};

      if (search) {
        filters.OR = [
          { purpose: { contains: searchLower } },
          { status: { contains: searchLower } },
        ];
      }

      if (sales_person_id) {
        filters.sales_person_id = parseInt(sales_person_id as string, 10);
      }

      if (status) {
        filters.status = status as string;
      }

      if (isActive) {
        filters.is_active = isActive as string;
      }

      const { data, pagination } = await paginate({
        model: prisma.visits,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          visit_customers: true,
          visits_salesperson: true,
          visit_routes: true,
          visit_zones: true,
        },
      });

      const totalVisits = await prisma.visits.count();
      const activeVisits = await prisma.visits.count({
        where: { is_active: 'Y' },
      });
      const inactiveVisits = await prisma.visits.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const newVisitsThisMonth = await prisma.visits.count({
        where: { createdate: { gte: startOfMonth, lte: endOfMonth } },
      });

      res.success(
        'Visits retrieved successfully',
        data.map((visit: any) => serializeVisit(visit)),
        200,
        pagination,
        {
          total_visits: totalVisits,
          active_visits: activeVisits,
          inactive_visits: inactiveVisits,
          new_visits: newVisitsThisMonth,
        }
      );
    } catch (error: any) {
      console.log('Get Visits Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  async getVisitsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const visit = await prisma.visits.findUnique({
        where: { id: Number(id) },
        include: {
          visit_customers: true,
          visits_salesperson: true,
          visit_routes: true,
          visit_zones: true,
        },
      });
      if (!visit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      res.status(200).json({
        message: 'Visit retrieved successfully',
        data: serializeVisit(visit),
      });
    } catch (error: any) {
      console.error('Get Visit Error:', error);

      res.status(500).json({ message: error.message });
    }
  },

  async updateVisits(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingVisit = await prisma.visits.findUnique({
        where: { id: Number(id) },
      });
      if (!existingVisit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      const processedData = {
        ...req.body,
        visit_date: req.body.visit_date
          ? new Date(req.body.visit_date)
          : undefined,
        start_time: req.body.start_time
          ? new Date(req.body.start_time)
          : undefined,
        end_time: req.body.end_time ? new Date(req.body.end_time) : undefined,
        check_in_time: req.body.check_in_time
          ? new Date(req.body.check_in_time)
          : undefined,
        check_out_time: req.body.check_out_time
          ? new Date(req.body.check_out_time)
          : undefined,
        next_visit_date: req.body.next_visit_date
          ? new Date(req.body.next_visit_date)
          : undefined,
      };

      const data = {
        ...processedData,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };
      const visit = await prisma.visits.update({
        where: { id: Number(id) },
        data,
        include: {
          visit_customers: true,
          visits_salesperson: true,
        },
      });
      res.status(200).json({
        message: 'Visit updated successfully',
        data: serializeVisit(visit),
      });
    } catch (error: any) {
      console.log('Update Visit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  async deleteVisits(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingVisit = await prisma.visits.findUnique({
        where: { id: Number(id) },
      });
      if (!existingVisit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      await prisma.visits.delete({ where: { id: Number(id) } });
    } catch (error: any) {
      console.log('Delete Visit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
