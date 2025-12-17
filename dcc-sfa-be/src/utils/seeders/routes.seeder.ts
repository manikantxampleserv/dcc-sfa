import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockRoute {
  code: string;
  name?: string;
  description?: string;
  is_active: string;
}

const mockRoutes: MockRoute[] = [
  {
    code: 'TRK15A',
    name: 'Route TRK15A',
    description: 'Delivery route TRK15A',
    is_active: 'Y',
  },
  {
    code: 'TRK15B',
    name: 'Route TRK15B',
    description: 'Delivery route TRK15B',
    is_active: 'Y',
  },
  {
    code: 'TRK16A',
    name: 'Route TRK16A',
    description: 'Delivery route TRK16A',
    is_active: 'Y',
  },
  {
    code: 'TRK16B',
    name: 'Route TRK16B',
    description: 'Delivery route TRK16B',
    is_active: 'Y',
  },
  {
    code: 'TRK16C',
    name: 'Route TRK16C',
    description: 'Delivery route TRK16C',
    is_active: 'Y',
  },
  {
    code: 'TRK16D',
    name: 'Route TRK16D',
    description: 'Delivery route TRK16D',
    is_active: 'Y',
  },
  {
    code: 'TRK16E',
    name: 'Route TRK16E',
    description: 'Delivery route TRK16E',
    is_active: 'Y',
  },
  {
    code: 'TRK16F',
    name: 'Route TRK16F',
    description: 'Delivery route TRK16F',
    is_active: 'Y',
  },
  {
    code: 'TRK16G',
    name: 'Route TRK16G',
    description: 'Delivery route TRK16G',
    is_active: 'Y',
  },
];

export async function seedRoutes(): Promise<void> {
  try {
    const zones = await prisma.zones.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const depots = await prisma.depots.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (zones.length === 0) {
      logger.warn('No active zones found. Skipping routes seeding.');
      return;
    }

    if (depots.length === 0) {
      logger.warn('No active depots found. Skipping routes seeding.');
      return;
    }

    const salesPersonRole = await prisma.roles.findFirst({
      where: { name: 'Sales Person' },
    });

    const salespersons = await prisma.users.findMany({
      select: { id: true, name: true },
      where: {
        role_id: salesPersonRole?.id,
        is_active: 'Y',
      },
    });

    if (salespersons.length === 0) {
      const adminUser = await prisma.users.findFirst({
        where: { email: 'admin@dcc.com' },
        select: { id: true, name: true },
      });
      if (adminUser) {
        salespersons.push(adminUser);
      }
    }

    let defaultRouteType = await prisma.route_type.findFirst({
      where: { name: 'Standard' },
    });

    if (!defaultRouteType) {
      defaultRouteType = await prisma.route_type.create({
        data: {
          name: 'Standard',
          is_active: 'Y',
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        },
      });
    }

    const defaultDepot = depots[0];
    const defaultSalesperson = salespersons.length > 0 ? salespersons[0] : null;

    let routesCreated = 0;
    let routesSkipped = 0;

    for (let i = 0; i < mockRoutes.length; i++) {
      const route = mockRoutes[i];
      const existingRoute = await prisma.routes.findFirst({
        where: { code: route.code },
      });

      if (!existingRoute) {
        const zone = zones[i % zones.length];
        const salesperson =
          salespersons.length > 0
            ? salespersons[i % salespersons.length]
            : defaultSalesperson;

        const routeData: {
          name: string;
          code: string;
          description?: string;
          parent_id: number;
          depot_id: number;
          salesperson_id?: number;
          route_type_id: number;
          start_location?: string;
          end_location?: string;
          estimated_distance?: number;
          estimated_time?: number;
          is_active: string;
          createdate: Date;
          createdby: number;
          updatedate?: Date;
          updatedby?: number;
          log_inst?: number;
          route_type?: string;
          outlet_group?: string;
        } = {
          name: route.name || route.code,
          code: route.code,
          parent_id: zone.id,
          depot_id: defaultDepot.id,
          route_type_id: defaultRouteType.id,
          is_active: route.is_active,
          createdate: new Date(),
          createdby: salesperson?.id || 1,
          log_inst: 1,
        };

        if (route.description) {
          routeData.description = `${route.description} in ${zone.name} zone`;
        }

        if (salesperson) {
          routeData.salesperson_id = salesperson.id;
        }

        await prisma.routes.create({
          data: routeData,
        });

        routesCreated++;
      } else {
        routesSkipped++;
      }
    }

    logger.info(
      `Routes seeding completed: ${routesCreated} created, ${routesSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding routes:', error);
    throw error;
  }
}

export async function clearRoutes(): Promise<void> {
  try {
    await prisma.routes.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockRoutes };
