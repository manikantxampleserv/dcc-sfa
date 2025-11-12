/**
 * @fileoverview Unit of Measurement Seeder
 * @description Creates 11 sample units of measurement for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockUnitOfMeasurement {
  name: string;
  description?: string;
  category?: string;
  symbol?: string;
  is_active: string;
}

// Mock Unit of Measurement Data (11 units)
const mockUnitOfMeasurements: MockUnitOfMeasurement[] = [
  {
    name: 'Piece',
    description: 'Individual item count',
    category: 'Count',
    symbol: 'pcs',
    is_active: 'Y',
  },
  {
    name: 'Case',
    description: 'Packaging unit containing multiple items',
    category: 'Packaging',
    symbol: 'case',
    is_active: 'Y',
  },
  {
    name: 'Bag',
    description: 'Flexible container for loose items',
    category: 'Packaging',
    symbol: 'bag',
    is_active: 'Y',
  },
  {
    name: 'Bottle',
    description: 'Container for liquids',
    category: 'Container',
    symbol: 'bottle',
    is_active: 'Y',
  },
  {
    name: 'Box',
    description: 'Rigid container for various items',
    category: 'Packaging',
    symbol: 'box',
    is_active: 'Y',
  },
  {
    name: 'Kilogram',
    description: 'Unit of mass measurement',
    category: 'Weight',
    symbol: 'kg',
    is_active: 'Y',
  },
  {
    name: 'Liter',
    description: 'Unit of volume measurement',
    category: 'Volume',
    symbol: 'L',
    is_active: 'Y',
  },
  {
    name: 'Meter',
    description: 'Unit of length measurement',
    category: 'Length',
    symbol: 'm',
    is_active: 'Y',
  },
  {
    name: 'Dozen',
    description: 'Group of 12 items',
    category: 'Count',
    symbol: 'doz',
    is_active: 'Y',
  },
  {
    name: 'Set',
    description: 'Collection of related items',
    category: 'Count',
    symbol: 'set',
    is_active: 'Y',
  },
  {
    name: 'Discontinued Unit',
    description: 'Unit no longer in use',
    category: 'Legacy',
    symbol: 'old',
    is_active: 'N',
  },
];

/**
 * Seed Unit of Measurement with mock data
 */
export async function seedUnitOfMeasurement(): Promise<void> {
  try {
    for (const unit of mockUnitOfMeasurements) {
      const existingUnit = await prisma.unit_of_measurement.findFirst({
        where: { name: unit.name },
      });

      if (!existingUnit) {
        await prisma.unit_of_measurement.create({
          data: {
            name: unit.name,
            description: unit.description,
            category: unit.category,
            symbol: unit.symbol,
            is_active: unit.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Unit of Measurement data
 */
export async function clearUnitOfMeasurement(): Promise<void> {
  try {
    await prisma.unit_of_measurement.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockUnitOfMeasurements };
