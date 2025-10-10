/**
 * @fileoverview Products Seeder
 * @description Creates 11 sample products for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockProduct {
  name: string;
  code: string;
  description?: string;
  category_name: string;
  brand_name: string;
  unit_name: string;
  base_price?: number;
  tax_rate?: number;
  is_active: string;
}

// Mock Products Data (11 products)
const mockProducts: MockProduct[] = [
  {
    name: 'iPhone 15 Pro',
    code: 'PROD-001',
    description: 'Latest Apple iPhone with advanced camera system',
    category_name: 'Electronics',
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
    brand_name: 'Pepsi',
    unit_name: 'Case',
    base_price: 2.49,
    tax_rate: 6.0,
    is_active: 'Y',
  },
  {
    name: 'Nike Running Shoes',
    code: 'PROD-005',
    description: 'High-performance running shoes',
    category_name: 'Clothing',
    brand_name: 'Nike',
    unit_name: 'Piece',
    base_price: 129.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Adidas T-Shirt',
    code: 'PROD-006',
    description: 'Comfortable cotton t-shirt',
    category_name: 'Clothing',
    brand_name: 'Adidas',
    unit_name: 'Piece',
    base_price: 29.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Office Chair',
    code: 'PROD-007',
    description: 'Ergonomic office chair with lumbar support',
    category_name: 'Home & Garden',
    brand_name: 'IKEA',
    unit_name: 'Piece',
    base_price: 199.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Garden Soil',
    code: 'PROD-008',
    description: 'Premium potting soil for gardens',
    category_name: 'Home & Garden',
    brand_name: 'Home Depot',
    unit_name: 'Bag',
    base_price: 12.99,
    tax_rate: 5.0,
    is_active: 'Y',
  },
  {
    name: 'Motor Oil',
    code: 'PROD-009',
    description: 'High-quality synthetic motor oil',
    category_name: 'Automotive',
    brand_name: 'Toyota',
    unit_name: 'Bottle',
    base_price: 24.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Car Battery',
    code: 'PROD-010',
    description: 'Long-lasting car battery',
    category_name: 'Automotive',
    brand_name: 'Honda',
    unit_name: 'Piece',
    base_price: 89.99,
    tax_rate: 8.0,
    is_active: 'Y',
  },
  {
    name: 'Programming Book',
    code: 'PROD-011',
    description: 'Complete guide to programming fundamentals',
    category_name: 'Books',
    brand_name: 'Penguin',
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
    // Get all categories, brands, and units for lookup
    const categories = await prisma.product_categories.findMany({
      select: { id: true, category_name: true },
    });
    
    const brands = await prisma.brands.findMany({
      select: { id: true, name: true },
    });
    
    const units = await prisma.unit_of_measurement.findMany({
      select: { id: true, name: true },
    });

    for (const product of mockProducts) {
      const existingProduct = await prisma.products.findFirst({
        where: { name: product.name },
      });

      if (!existingProduct) {
        // Find the category ID
        const category = categories.find(c => c.category_name === product.category_name);
        const brand = brands.find(b => b.name === product.brand_name);
        const unit = units.find(u => u.name === product.unit_name);

        if (category && brand && unit) {
          await prisma.products.create({
            data: {
              name: product.name,
              code: product.code,
              description: product.description,
              category_id: category.id,
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
