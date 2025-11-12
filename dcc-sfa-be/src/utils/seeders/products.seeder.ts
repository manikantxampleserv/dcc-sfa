/**
 * @fileoverview Products Seeder
 * @description Creates 11 sample products for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockProduct {
  name: string;
  code: string;
  description?: string;
  category_name: string;
  sub_category_name: string;
  brand_name: string;
  unit_name: string;
  base_price?: number;
  tax_rate?: number;
  is_active: string;
}

// Mock Products Data (20 products)
const mockProducts: MockProduct[] = [
  {
    name: 'iPhone 15 Pro',
    code: 'PROD-001',
    description: 'Latest Apple iPhone with advanced camera system',
    category_name: 'Electronics',
    sub_category_name: 'Smartphones',
    brand_name: 'Apple',
    unit_name: 'Piece',
    base_price: 999.99,
    tax_rate: 8.5,
    is_active: 'Y',
  },
  {
    name: 'MacBook Air M2',
    code: 'PROD-002',
    description: 'Apple MacBook Air with M2 chip',
    category_name: 'Electronics',
    sub_category_name: 'Laptops & Computers',
    brand_name: 'Apple',
    unit_name: 'Piece',
    base_price: 1199.99,
    tax_rate: 8.5,
    is_active: 'Y',
  },
  {
    name: 'Coca Cola Classic',
    code: 'PROD-003',
    description: 'Classic Coca Cola soft drink',
    category_name: 'Food & Beverages',
    sub_category_name: 'Soft Drinks',
    brand_name: 'Coca Cola',
    unit_name: 'Case',
    base_price: 1.99,
    tax_rate: 6.0,
    is_active: 'Y',
  },
  {
    name: 'Potato Chips',
    code: 'PROD-004',
    description: 'Crispy potato chips snack',
    category_name: 'Food & Beverages',
    sub_category_name: 'Snacks',
    brand_name: 'Generic',
    unit_name: 'Case',
    base_price: 2.49,
    tax_rate: 6.0,
    is_active: 'Y',
  },
  {
    name: "Men's T-Shirt",
    code: 'PROD-005',
    description: 'Comfortable cotton t-shirt for men',
    category_name: 'Clothing & Fashion',
    sub_category_name: "Men's Clothing",
    brand_name: 'Fashion Brand',
    unit_name: 'Piece',
    base_price: 29.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: "Women's Dress",
    code: 'PROD-006',
    description: "Elegant women's dress",
    category_name: 'Clothing & Fashion',
    sub_category_name: "Women's Clothing",
    brand_name: 'Fashion Brand',
    unit_name: 'Piece',
    base_price: 79.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Office Chair',
    code: 'PROD-007',
    description: 'Ergonomic office chair with lumbar support',
    category_name: 'Home & Garden',
    sub_category_name: 'Furniture',
    brand_name: 'Office Furniture',
    unit_name: 'Piece',
    base_price: 199.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Treadmill',
    code: 'PROD-008',
    description: 'Professional fitness treadmill',
    category_name: 'Sports & Fitness',
    sub_category_name: 'Fitness Equipment',
    brand_name: 'Fitness Brand',
    unit_name: 'Piece',
    base_price: 1299.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Fiction Novel',
    code: 'PROD-009',
    description: 'Bestselling fiction novel',
    category_name: 'Books & Media',
    sub_category_name: 'Fiction Books',
    brand_name: 'Tech Publisher',
    unit_name: 'Piece',
    base_price: 19.99,
    tax_rate: 0.0,
    is_active: 'Y',
  },
  {
    name: 'Protein Powder',
    code: 'PROD-010',
    description: 'High-quality protein supplement',
    category_name: 'Health & Beauty',
    sub_category_name: 'Supplements',
    brand_name: 'Health Brand',
    unit_name: 'Bottle',
    base_price: 49.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Discontinued Product',
    code: 'PROD-011',
    description: 'Product no longer available',
    category_name: 'Discontinued Items',
    sub_category_name: 'Discontinued Sub Category',
    brand_name: 'Discontinued Brand',
    unit_name: 'Piece',
    base_price: 0.0,
    tax_rate: 0.0,
    is_active: 'N',
  },
  {
    name: 'Samsung Galaxy S24',
    code: 'PROD-012',
    description: 'Latest Samsung smartphone with AI features',
    category_name: 'Electronics',
    sub_category_name: 'Smartphones',
    brand_name: 'Generic',
    unit_name: 'Piece',
    base_price: 899.99,
    tax_rate: 8.5,
    is_active: 'Y',
  },
  {
    name: 'Dell Laptop',
    code: 'PROD-013',
    description: 'High-performance business laptop',
    category_name: 'Electronics',
    sub_category_name: 'Laptops & Computers',
    brand_name: 'Generic',
    unit_name: 'Piece',
    base_price: 799.99,
    tax_rate: 8.5,
    is_active: 'Y',
  },
  {
    name: 'Energy Drink',
    code: 'PROD-014',
    description: 'High-energy sports drink',
    category_name: 'Food & Beverages',
    sub_category_name: 'Soft Drinks',
    brand_name: 'Generic',
    unit_name: 'Case',
    base_price: 3.99,
    tax_rate: 6.0,
    is_active: 'Y',
  },
  {
    name: 'Protein Bar',
    code: 'PROD-015',
    description: 'High-protein nutrition bar',
    category_name: 'Food & Beverages',
    sub_category_name: 'Snacks',
    brand_name: 'Generic',
    unit_name: 'Case',
    base_price: 2.99,
    tax_rate: 6.0,
    is_active: 'Y',
  },
  {
    name: "Men's Jeans",
    code: 'PROD-016',
    description: 'Comfortable denim jeans for men',
    category_name: 'Clothing & Fashion',
    sub_category_name: "Men's Clothing",
    brand_name: 'Fashion Brand',
    unit_name: 'Piece',
    base_price: 59.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: "Women's Shoes",
    code: 'PROD-017',
    description: "Stylish women's footwear",
    category_name: 'Clothing & Fashion',
    sub_category_name: "Women's Clothing",
    brand_name: 'Fashion Brand',
    unit_name: 'Piece',
    base_price: 89.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Dining Table',
    code: 'PROD-018',
    description: 'Elegant wooden dining table',
    category_name: 'Home & Garden',
    sub_category_name: 'Furniture',
    brand_name: 'Office Furniture',
    unit_name: 'Piece',
    base_price: 599.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Yoga Mat',
    code: 'PROD-019',
    description: 'Premium yoga mat for fitness',
    category_name: 'Sports & Fitness',
    sub_category_name: 'Fitness Equipment',
    brand_name: 'Fitness Brand',
    unit_name: 'Piece',
    base_price: 39.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Programming Book',
    code: 'PROD-020',
    description: 'Complete guide to programming fundamentals',
    category_name: 'Books & Media',
    sub_category_name: 'Fiction Books',
    brand_name: 'Tech Publisher',
    unit_name: 'Piece',
    base_price: 49.99,
    tax_rate: 0.0,
    is_active: 'Y',
  },
];

/**
 * Seed Products with mock data
 */
export async function seedProducts(): Promise<void> {
  try {
    // Get all categories, sub-categories, brands, and units for lookup
    const categories = await prisma.product_categories.findMany({
      select: { id: true, category_name: true },
    });

    const subCategories = await prisma.product_sub_categories.findMany({
      select: { id: true, sub_category_name: true },
    });

    const brands = await prisma.brands.findMany({
      select: { id: true, name: true },
    });

    const units = await prisma.unit_of_measurement.findMany({
      select: { id: true, name: true },
    });

    for (const product of mockProducts) {
      // Check if product already exists by name OR code
      const existingProduct = await prisma.products.findFirst({
        where: {
          OR: [{ name: product.name }, { code: product.code }],
        },
      });

      if (!existingProduct) {
        // Find the category, sub-category, brand, and unit IDs
        const category = categories.find(
          c => c.category_name === product.category_name
        );
        const subCategory = subCategories.find(
          sc => sc.sub_category_name === product.sub_category_name
        );
        const brand = brands.find(b => b.name === product.brand_name);
        const unit = units.find(u => u.name === product.unit_name);

        if (category && subCategory && brand && unit) {
          await prisma.products.create({
            data: {
              name: product.name,
              code: product.code,
              description: product.description,
              category_id: category.id,
              sub_category_id: subCategory.id,
              brand_id: brand.id,
              unit_of_measurement: unit.id,
              base_price: product.base_price,
              tax_rate: product.tax_rate,
              is_active: product.is_active,
              createdate: new Date(),
              createdby: 1,
              log_inst: 1,
            },
          });
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Products data
 */
export async function clearProducts(): Promise<void> {
  try {
    await prisma.products.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockProducts };
