/**
 * @fileoverview Depots Seeder
 * @description Creates 11 sample depots for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockDepot {
  parent_id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  manager_id?: number;
  supervisor_id?: number;
  coordinator_id?: number;
  latitude?: number;
  longitude?: number;
  is_active: string;
}

// Mock Depots Data (11 depots)
const mockDepots: MockDepot[] = [
  {
    parent_id: 1,
    name: 'Main Depot - North Region',
    code: 'DEP-NORTH-001',
    address: '123 Industrial Park, Building A',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
    phone_number: '+1-212-555-0100',
    email: 'north.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 40.7128,
    longitude: -74.006,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Secondary Depot - South Region',
    code: 'DEP-SOUTH-001',
    address: '456 Logistics Avenue, Suite 200',
    city: 'Atlanta',
    state: 'GA',
    zipcode: '30301',
    phone_number: '+1-404-555-0200',
    email: 'south.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 33.749,
    longitude: -84.388,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Warehouse Depot - West Region',
    code: 'DEP-WEST-001',
    address: '789 Distribution Center Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90001',
    phone_number: '+1-213-555-0300',
    email: 'west.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 34.0522,
    longitude: -118.2437,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Central Distribution Hub',
    code: 'DEP-CENTRAL-001',
    address: '321 Commerce Street, Hub Building',
    city: 'Chicago',
    state: 'IL',
    zipcode: '60601',
    phone_number: '+1-312-555-0400',
    email: 'central.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 41.8781,
    longitude: -87.6298,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Express Logistics Center',
    code: 'DEP-EXPRESS-001',
    address: '654 Speedway Drive, Express Building',
    city: 'Miami',
    state: 'FL',
    zipcode: '33101',
    phone_number: '+1-305-555-0500',
    email: 'express.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 25.7617,
    longitude: -80.1918,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Cold Storage Facility',
    code: 'DEP-COLD-001',
    address: '987 Freezer Lane, Cold Building',
    city: 'Minneapolis',
    state: 'MN',
    zipcode: '55401',
    phone_number: '+1-612-555-0600',
    email: 'cold.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 44.9778,
    longitude: -93.265,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Regional Sorting Center',
    code: 'DEP-SORT-001',
    address: '147 Sort Street, Sorting Building',
    city: 'Denver',
    state: 'CO',
    zipcode: '80201',
    phone_number: '+1-303-555-0700',
    email: 'sort.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 39.7392,
    longitude: -104.9903,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Bulk Storage Warehouse',
    code: 'DEP-BULK-001',
    address: '258 Bulk Avenue, Warehouse Complex',
    city: 'Phoenix',
    state: 'AZ',
    zipcode: '85001',
    phone_number: '+1-602-555-0800',
    email: 'bulk.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 33.4484,
    longitude: -112.074,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Cross-Dock Facility',
    code: 'DEP-CROSS-001',
    address: '369 Cross Street, Dock Building',
    city: 'Seattle',
    state: 'WA',
    zipcode: '98101',
    phone_number: '+1-206-555-0900',
    email: 'cross.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 47.6062,
    longitude: -122.3321,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Hazmat Storage Depot',
    code: 'DEP-HAZMAT-001',
    address: '741 Safety Drive, Secure Building',
    city: 'Houston',
    state: 'TX',
    zipcode: '77001',
    phone_number: '+1-713-555-1000',
    email: 'hazmat.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 29.7604,
    longitude: -95.3698,
    is_active: 'Y',
  },
  {
    parent_id: 1,
    name: 'Decommissioned Depot',
    code: 'DEP-DECOM-001',
    address: '852 Closed Street, Empty Building',
    city: 'Cleveland',
    state: 'OH',
    zipcode: '44101',
    phone_number: '+1-216-555-1100',
    email: 'decom.depot@company.com',
    manager_id: undefined,
    supervisor_id: undefined,
    coordinator_id: undefined,
    latitude: 41.4993,
    longitude: -81.6944,
    is_active: 'N',
  },
];

/**
 * Seed Depots with mock data
 */
export async function seedDepots(): Promise<void> {
  try {
    // Get available companies for parent_id
    const companies = await prisma.companies.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (companies.length === 0) {
      logger.warn('No active companies found. Skipping depots seeding.');
      return;
    }

    // Use the first company for all depots
    const company = companies[0];

    let depotsCreated = 0;
    let depotsSkipped = 0;

    for (const depot of mockDepots) {
      const existingDepot = await prisma.depots.findFirst({
        where: { name: depot.name },
      });

      if (!existingDepot) {
        await prisma.depots.create({
          data: {
            parent_id: company.id, // Use actual company ID instead of hardcoded
            name: depot.name,
            code: depot.code,
            address: depot.address,
            city: depot.city,
            state: depot.state,
            zipcode: depot.zipcode,
            phone_number: depot.phone_number,
            email: depot.email,
            manager_id: depot.manager_id,
            supervisor_id: depot.supervisor_id,
            coordinator_id: depot.coordinator_id,
            latitude: depot.latitude,
            longitude: depot.longitude,
            is_active: depot.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        depotsCreated++;
      } else {
        depotsSkipped++;
      }
    }

    logger.info(
      `Depots seeding completed: ${depotsCreated} created, ${depotsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding depots:', error);
    throw error;
  }
}

/**
 * Clear Depots data
 */
export async function clearDepots(): Promise<void> {
  try {
    await prisma.depots.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockDepots };
