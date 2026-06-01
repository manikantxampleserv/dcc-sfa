/**
 * @fileoverview Pricelists Seeder
 * @description Creates sample pricelists for different customer segments and regions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockPricelist {
  name: string;
  description?: string;
  valid_from?: Date;
  valid_to?: Date;
  is_active: string;
}

const mockPricelists: MockPricelist[] = [
  {
    name: 'Standard Retail Pricelist',
    description: 'Standard pricing for retail customers',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Wholesale Pricelist',
    description: 'Volume-based pricing for wholesale customers',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Corporate Pricelist',
    description: 'Special pricing for corporate clients',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Healthcare Pricelist',
    description: 'Specialized pricing for healthcare facilities',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Restaurant Pricelist',
    description: 'Food service industry pricing',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Manufacturing Pricelist',
    description: 'Industrial and manufacturing pricing',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Automotive Pricelist',
    description: 'Automotive industry specific pricing',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Service Provider Pricelist',
    description: 'Pricing for service companies',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Government Pricelist',
    description: 'Special pricing for government agencies',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Educational Pricelist',
    description: 'Discounted pricing for educational institutions',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Non-Profit Pricelist',
    description: 'Special pricing for non-profit organizations',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'International Pricelist',
    description: 'Export pricing for international customers',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Startup Pricelist',
    description: 'Introductory pricing for startups',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'E-commerce Pricelist',
    description: 'Dynamic pricing for online retailers',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Franchise Pricelist',
    description: 'Standardized pricing for franchises',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
];

export const seedPricelists = async () => {
  try {
    logger.info('Starting Pricelists seeding...');

    // Get a default user for createdby
    const defaultUser = await prisma.users.findFirst({
      where: { is_active: 'Y' },
      select: { id: true },
    });

    if (!defaultUser) {
      logger.warn('No active users found. Skipping Pricelists seeding.');
      return;
    }

    let createdCount = 0;
    for (const pl of mockPricelists) {
      const existing = await prisma.pricelists.findFirst({
        where: { name: pl.name },
      });

      if (!existing) {
        await prisma.pricelists.create({
          data: {
            ...pl,
            createdby: defaultUser.id,
            log_inst: 1,
          },
        });
        createdCount++;
      }
    }

    logger.info(`Successfully seeded ${createdCount} new Pricelists.`);
  } catch (error) {
    logger.error('Error seeding Pricelists:', error);
    throw error;
  }
};

/**
 * Clear Pricelists data
 */
export async function clearPricelists(): Promise<void> {
  try {
    await prisma.pricelists.deleteMany({});
  } catch (error) {
    throw error;
  }
}
