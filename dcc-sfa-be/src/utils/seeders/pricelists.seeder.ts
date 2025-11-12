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
  currency_code?: string;
  valid_from?: Date;
  valid_to?: Date;
  is_active: string;
}

const mockPricelists: MockPricelist[] = [
  {
    name: 'Standard Retail Pricelist',
    description: 'Standard pricing for retail customers',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Wholesale Pricelist',
    description: 'Volume-based pricing for wholesale customers',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Corporate Pricelist',
    description: 'Special pricing for corporate clients',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Healthcare Pricelist',
    description: 'Specialized pricing for healthcare facilities',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Restaurant Pricelist',
    description: 'Food service industry pricing',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Manufacturing Pricelist',
    description: 'Industrial and manufacturing pricing',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Automotive Pricelist',
    description: 'Automotive industry specific pricing',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Service Provider Pricelist',
    description: 'Pricing for service companies',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Government Pricelist',
    description: 'Special pricing for government agencies',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Educational Pricelist',
    description: 'Discounted pricing for educational institutions',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Non-Profit Pricelist',
    description: 'Special pricing for non-profit organizations',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'International Pricelist',
    description: 'Export pricing for international customers',
    currency_code: 'USD',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Emergency Services Pricelist',
    description: 'Priority pricing for emergency services',
    currency_code: 'INR',
    valid_from: new Date('2024-01-01'),
    valid_to: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    name: 'Promotional Pricelist',
    description: 'Limited time promotional pricing',
    currency_code: 'INR',
    valid_from: new Date('2024-06-01'),
    valid_to: new Date('2024-08-31'),
    is_active: 'Y',
  },
  {
    name: 'Legacy Pricelist',
    description: 'Old pricelist no longer in use',
    currency_code: 'INR',
    valid_from: new Date('2023-01-01'),
    valid_to: new Date('2023-12-31'),
    is_active: 'N',
  },
];

/**
 * Seed Pricelists with mock data
 */
export async function seedPricelists(): Promise<void> {
  try {
    let pricelistsCreated = 0;
    let pricelistsSkipped = 0;

    for (const pricelist of mockPricelists) {
      const existingPricelist = await prisma.pricelists.findFirst({
        where: { name: pricelist.name },
      });

      if (!existingPricelist) {
        await prisma.pricelists.create({
          data: {
            name: pricelist.name,
            description: pricelist.description,
            currency_code: pricelist.currency_code,
            valid_from: pricelist.valid_from,
            valid_to: pricelist.valid_to,
            is_active: pricelist.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        pricelistsCreated++;
      } else {
        pricelistsSkipped++;
      }
    }

    logger.info(
      `Pricelists seeding completed: ${pricelistsCreated} created, ${pricelistsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding pricelists:', error);
    throw error;
  }
}

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
