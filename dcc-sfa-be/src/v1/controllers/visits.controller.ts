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
    code: string;
    type?: string | null;
    contact_person?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    outstanding_amount: number;
    credit_limit: number;
    is_active: string;
  } | null;
  salesperson?: { id: number; name: string; email: string } | null;
  route?: { id: number; name: string; code: string } | null;
  zone?: { id: number; name: string; code: string } | null;
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
        code: visit.visit_customers.code,
        type: visit.visit_customers.type,
        contact_person: visit.visit_customers.contact_person,
        phone_number: visit.visit_customers.phone_number,
        email: visit.visit_customers.email,
        address: visit.visit_customers.address,
        city: visit.visit_customers.city,
        state: visit.visit_customers.state,
        zipcode: visit.visit_customers.zipcode,
        outstanding_amount: visit.visit_customers.outstanding_amount,
        credit_limit: visit.visit_customers.credit_limit,
        is_active: visit.visit_customers.is_active,
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
    ? {
        id: visit.visit_routes.id,
        name: visit.visit_routes.name,
        code: visit.visit_routes.code,
      }
    : null,
  zone: visit.visit_zones
    ? {
        id: visit.visit_zones.id,
        name: visit.visit_zones.name,
        code: visit.visit_zones.code,
      }
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
      console.log('Request Query:', req.query);
      console.log('Request User:', req.user);

      const {
        page,
        limit,
        search,
        sales_person_id,
        status,
        isActive,
        startDate,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(limit as string, 10) || 10)
      );
      const searchLower = search ? (search as string).toLowerCase().trim() : '';

      console.log('Parsed Pagination:', { pageNum, limitNum });
      console.log('Search Term:', searchLower);

      const allowedStatuses = [
        'pending',
        'completed',
        'cancelled',
        'in_progress',
      ];
      if (status && !allowedStatuses.includes(status as string)) {
        console.log('Invalid status:', status);
        return res.status(400).json({ message: 'Invalid status value' });
      }

      if (isActive && !['Y', 'N'].includes(isActive as string)) {
        console.log('Invalid isActive:', isActive);
        return res.status(400).json({ message: 'Invalid isActive value' });
      }

      const filters: any = {};
      const userRole = req.user?.role?.toLowerCase();
      const userId = req.user?.id;

      console.log('User Role:', userRole, 'User ID:', userId);

      if (userRole === 'technician') {
        console.log('Applying Technician filters - inspection visits only');
        filters.sales_person_id = userId;
        filters.cooler_inspections = {
          some: {},
        };
        console.log('Technician filters:', filters);
      } else if (userRole === 'salesman' || userRole === 'salesperson') {
        console.log(
          'Applying Salesman/Salesperson filters - sales visits only'
        );
        filters.sales_person_id = userId;
        filters.OR = [
          { purpose: { contains: 'sales' } },
          { purpose: { contains: 'order' } },
          { purpose: { contains: 'follow_up' } },
          { purpose: { contains: 'new_customer' } },
        ];
        console.log('Salesman filters:', filters);
      } else if (userRole === 'merchandiser') {
        console.log(
          'Applying Merchandiser filters - merchandising visits only'
        );
        filters.sales_person_id = userId;
        filters.OR = [
          { purpose: { contains: 'merchandising' } },
          { purpose: { contains: 'shelf_arrangement' } },
          { purpose: { contains: 'stock_check' } },
          { purpose: { contains: 'display_setup' } },
        ];
        console.log('Merchandiser filters:', filters);
      } else if (userRole === 'supervisor') {
        console.log('Applying Supervisor filters - own visits only');
        filters.sales_person_id = userId;
        console.log('Supervisor filters:', filters);
      } else if (userRole === 'admin' || userRole === 'manager') {
        console.log(
          'Admin/Manager role - can see all visits or filter by sales_person_id'
        );
        if (sales_person_id) {
          const salesPersonIdNum = parseInt(sales_person_id as string, 10);
          if (isNaN(salesPersonIdNum)) {
            console.log('Invalid sales_person_id (NaN):', sales_person_id);
            return res.status(400).json({ message: 'Invalid sales_person_id' });
          }
          filters.sales_person_id = salesPersonIdNum;
          console.log('Filtered by sales_person_id:', salesPersonIdNum);
        } else {
          console.log('No sales_person_id filter - showing all visits');
        }
      } else {
        console.log('Unknown role, restricting to own data');
        filters.sales_person_id = parseInt(userId as string, 10);
      }

      if (startDate) {
        console.log('Processing startDate:', startDate);
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          console.log('Invalid date format:', startDate);
          return res.status(400).json({
            message: 'Invalid date format. Please use YYYY-MM-DD',
          });
        }

        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        end.setHours(23, 59, 59, 999);

        filters.visit_date = { gte: start, lte: end };
        console.log('Date range filter:', { start, end });
      }

      if (searchLower) {
        console.log('Applying search filter for term:', searchLower);
        const searchOr = [
          { purpose: { contains: searchLower } },
          { status: { contains: searchLower } },
          { visit_notes: { contains: searchLower } },
        ];

        console.log('Search OR conditions:', searchOr);

        if (filters.OR) {
          console.log('Combining search with existing OR filters');
          console.log('Existing OR:', filters.OR);
          filters.AND = [{ OR: filters.OR }, { OR: searchOr }];
          delete filters.OR;
          console.log('Combined AND filters:', filters.AND);
        } else {
          filters.OR = searchOr;
          console.log('Applied search OR filters');
        }
      }

      if (status) {
        console.log('Applying status filter:', status);
        filters.status = status as string;
      }

      if (isActive) {
        console.log('Applying isActive filter:', isActive);
        filters.is_active = isActive as string;
      }

      console.log(JSON.stringify(filters, null, 2));

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
          cooler_inspections: true,
        },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const [totalVisits, activeVisits, inactiveVisits, newVisitsThisMonth] =
        await Promise.all([
          prisma.visits.count({ where: filters }),
          prisma.visits.count({ where: { ...filters, is_active: 'Y' } }),
          prisma.visits.count({ where: { ...filters, is_active: 'N' } }),
          prisma.visits.count({
            where: {
              ...filters,
              createdate: { gte: startOfMonth, lte: endOfMonth },
            },
          }),
        ]);

      console.log('Statistics:', {
        totalVisits,
        activeVisits,
        inactiveVisits,
        newVisitsThisMonth,
      });

      const serializedData = data.map((visit: any) => serializeVisit(visit));

      res.success(
        'Visits retrieved successfully',
        serializedData,
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
