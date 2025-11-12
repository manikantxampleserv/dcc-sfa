/**
 * @fileoverview Zones Seeder
 * @description Creates 11 sample zones for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockZone {
  name: string;
  code: string;
  description?: string;
  parent_id: number;
  depot_id?: number;
  supervisor_id?: number;
  is_active: string;
}

// Mock Zones Data (11 zones)
const mockZones: MockZone[] = [
  {
    name: 'North Zone A',
    code: 'NZ-A-001',
    description: 'Northern region zone A for sales coverage',
    parent_id: 1,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'North Zone B',
    code: 'NZ-B-002',
    description: 'Northern region zone B for sales coverage',
    parent_id: 1,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'South Zone A',
    code: 'SZ-A-003',
    description: 'Southern region zone A for sales coverage',
    parent_id: 2,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'South Zone B',
    code: 'SZ-B-004',
    description: 'Southern region zone B for sales coverage',
    parent_id: 2,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'West Zone A',
    code: 'WZ-A-005',
    description: 'Western region zone A for sales coverage',
    parent_id: 3,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'West Zone B',
    code: 'WZ-B-006',
    description: 'Western region zone B for sales coverage',
    parent_id: 3,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Central Zone A',
    code: 'CZ-A-007',
    description: 'Central region zone A for sales coverage',
    parent_id: 4,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Central Zone B',
    code: 'CZ-B-008',
    description: 'Central region zone B for sales coverage',
    parent_id: 4,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'East Zone A',
    code: 'EZ-A-009',
    description: 'Eastern region zone A for sales coverage',
    parent_id: 5,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'East Zone B',
    code: 'EZ-B-010',
    description: 'Eastern region zone B for sales coverage',
    parent_id: 5,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Inactive Zone',
    code: 'IZ-011',
    description: 'Decommissioned zone for historical data',
    parent_id: 6,
    depot_id: undefined,
    supervisor_id: undefined,
    is_active: 'N',
  },
];

/**
 * Seed Zones with mock data
 */
export async function seedZones(): Promise<void> {
  try {
    // Get available companies for parent_id
    const companies = await prisma.companies.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (companies.length === 0) {
      logger.warn('No active companies found. Skipping zones seeding.');
      return;
    }

    // Use the first company for all zones
    const company = companies[0];

    let zonesCreated = 0;
    let zonesSkipped = 0;

    for (const zone of mockZones) {
      const existingZone = await prisma.zones.findFirst({
        where: { name: zone.name },
      });

      if (!existingZone) {
        await prisma.zones.create({
          data: {
            name: zone.name,
            code: zone.code,
            description: zone.description,
            parent_id: company.id, // Use actual company ID instead of hardcoded
            depot_id: zone.depot_id,
            supervisor_id: zone.supervisor_id,
            is_active: zone.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        zonesCreated++;
      } else {
        zonesSkipped++;
      }
    }

    logger.info(
      `Zones seeding completed: ${zonesCreated} created, ${zonesSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding zones:', error);
    throw error;
  }
}

/**
 * Clear Zones data
 */
export async function clearZones(): Promise<void> {
  try {
    await prisma.zones.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockZones };
