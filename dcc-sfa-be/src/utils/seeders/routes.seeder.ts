/**
 * @fileoverview Routes Seeder
 * @description Creates 11 sample routes for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockRoute {
  code: string;
  zone_name: string;
  name?: string;
  description?: string;
  is_active: string;
}

const mockRoutes: MockRoute[] = [
  {
    code: 'TRK15A',
    zone_name: 'KANGARO',
    name: 'Route TRK15A',
    description: 'Delivery route TRK15A in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK15B',
    zone_name: 'KANGARO',
    name: 'Route TRK15B',
    description: 'Delivery route TRK15B in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16A',
    zone_name: 'KANGARO',
    name: 'Route TRK16A',
    description: 'Delivery route TRK16A in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16B',
    zone_name: 'KANGARO',
    name: 'Route TRK16B',
    description: 'Delivery route TRK16B in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16C',
    zone_name: 'KANGARO',
    name: 'Route TRK16C',
    description: 'Delivery route TRK16C in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16D',
    zone_name: 'KANGARO',
    name: 'Route TRK16D',
    description: 'Delivery route TRK16D in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16E',
    zone_name: 'KANGARO',
    name: 'Route TRK16E',
    description: 'Delivery route TRK16E in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16F',
    zone_name: 'KANGARO',
    name: 'Route TRK16F',
    description: 'Delivery route TRK16F in KANGARO zone',
    is_active: 'Y',
  },
  {
    code: 'TRK16G',
    zone_name: 'KANGARO',
    name: 'Route TRK16G',
    description: 'Delivery route TRK16G in KANGARO zone',
    is_active: 'Y',
  },
];

/**
 * Seed Routes with mock data
 */
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

    const zoneMap = new Map(zones.map(zone => [zone.name, zone.id]));

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

    let routesCreated = 0;
    let routesSkipped = 0;

    for (const route of mockRoutes) {
      const existingRoute = await prisma.routes.findFirst({
        where: { code: route.code },
      });

      if (!existingRoute) {
        const zoneId = zoneMap.get(route.zone_name);

        if (!zoneId) {
          logger.warn(
            `Zone not found: ${route.zone_name} for route ${route.code}`
          );
          routesSkipped++;
          continue;
        }

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
          parent_id: zoneId,
          depot_id: defaultDepot.id,
          route_type_id: defaultRouteType.id,
          is_active: route.is_active,
          createdate: new Date(),
          createdby: 1,
        };

        if (route.description) {
          routeData.description = route.description;
        }
        routeData.salesperson_id = 1;
        routeData.log_inst = 1;

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

/**
 * Clear Routes data
 */
export async function clearRoutes(): Promise<void> {
  try {
    await prisma.routes.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockRoutes };
