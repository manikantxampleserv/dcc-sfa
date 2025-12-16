/**
 * @fileoverview Product Sub Categories Seeder
 * @description Creates product sub categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockProductSubCategory {
  sub_category_name: string;
  category_name: string;
  description?: string;
  is_active: string;
}

const mockProductSubCategories: MockProductSubCategory[] = [
  {
    sub_category_name: '1 LTR JUICE 1X6',
    category_name: 'JUICE',
    is_active: 'Y',
  },
  {
    sub_category_name: '1250ML JUICE 1x6',
    category_name: 'JUICE',
    is_active: 'Y',
  },
  {
    sub_category_name: '400ML JUICE 1x12',
    category_name: 'JUICE',
    is_active: 'Y',
  },
  {
    sub_category_name: '1000ML KDW',
    category_name: 'KDW',
    is_active: 'Y',
  },
  {
    sub_category_name: '1500ML KDW 1X6',
    category_name: 'KDW',
    is_active: 'Y',
  },
  {
    sub_category_name: '500ML KDW 1x12',
    category_name: 'KDW',
    is_active: 'Y',
  },
  {
    sub_category_name: 'BULK WATER 12 LTR',
    category_name: 'KDW',
    is_active: 'Y',
  },
  {
    sub_category_name: 'BULK WATER 18.9 LTR',
    category_name: 'KDW',
    is_active: 'Y',
  },
  {
    sub_category_name: 'BULK WATER 6 LTR',
    category_name: 'KDW',
    is_active: 'Y',
  },
  {
    sub_category_name: 'CRATES',
    category_name: 'OTHER',
    is_active: 'Y',
  },
  {
    sub_category_name: 'EMPTIES',
    category_name: 'OTHER',
    is_active: 'Y',
  },
  {
    sub_category_name: 'PALLETS',
    category_name: 'OTHER',
    is_active: 'Y',
  },
  {
    sub_category_name: '1250ML PET 1x6',
    category_name: 'PET',
    is_active: 'Y',
  },
  {
    sub_category_name: '1500ML PET 1x6',
    category_name: 'PET',
    is_active: 'Y',
  },
  {
    sub_category_name: '300ML PET 1x12',
    category_name: 'PET',
    is_active: 'Y',
  },
  {
    sub_category_name: '300ML PET 1x24',
    category_name: 'PET',
    is_active: 'Y',
  },
  {
    sub_category_name: '500ML PET 1x12',
    category_name: 'PET',
    is_active: 'Y',
  },
  {
    sub_category_name: '250ML RGB 1x24',
    category_name: 'RGB',
    is_active: 'Y',
  },
  {
    sub_category_name: '300ML RGB 1x24',
    category_name: 'RGB',
    is_active: 'Y',
  },
  {
    sub_category_name: '350ML RGB 1x24',
    category_name: 'RGB',
    is_active: 'Y',
  },
];

/**
 * Seed Product Sub Categories with mock data
 */
export async function seedProductSubCategories(): Promise<void> {
  try {
    const productCategories = await prisma.product_categories.findMany({
      select: { id: true, category_name: true },
    });

    const categoryMap = new Map(
      productCategories.map(cat => [cat.category_name, cat.id])
    );

    for (const subCategory of mockProductSubCategories) {
      const categoryId = categoryMap.get(subCategory.category_name);

      if (!categoryId) {
        console.warn(
          `⚠️  Category "${subCategory.category_name}" not found for sub-category: ${subCategory.sub_category_name}`
        );
        continue;
      }

      const existingSubCategory = await prisma.product_sub_categories.findFirst(
        {
          where: {
            sub_category_name: subCategory.sub_category_name,
            product_category_id: categoryId,
          },
        }
      );

      if (!existingSubCategory) {
        await prisma.product_sub_categories.create({
          data: {
            sub_category_name: subCategory.sub_category_name,
            product_category_id: categoryId,
            description: subCategory.description,
            is_active: subCategory.is_active,
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
 * Clear Product Sub Categories data
 */
export async function clearProductSubCategories(): Promise<void> {
  try {
    await prisma.product_sub_categories.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all product sub categories due to foreign key constraints. Some records may be in use by products.'
      );
    } else {
      throw error;
    }
  }
}

export { mockProductSubCategories };
