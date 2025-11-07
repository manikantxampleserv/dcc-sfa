// import { PrismaClient } from '@prisma/client';
// import { Request, Response } from 'express';
// import { paginate } from '../../utils/paginate';

// const prisma = new PrismaClient();

// interface RouteSerialized {
//   id: number;
//   parent_id: number;
//   depot_id: number;
//   name: string;
//   code: string;
//   description?: string | null;
//   salesperson_id?: number | null;
//   route_type_id: number;
//   route_type?: string | null;
//   outlet_group?: string | null;
//   start_location?: string | null;
//   end_location?: string | null;
//   estimated_distance?: string | null;
//   estimated_time?: number | null;
//   is_active: string;
//   createdate?: Date | null;
//   createdby: number;
//   updatedate?: Date | null;
//   updatedby?: number | null;
//   log_inst?: number | null;
//   customer_routes?: { id: number; name: string; code: string }[];
//   routes_depots?: { id: number; name: string; code: string };
//   routes_zones?: { id: number; name: string; code: string };
//   routes_salesperson?: { id: number; name: string; email: string } | null;
//   routes_route_type?: { id: number; name: string };
//   visit_routes?: { id: number }[];
// }

// const generateRoutesCode = async (name: string) => {
//   const prefix = name.slice(0, 3).toUpperCase();
//   const lastRoutes = await prisma.routes.findFirst({
//     orderBy: { id: 'desc' },
//     select: { code: true },
//   });

//   let newNumber = 1;
//   if (lastRoutes && lastRoutes.code) {
//     const match = lastRoutes.code.match(/(\d+)$/);
//     if (match) {
//       newNumber = parseInt(match[1], 10) + 1;
//     }
//   }
//   const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

//   return code;
// };

// const serializeRoute = (route: any): RouteSerialized => ({
//   id: route.id,
//   parent_id: route.parent_id,
//   depot_id: route.depot_id,
//   name: route.name,
//   code: route.code,
//   description: route.description,
//   salesperson_id: route.salesperson_id,
//   route_type_id: route.route_type_id,
//   route_type: route.route_type,
//   outlet_group: route.outlet_group,
//   start_location: route.start_location,
//   end_location: route.end_location,
//   estimated_distance: route.estimated_distance?.toString() || null,
//   estimated_time: route.estimated_time,
//   is_active: route.is_active,
//   createdate: route.createdate,
//   createdby: route.createdby,
//   updatedate: route.updatedate,
//   updatedby: route.updatedby,
//   log_inst: route.log_inst,
//   customer_routes:
//     route.customer_routes?.map((c: any) => ({
//       id: c.id,
//       name: c.name,
//       code: c.code,
//     })) || [],
//   routes_depots: route.routes_depots
//     ? {
//         id: route.routes_depots.id,
//         name: route.routes_depots.name,
//         code: route.routes_depots.code,
//       }
//     : undefined,
//   routes_zones: route.routes_zones
//     ? {
//         id: route.routes_zones.id,
//         name: route.routes_zones.name,
//         code: route.routes_zones.code,
//       }
//     : undefined,
//   routes_salesperson: route.routes_salesperson
//     ? {
//         id: route.routes_salesperson.id,
//         name: route.routes_salesperson.name,
//         email: route.routes_salesperson.email,
//       }
//     : null,
//   routes_route_type: route.routes_route_type
//     ? {
//         id: route.routes_route_type.id,
//         name: route.routes_route_type.name,
//       }
//     : undefined,
//   visit_routes: route.visit_routes?.map((v: any) => ({ id: v.id })) || [],
// });

// export const routesController = {
//   async createRoutes(req: Request, res: Response) {
//     try {
//       const data = req.body;

//       if (!data.name) {
//         return res.status(400).json({ message: 'Route name is required' });
//       }
//       if (!data.depot_id) {
//         return res.status(400).json({ message: 'Depot ID is required' });
//       }
//       if (!data.parent_id) {
//         return res
//           .status(400)
//           .json({ message: 'Parent ID (Zone) is required' });
//       }
//       if (!data.route_type_id) {
//         return res.status(400).json({ message: 'Route type ID is required' });
//       }

//       const newCode = await generateRoutesCode(data.name);

//       const createData: any = {
//         name: data.name,
//         code: newCode,
//         description: data.description,
//         route_type: data.route_type,
//         outlet_group: data.outlet_group,
//         start_location: data.start_location,
//         end_location: data.end_location,
//         estimated_distance: data.estimated_distance,
//         estimated_time: data.estimated_time,
//         is_active: data.is_active || 'Y',
//         createdate: new Date(),
//         createdby: req.user?.id || 1,
//         log_inst: data.log_inst || 1,
//         routes_depots: {
//           connect: { id: data.depot_id },
//         },
//         routes_zones: {
//           connect: { id: data.parent_id },
//         },
//         routes_route_type: {
//           connect: { id: data.route_type_id },
//         },
//       };

//       if (data.salesperson_id) {
//         createData.routes_salesperson = {
//           connect: { id: data.salesperson_id },
//         };
//       }

//       const route = await prisma.routes.create({
//         data: createData,
//         include: {
//           customer_routes: true,
//           routes_depots: true,
//           routes_zones: true,
//           routes_salesperson: true,
//           routes_route_type: true,
//           visit_routes: true,
//         },
//       });

//       res.status(201).json({
//         message: 'Route created successfully',
//         data: serializeRoute(route),
//       });
//     } catch (error: any) {
//       console.error('Create Route Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async getRoutes(req: any, res: any) {
//     try {
//       const { page, limit, search, salesperson_id, depot_id, parent_id } =
//         req.query;
//       const pageNum = parseInt(page as string, 10) || 1;
//       const limitNum = parseInt(limit as string, 10) || 10;
//       const searchLower = search ? (search as string).toLowerCase() : '';

//       const filters: any = {
//         ...(search && {
//           OR: [
//             { name: { contains: searchLower } },
//             { code: { contains: searchLower } },
//             { description: { contains: searchLower } },
//           ],
//         }),
//         ...(salesperson_id && {
//           salesperson_id: parseInt(salesperson_id as string, 10),
//         }),
//         ...(depot_id && { depot_id: parseInt(depot_id as string, 10) }),
//         ...(parent_id && { parent_id: parseInt(parent_id as string, 10) }),
//       };

//       const { data, pagination } = await paginate({
//         model: prisma.routes,
//         filters,
//         page: pageNum,
//         limit: limitNum,
//         orderBy: { createdate: 'desc' },
//         include: {
//           customer_routes: true,
//           routes_depots: true,
//           routes_zones: true,
//           routes_salesperson: true,
//           routes_route_type: true,
//           visit_routes: true,
//         },
//       });

//       const totalRoutes = await prisma.routes.count();
//       const activeRoutes = await prisma.routes.count({
//         where: { is_active: 'Y' },
//       });
//       const inactiveRoutes = await prisma.routes.count({
//         where: { is_active: 'N' },
//       });

//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       const routesThisMonth = await prisma.routes.count({
//         where: {
//           createdate: {
//             gte: startOfMonth,
//             lte: endOfMonth,
//           },
//         },
//       });

//       res.success(
//         'Routes retrieved successfully',
//         data.map((route: any) => serializeRoute(route)),
//         200,
//         pagination,
//         {
//           total_routes: totalRoutes,
//           active_routes: activeRoutes,
//           inactive_routes: inactiveRoutes,
//           routes_this_month: routesThisMonth,
//         }
//       );
//     } catch (error: any) {
//       console.error('Get Routes Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async getRoutesById(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const route = await prisma.routes.findUnique({
//         where: { id: Number(id) },
//         include: {
//           customer_routes: true,
//           routes_depots: true,
//           routes_zones: true,
//           routes_salesperson: true,
//           routes_route_type: true,
//           visit_routes: true,
//         },
//       });

//       if (!route) {
//         return res.status(404).json({ message: 'Route not found' });
//       }

//       res.json({
//         message: 'Route fetched successfully',
//         data: serializeRoute(route),
//       });
//     } catch (error: any) {
//       console.error('Get Route Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async updateRoutes(req: any, res: any) {
//     try {
//       const { id } = req.params;
//       const existingRoute = await prisma.routes.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!existingRoute) {
//         return res.status(404).json({ message: 'Route not found' });
//       }

//       const data = req.body;

//       const updateData: any = {
//         name: data.name,
//         description: data.description,
//         route_type: data.route_type,
//         outlet_group: data.outlet_group,
//         start_location: data.start_location,
//         end_location: data.end_location,
//         estimated_distance: data.estimated_distance,
//         estimated_time: data.estimated_time,
//         is_active: data.is_active,
//         updatedate: new Date(),
//         updatedby: req.user?.id || 1,
//       };

//       if (data.depot_id !== undefined) {
//         updateData.routes_depots = {
//           connect: { id: data.depot_id },
//         };
//       }

//       if (data.parent_id !== undefined) {
//         updateData.routes_zones = {
//           connect: { id: data.parent_id },
//         };
//       }

//       if (data.route_type_id !== undefined) {
//         updateData.routes_route_type = {
//           connect: { id: data.route_type_id },
//         };
//       }

//       if (data.salesperson_id !== undefined) {
//         if (data.salesperson_id === null) {
//           updateData.routes_salesperson = { disconnect: true };
//         } else {
//           updateData.routes_salesperson = {
//             connect: { id: data.salesperson_id },
//           };
//         }
//       }

//       const route = await prisma.routes.update({
//         where: { id: Number(id) },
//         data: updateData,
//         include: {
//           customer_routes: true,
//           routes_depots: true,
//           routes_zones: true,
//           routes_salesperson: true,
//           routes_route_type: true,
//           visit_routes: true,
//         },
//       });

//       res.json({
//         message: 'Route updated successfully',
//         data: serializeRoute(route),
//       });
//     } catch (error: any) {
//       console.error('Update Route Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async deleteRoutes(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const existingRoute = await prisma.routes.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!existingRoute) {
//         return res.status(404).json({ message: 'Route not found' });
//       }

//       await prisma.routes.delete({ where: { id: Number(id) } });

//       res.json({ message: 'Route deleted successfully' });
//     } catch (error: any) {
//       console.error('Delete Route Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },
// };

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
  customer_routes?: { id: number; name: string; code: string }[];
  routes_depots?: { id: number; name: string; code: string };
  routes_zones?: { id: number; name: string; code: string };
  routes_salesperson?: { id: number; name: string; email: string } | null;
  routes_route_type?: { id: number; name: string };
  visit_routes?: { id: number }[];
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
  visit_routes: route.visit_routes?.map((v: any) => ({ id: v.id })) || [],
});

export const routesController = {
  async bulkUpsertRoutes(req: any, res: any) {
    try {
      const routesData = req.body.routes;
      const userId = req.user?.id || 1;

      if (!Array.isArray(routesData) || routesData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request. Expected an array of routes',
        });
      }

      const allowedFields = [
        'name',
        'code',
        'description',
        'route_type',
        'outlet_group',
        'start_location',
        'end_location',
        'estimated_distance',
        'estimated_time',
        'is_active',
        'log_inst',
      ];

      const relationFields = [
        'parent_id',
        'depot_id',
        'route_type_id',
        'salesperson_id',
      ];
      const systemFields = [
        'id',
        'createdate',
        'createdby',
        'updatedate',
        'updatedby',
      ];

      const validationErrors = [];

      for (let i = 0; i < routesData.length; i++) {
        const route = routesData[i];

        if (!route.name) {
          validationErrors.push({
            index: i,
            route: route,
            reason: 'Route name is required',
          });
        }

        if (!route.depot_id) {
          validationErrors.push({
            index: i,
            route: route,
            reason: 'Depot ID is required',
          });
        }

        if (!route.parent_id) {
          validationErrors.push({
            index: i,
            route: route,
            reason: 'Parent ID (Zone) is required',
          });
        }

        if (!route.route_type_id) {
          validationErrors.push({
            index: i,
            route: route,
            reason: 'Route type ID is required',
          });
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
      }

      const results = {
        created: [] as any[],
        updated: [] as any[],
        skipped: [] as any[],
        errors: [] as any[],
      };

      for (const routeData of routesData) {
        try {
          const {
            route_type_id,
            parent_id,
            depot_id,
            salesperson_id,
            ...restData
          } = routeData;

          const cleanData: any = {};
          Object.keys(restData).forEach(key => {
            if (allowedFields.includes(key)) {
              cleanData[key] = restData[key];
            }
          });

          const ignoredFields = Object.keys(routeData).filter(
            key =>
              !allowedFields.includes(key) &&
              !relationFields.includes(key) &&
              !systemFields.includes(key)
          );

          if (ignoredFields.length > 0) {
            console.log(`Ignored fields for ${routeData.name}:`, ignoredFields);
          }

          const whereConditions: any = {
            AND: [{ name: cleanData.name }, { parent_id: parent_id }],
          };

          const existingRoute = await prisma.routes.findFirst({
            where: whereConditions,
          });

          if (existingRoute) {
            const updateData: any = {
              ...cleanData,
              updatedate: new Date(),
              updatedby: userId,
            };

            if (depot_id !== undefined) {
              updateData.routes_depots = {
                connect: { id: depot_id },
              };
            }

            if (parent_id !== undefined) {
              updateData.routes_zones = {
                connect: { id: parent_id },
              };
            }

            if (route_type_id !== undefined) {
              updateData.routes_route_type = {
                connect: { id: route_type_id },
              };
            }

            if (salesperson_id !== undefined) {
              if (salesperson_id === null) {
                updateData.routes_salesperson = { disconnect: true };
              } else {
                updateData.routes_salesperson = {
                  connect: { id: salesperson_id },
                };
              }
            }

            const updatedRoute = await prisma.routes.update({
              where: { id: existingRoute.id },
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

            results.updated.push(serializeRoute(updatedRoute));
          } else {
            if (!cleanData.code) {
              cleanData.code = await generateRoutesCode(cleanData.name);
            }

            const createData: any = {
              ...cleanData,
              createdby: userId,
              log_inst: routeData.log_inst || 1,
              createdate: new Date(),
              routes_depots: {
                connect: { id: depot_id },
              },
              routes_zones: {
                connect: { id: parent_id },
              },
              routes_route_type: {
                connect: { id: route_type_id },
              },
            };

            if (salesperson_id !== undefined && salesperson_id !== null) {
              createData.routes_salesperson = {
                connect: { id: salesperson_id },
              };
            }

            const newRoute = await prisma.routes.create({
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

            results.created.push(serializeRoute(newRoute));
          }
        } catch (error: any) {
          console.error('Error processing route:', error);

          results.errors.push({
            route: {
              name: routeData.name,
              parent_id: routeData.parent_id,
            },
            reason: error.message || 'Unknown error occurred',
            error_code: error.code,
          });

          continue;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Bulk upsert completed',
        summary: {
          total: routesData.length,
          created: results.created.length,
          updated: results.updated.length,
          skipped: results.skipped.length,
          errors: results.errors.length,
        },
        data: results,
      });
    } catch (error: any) {
      console.error('Bulk Upsert Routes Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

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
          visit_routes: true,
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
