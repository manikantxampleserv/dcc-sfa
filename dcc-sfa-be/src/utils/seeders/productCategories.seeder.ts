/**
 * @fileoverview Product Categories Seeder
 * @description Creates product categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockProductCategory {
  category_name: string;
  description?: string;
  is_active: string;
}

const mockProductCategories: MockProductCategory[] = [
  {
    category_name: 'JUICE',
    description: 'Juice products and beverages',
    is_active: 'Y',
  },
  {
    category_name: 'KDW',
    description: 'KDW category products',
    is_active: 'Y',
  },
  {
    category_name: 'OTHER',
    description: 'Other miscellaneous products',
    is_active: 'Y',
  },
  {
    category_name: 'PET',
    description: 'PET bottles and containers',
    is_active: 'Y',
  },
  {
    category_name: 'RGB',
    description: 'RGB category products',
    is_active: 'Y',
  },
];

/**
 * Seed Product Categories with mock data
 */
export async function seedProductCategories(): Promise<void> {
  try {
    for (const category of mockProductCategories) {
      const existingCategory = await prisma.product_categories.findFirst({
        where: { category_name: category.category_name },
      });

      if (!existingCategory) {
        await prisma.product_categories.create({
          data: {
            category_name: category.category_name,
            description: category.description,
            is_active: category.is_active,
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
 * Clear Product Categories data
 */
export async function clearProductCategories(): Promise<void> {
  try {
    await prisma.product_categories.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all product categories due to foreign key constraints. Some records may be in use by products.'
      );
    } else {
      throw error;
    }
  }
}

export { mockProductCategories };
