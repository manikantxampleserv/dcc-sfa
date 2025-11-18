import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface RouteSerialized {
  id: number;
  parent_id: number;
  depot_id: number;
  name: string;
  code: string;
  description?: string | null;
  salesperson_id?: number | null;
  route_type_id: number;
  route_type?: string | null;
  outlet_group?: string | null;
  start_location?: string | null;
  end_location?: string | null;
  estimated_distance?: string | null;
  estimated_time?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_routes?: Array<{
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
    is_active: string;
  }>;
  routes_depots?: { id: number; name: string; code: string };
  routes_zones?: { id: number; name: string; code: string };
  routes_salesperson?: { id: number; name: string; email: string } | null;
  routes_route_type?: { id: number; name: string };
  visit_routes?: Array<{
    id: number;
    customer_id: number;
    sales_person_id: number;
    visit_date?: Date | null;
    visit_time?: string | null;
    purpose?: string | null;
    status?: string | null;
    start_time?: Date | null;
    end_time?: Date | null;
    duration?: number | null;
    check_in_time?: Date | null;
    check_out_time?: Date | null;
    orders_created?: number | null;
    amount_collected?: string | null;
    visit_notes?: string | null;
    customer_feedback?: string | null;
    next_visit_date?: Date | null;
    is_active: string;
    createdate?: Date | null;
    visit_customers?: { id: number; name: string; code: string } | null;
    visits_salesperson?: { id: number; name: string; email: string } | null;
  }>;
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
  route_type_id: route.route_type_id,
  route_type: route.route_type,
  outlet_group: route.outlet_group,
  start_location: route.start_location,
  end_location: route.end_location,
  estimated_distance: route.estimated_distance?.toString() || null,
  estimated_time: route.estimated_time,
  is_active: route.is_active,
  createdate: route.createdate,
  createdby: route.createdby,
  updatedate: route.updatedate,
  updatedby: route.updatedby,
  log_inst: route.log_inst,
  customer_routes:
    route.customer_routes?.map((c: any) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      type: c.type,
      contact_person: c.contact_person,
      phone_number: c.phone_number,
      email: c.email,
      address: c.address,
      city: c.city,
      state: c.state,
      zipcode: c.zipcode,
      is_active: c.is_active,
    })) || [],
  routes_depots: route.routes_depots
    ? {
        id: route.routes_depots.id,
        name: route.routes_depots.name,
        code: route.routes_depots.code,
      }
    : undefined,
  routes_zones: route.routes_zones
    ? {
        id: route.routes_zones.id,
        name: route.routes_zones.name,
        code: route.routes_zones.code,
      }
    : undefined,
  routes_salesperson: route.routes_salesperson
    ? {
        id: route.routes_salesperson.id,
        name: route.routes_salesperson.name,
        email: route.routes_salesperson.email,
      }
    : null,
  routes_route_type: route.routes_route_type
    ? {
        id: route.routes_route_type.id,
        name: route.routes_route_type.name,
      }
    : undefined,
  visit_routes:
    route.visit_routes?.map((v: any) => ({
      id: v.id,
      customer_id: v.customer_id,
      sales_person_id: v.sales_person_id,
      visit_date: v.visit_date,
      visit_time: v.visit_time,
      purpose: v.purpose,
      status: v.status,
      start_time: v.start_time,
      end_time: v.end_time,
      duration: v.duration,
      check_in_time: v.check_in_time,
      check_out_time: v.check_out_time,
      orders_created: v.orders_created,
      amount_collected: v.amount_collected?.toString() || null,
      visit_notes: v.visit_notes,
      customer_feedback: v.customer_feedback,
      next_visit_date: v.next_visit_date,
      is_active: v.is_active,
      createdate: v.createdate,
      visit_customers: v.visit_customers
        ? {
            id: v.visit_customers.id,
            name: v.visit_customers.name,
            code: v.visit_customers.code,
          }
        : null,
      visits_salesperson: v.visits_salesperson
        ? {
            id: v.visits_salesperson.id,
            name: v.visits_salesperson.name,
            email: v.visits_salesperson.email,
          }
        : null,
    })) || [],
});

export const routesController = {
  async createRoutes(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.name) {
        return res.status(400).json({ message: 'Route name is required' });
      }
      if (!data.depot_id) {
        return res.status(400).json({ message: 'Depot ID is required' });
      }
      if (!data.parent_id) {
        return res
          .status(400)
          .json({ message: 'Parent ID (Zone) is required' });
      }
      if (!data.route_type_id) {
        return res.status(400).json({ message: 'Route type ID is required' });
      }

      const newCode = await generateRoutesCode(data.name);

      const createData: any = {
        name: data.name,
        code: newCode,
        description: data.description,
        route_type: data.route_type,
        outlet_group: data.outlet_group,
        start_location: data.start_location,
        end_location: data.end_location,
        estimated_distance: data.estimated_distance,
        estimated_time: data.estimated_time,
        is_active: data.is_active || 'Y',
        createdate: new Date(),
        createdby: req.user?.id || 1,
        log_inst: data.log_inst || 1,
        routes_depots: {
          connect: { id: data.depot_id },
        },
        routes_zones: {
          connect: { id: data.parent_id },
        },
        routes_route_type: {
          connect: { id: data.route_type_id },
        },
      };

      if (data.salesperson_id) {
        createData.routes_salesperson = {
          connect: { id: data.salesperson_id },
        };
      }

      const route = await prisma.routes.create({
        data: createData,
        include: {
          customer_routes: true,
          routes_depots: true,
          routes_zones: true,
          routes_salesperson: true,
          routes_route_type: true,
          visit_routes: true,
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
      const { page, limit, search, salesperson_id, depot_id, parent_id } =
        req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(salesperson_id && {
          salesperson_id: parseInt(salesperson_id as string, 10),
        }),
        ...(depot_id && { depot_id: parseInt(depot_id as string, 10) }),
        ...(parent_id && { parent_id: parseInt(parent_id as string, 10) }),
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
          routes_route_type: true,
          visit_routes: true,
        },
      });

      const totalRoutes = await prisma.routes.count();
      const activeRoutes = await prisma.routes.count({
        where: { is_active: 'Y' },
      });
      const inactiveRoutes = await prisma.routes.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const routesThisMonth = await prisma.routes.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Routes retrieved successfully',
        data.map((route: any) => serializeRoute(route)),
        200,
        pagination,
        {
          total_routes: totalRoutes,
          active_routes: activeRoutes,
          inactive_routes: inactiveRoutes,
          routes_this_month: routesThisMonth,
        }
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
          routes_route_type: true,
          visit_routes: {
            include: {
              visit_customers: true,
              visits_salesperson: true,
            },
            orderBy: {
              visit_date: 'desc',
            },
          },
        },
      });

      if (!route) {
        return res.status(404).json({ message: 'Route not found' });
      }

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

      if (!existingRoute) {
        return res.status(404).json({ message: 'Route not found' });
      }

      const data = req.body;

      const updateData: any = {
        name: data.name,
        description: data.description,
        route_type: data.route_type,
        outlet_group: data.outlet_group,
        start_location: data.start_location,
        end_location: data.end_location,
        estimated_distance: data.estimated_distance,
        estimated_time: data.estimated_time,
        is_active: data.is_active,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };

      if (data.depot_id !== undefined) {
        updateData.routes_depots = {
          connect: { id: data.depot_id },
        };
      }

      if (data.parent_id !== undefined) {
        updateData.routes_zones = {
          connect: { id: data.parent_id },
        };
      }

      if (data.route_type_id !== undefined) {
        updateData.routes_route_type = {
          connect: { id: data.route_type_id },
        };
      }

      if (data.salesperson_id !== undefined) {
        if (data.salesperson_id === null) {
          updateData.routes_salesperson = { disconnect: true };
        } else {
          updateData.routes_salesperson = {
            connect: { id: data.salesperson_id },
          };
        }
      }

      const route = await prisma.routes.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
          customer_routes: true,
          routes_depots: true,
          routes_zones: true,
          routes_salesperson: true,
          routes_route_type: true,
          visit_routes: true,
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

      if (!existingRoute) {
        return res.status(404).json({ message: 'Route not found' });
      }

      await prisma.routes.delete({ where: { id: Number(id) } });

      res.json({ message: 'Route deleted successfully' });
    } catch (error: any) {
      console.error('Delete Route Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
