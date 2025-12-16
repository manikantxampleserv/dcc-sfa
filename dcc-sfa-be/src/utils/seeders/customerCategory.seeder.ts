/**
 * @fileoverview Customer Category Seeder
 * @description Creates customer categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockCustomerCategory {
  category_name: string;
  category_code: string;
  is_active: string;
}

const mockCustomerCategories: MockCustomerCategory[] = [
  {
    category_name: 'Bronze',
    category_code: 'CC-BRONZE',
    is_active: 'Y',
  },
  {
    category_name: 'Silver',
    category_code: 'CC-SILVER',
    is_active: 'Y',
  },
  {
    category_name: 'Gold',
    category_code: 'CC-GOLD',
    is_active: 'Y',
  },
  {
    category_name: 'Diamond',
    category_code: 'CC-DIAMOND',
    is_active: 'Y',
  },
  {
    category_name: 'Platinum',
    category_code: 'CC-PLATINUM',
    is_active: 'Y',
  },
];

export async function seedCustomerCategory(): Promise<void> {
  try {
    for (const category of mockCustomerCategories) {
      const existingCategory = await prisma.customer_category.findFirst({
        where: { category_name: category.category_name },
      });

      if (!existingCategory) {
        await prisma.customer_category.create({
          data: {
            category_name: category.category_name,
            category_code: category.category_code,
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

export async function clearCustomerCategory(): Promise<void> {
  try {
    await prisma.customer_category.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all customer categories due to foreign key constraints. Some records may be in use by customers.'
      );
    } else {
      throw error;
    }
  }
}

export { mockCustomerCategories };
