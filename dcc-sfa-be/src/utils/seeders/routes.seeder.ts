/**
 * @fileoverview Routes Seeder
 * @description Creates 11 sample routes for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockRoute {
  name: string;
  code: string;
  description?: string;
  company_name: string;
  depot_name: string;
  start_location?: string;
  end_location?: string;
  estimated_distance?: number;
  estimated_time?: number;
  is_active: string;
}

// Mock Routes Data (11 routes) - Using actual depot names from depot seeder
const mockRoutes: MockRoute[] = [
  {
    name: 'North Downtown Route',
    code: 'RT-NORTH-001',
    description: 'Delivery route covering north downtown area',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Main Depot - North Region',
    start_location: 'Main Depot',
    end_location: 'North Downtown',
    estimated_distance: 25.5,
    estimated_time: 180,
    is_active: 'Y',
  },
  {
    name: 'South Business District',
    code: 'RT-SOUTH-001',
    description: 'Route for south business district deliveries',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Secondary Depot - South Region',
    start_location: 'South Depot',
    end_location: 'Business District',
    estimated_distance: 32.0,
    estimated_time: 220,
    is_active: 'Y',
  },
  {
    name: 'West Industrial Zone',
    code: 'RT-WEST-001',
    description: 'Industrial zone delivery route',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Warehouse Depot - West Region',
    start_location: 'Main Depot',
    end_location: 'Industrial Zone',
    estimated_distance: 18.7,
    estimated_time: 150,
    is_active: 'Y',
  },
  {
    name: 'East Residential Area',
    code: 'RT-EAST-001',
    description: 'Residential area delivery route',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Central Distribution Hub',
    start_location: 'Regional Depot',
    end_location: 'East Residential',
    estimated_distance: 28.3,
    estimated_time: 200,
    is_active: 'Y',
  },
  {
    name: 'Central Mall Circuit',
    code: 'RT-CENTRAL-001',
    description: 'Shopping mall and retail circuit',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Express Logistics Center',
    start_location: 'Distribution Center',
    end_location: 'Central Mall',
    estimated_distance: 15.2,
    estimated_time: 120,
    is_active: 'Y',
  },
  {
    name: 'Suburban Express',
    code: 'RT-SUBURB-001',
    description: 'Express route to suburban areas',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Cold Storage Facility',
    start_location: 'Urban Hub',
    end_location: 'Suburban Areas',
    estimated_distance: 45.8,
    estimated_time: 300,
    is_active: 'Y',
  },
  {
    name: 'University District',
    code: 'RT-UNI-001',
    description: 'University and student housing route',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Regional Sorting Center',
    start_location: 'Suburban Center',
    end_location: 'University District',
    estimated_distance: 22.1,
    estimated_time: 160,
    is_active: 'Y',
  },
  {
    name: 'Coastal Highway',
    code: 'RT-COAST-001',
    description: 'Coastal highway delivery route',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Bulk Storage Warehouse',
    start_location: 'Coastal Warehouse',
    end_location: 'Coastal Towns',
    estimated_distance: 67.4,
    estimated_time: 420,
    is_active: 'Y',
  },
  {
    name: 'Port Authority Route',
    code: 'RT-PORT-001',
    description: 'Port and shipping district route',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Cross-Dock Facility',
    start_location: 'Port Facility',
    end_location: 'Port District',
    estimated_distance: 12.9,
    estimated_time: 90,
    is_active: 'Y',
  },
  {
    name: 'Mountain Pass Route',
    code: 'RT-MOUNTAIN-001',
    description: 'Mountain region delivery route',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Hazmat Storage Depot',
    start_location: 'Mountain Base',
    end_location: 'Mountain Towns',
    estimated_distance: 89.6,
    estimated_time: 480,
    is_active: 'Y',
  },
  {
    name: 'Discontinued Route',
    code: 'RT-DISC-001',
    description: 'Route no longer in service',
    company_name: 'Ampleserv Technologies Pvt. Ltd.',
    depot_name: 'Decommissioned Depot',
    start_location: 'Closed Depot',
    end_location: 'Nowhere',
    estimated_distance: 0.0,
    estimated_time: 0,
    is_active: 'N',
  },
];

/**
 * Seed Routes with mock data
 */
export async function seedRoutes(): Promise<void> {
  try {
    // Get all zones and depots for lookup
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

    // Use the first zone for all routes (parent_id references zones, not companies)
    const zone = zones[0];

    let routesCreated = 0;
    let routesSkipped = 0;

    for (const route of mockRoutes) {
      const existingRoute = await prisma.routes.findFirst({
        where: { code: route.code },
      });

      if (!existingRoute) {
        // Find the depot by name
        const depot = depots.find(d => d.name === route.depot_name);

        if (depot) {
          // Ensure we have a default route type
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

          await prisma.routes.create({
            data: {
              name: route.name,
              code: route.code,
              description: route.description,
              parent_id: zone.id, // parent_id references zones, not companies
              depot_id: depot.id,
              salesperson_id: 1, // Use admin user ID
              route_type_id: defaultRouteType.id, // Add required route_type_id
              start_location: route.start_location,
              end_location: route.end_location,
              estimated_distance: route.estimated_distance,
              estimated_time: route.estimated_time,
              is_active: route.is_active,
              createdate: new Date(),
              createdby: 1,
              log_inst: 1,
            },
          });

          routesCreated++;
        } else {
          logger.warn(
            `Depot not found: ${route.depot_name} for route ${route.name}`
          );
          routesSkipped++;
        }
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
