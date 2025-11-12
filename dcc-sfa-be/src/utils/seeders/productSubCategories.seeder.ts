/**
 * @fileoverview Product Sub Categories Seeder
 * @description Creates 11 sample product sub categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockProductSubCategory {
  sub_category_name: string;
  product_category_id: number;
  description?: string;
  is_active: string;
}

// Mock Product Sub Categories Data (11 sub categories)
const mockProductSubCategories: MockProductSubCategory[] = [
  {
    sub_category_name: 'Smartphones',
    product_category_id: 1, // Electronics
    description: 'Mobile phones, smartphones, and phone accessories',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Laptops & Computers',
    product_category_id: 1, // Electronics
    description: 'Laptops, desktops, tablets, and computer accessories',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Soft Drinks',
    product_category_id: 2, // Food & Beverages
    description: 'Carbonated soft drinks, sodas, and fizzy beverages',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Snacks',
    product_category_id: 2, // Food & Beverages
    description: 'Chips, crackers, nuts, and packaged snacks',
    is_active: 'Y',
  },
  {
    sub_category_name: "Men's Clothing",
    product_category_id: 3, // Clothing & Fashion
    description: "Shirts, pants, suits, and men's apparel",
    is_active: 'Y',
  },
  {
    sub_category_name: "Women's Clothing",
    product_category_id: 3, // Clothing & Fashion
    description: "Dresses, tops, skirts, and women's apparel",
    is_active: 'Y',
  },
  {
    sub_category_name: 'Furniture',
    product_category_id: 4, // Home & Garden
    description: 'Tables, chairs, sofas, beds, and home furniture',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Fitness Equipment',
    product_category_id: 5, // Sports & Fitness
    description: 'Treadmills, weights, yoga mats, and fitness gear',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Fiction Books',
    product_category_id: 6, // Books & Media
    description: 'Novels, short stories, and fictional literature',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Supplements',
    product_category_id: 7, // Health & Beauty
    description: 'Vitamins, protein powders, and health supplements',
    is_active: 'Y',
  },
  {
    sub_category_name: 'Discontinued Sub Category',
    product_category_id: 11, // Discontinued Items
    description: 'Sub category for discontinued products',
    is_active: 'N',
  },
];

/**
 * Seed Product Sub Categories with mock data
 */
export async function seedProductSubCategories(): Promise<void> {
  try {
    // Get all product categories to map IDs
    const productCategories = await prisma.product_categories.findMany({
      select: { id: true, category_name: true },
    });

    const categoryMap = new Map(
      productCategories.map(cat => [cat.category_name, cat.id])
    );

    for (const subCategory of mockProductSubCategories) {
      // Find the category ID by name
      const categoryName = getCategoryNameById(subCategory.product_category_id);
      const categoryId = categoryMap.get(categoryName);

      if (!categoryId) {
        console.warn(
          `⚠️  Category not found for sub-category: ${subCategory.sub_category_name}`
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
 * Get category name by ID from mock data
 */
function getCategoryNameById(id: number): string {
  const categoryMap: { [key: number]: string } = {
    1: 'Electronics',
    2: 'Food & Beverages',
    3: 'Clothing & Fashion',
    4: 'Home & Garden',
    5: 'Sports & Fitness',
    6: 'Books & Media',
    7: 'Health & Beauty',
    8: 'Automotive',
    9: 'Office Supplies',
    10: 'Toys & Games',
    11: 'Discontinued Items',
  };
  return categoryMap[id] || '';
}

/**
 * Clear Product Sub Categories data
 */
export async function clearProductSubCategories(): Promise<void> {
  try {
    await prisma.product_sub_categories.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockProductSubCategories };
