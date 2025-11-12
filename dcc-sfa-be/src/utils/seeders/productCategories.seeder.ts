/**
 * @fileoverview Product Categories Seeder
 * @description Creates 11 sample product categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockProductCategory {
  category_name: string;
  description?: string;
  is_active: string;
}

// Mock Product Categories Data (11 categories)
const mockProductCategories: MockProductCategory[] = [
  {
    category_name: 'Electronics',
    description:
      'Electronic devices, gadgets, and accessories including smartphones, laptops, tablets, and home appliances',
    is_active: 'Y',
  },
  {
    category_name: 'Food & Beverages',
    description: 'Food items, beverages, snacks, and consumable products',
    is_active: 'Y',
  },
  {
    category_name: 'Clothing & Fashion',
    description: 'Apparel, fashion accessories, shoes, and clothing items',
    is_active: 'Y',
  },
  {
    category_name: 'Home & Garden',
    description: 'Home improvement items, garden tools, furniture, and decor',
    is_active: 'Y',
  },
  {
    category_name: 'Sports & Fitness',
    description:
      'Sports equipment, fitness gear, outdoor activities, and athletic wear',
    is_active: 'Y',
  },
  {
    category_name: 'Books & Media',
    description:
      'Books, magazines, digital media, educational materials, and entertainment',
    is_active: 'Y',
  },
  {
    category_name: 'Health & Beauty',
    description:
      'Health supplements, beauty products, personal care items, and wellness products',
    is_active: 'Y',
  },
  {
    category_name: 'Automotive',
    description:
      'Car parts, accessories, tools, and automotive maintenance products',
    is_active: 'Y',
  },
  {
    category_name: 'Office Supplies',
    description: 'Office equipment, stationery, and workplace essentials',
    is_active: 'Y',
  },
  {
    category_name: 'Toys & Games',
    description: 'Children toys, board games, puzzles, and entertainment items',
    is_active: 'Y',
  },
  {
    category_name: 'Discontinued Items',
    description: 'Products that are no longer available for sale',
    is_active: 'N',
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
  } catch (error) {
    throw error;
  }
}

export { mockProductCategories };
