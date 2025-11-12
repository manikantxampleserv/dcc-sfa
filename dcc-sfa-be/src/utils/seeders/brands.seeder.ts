/**
 * @fileoverview Brands Seeder
 * @description Creates 11 sample brands for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockBrand {
  name: string;
  code: string;
  description?: string;
  logo?: string;
  is_active: string;
}

// Mock Brands Data (11 brands)
const mockBrands: MockBrand[] = [
  {
    name: 'Apple',
    code: 'APPLE',
    description: 'Technology company known for innovative products',
    logo: 'apple-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Coca Cola',
    code: 'COCA',
    description: 'Leading beverage company',
    logo: 'coca-cola-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Generic',
    code: 'GEN',
    description: 'Generic brand for various products',
    logo: 'generic-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Fashion Brand',
    code: 'FASH',
    description: 'Fashion and clothing brand',
    logo: 'fashion-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Office Furniture',
    code: 'OFFICE',
    description: 'Professional office furniture manufacturer',
    logo: 'office-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Fitness Brand',
    code: 'FIT',
    description: 'Sports and fitness equipment brand',
    logo: 'fitness-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Tech Publisher',
    code: 'TECH',
    description: 'Technology and programming book publisher',
    logo: 'tech-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Health Brand',
    code: 'HEALTH',
    description: 'Health and wellness products brand',
    logo: 'health-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Discontinued Brand',
    code: 'DISC',
    description: 'Brand no longer in production',
    logo: 'discontinued-logo.png',
    is_active: 'N',
  },
  {
    name: 'Premium Brand',
    code: 'PREMIUM',
    description: 'High-end luxury products brand',
    logo: 'premium-logo.png',
    is_active: 'Y',
  },
  {
    name: 'Budget Brand',
    code: 'BUDGET',
    description: 'Affordable products for budget-conscious consumers',
    logo: 'budget-logo.png',
    is_active: 'Y',
  },
];

/**
 * Seed Brands with mock data
 */
export async function seedBrands(): Promise<void> {
  try {
    for (const brand of mockBrands) {
      const existingBrand = await prisma.brands.findFirst({
        where: { name: brand.name },
      });

      if (!existingBrand) {
        await prisma.brands.create({
          data: {
            name: brand.name,
            code: brand.code,
            description: brand.description,
            logo: brand.logo,
            is_active: brand.is_active,
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
 * Clear Brands data
 */
export async function clearBrands(): Promise<void> {
  try {
    await prisma.brands.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockBrands };
