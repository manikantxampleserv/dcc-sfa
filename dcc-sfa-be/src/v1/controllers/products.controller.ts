import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface ProductSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  category: number;
  brand: number;
  unit_of_measurement: number;
  base_price?: number | null;
  tax_rate?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  batch_lots?: { id: number; batch_number: string; quantity: number }[];
  inventory_stock?: {
    id: number;
    location_id: number;
    current_stock: number;
  }[];
  price_history?: { id: number; price: number; effective_date: Date }[];
  order_items?: {
    id: number;
    order_id: number;
    quantity: number;
    price: number;
  }[];
  product_brands: { id: number; name: string; code: string; logo: string }[];
  product_unit_of_measurement: { id: number; name: string }[];
  product_categories_products: { id: number; name: string }[];
}

const generateProductsCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastProduct = await prisma.products.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastProduct && lastProduct.code) {
    const match = lastProduct.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};
const serializeProduct = (product: any): ProductSerialized => ({
  id: product.id,
  name: product.name,
  code: product.code,
  description: product.description,
  category: product.category,
  brand: product.brand,
  unit_of_measurement: product.unit_of_measurement,
  base_price: product.base_price,
  tax_rate: product.tax_rate,
  is_active: product.is_active,
  createdate: product.createdate,
  createdby: product.createdby,
  updatedate: product.updatedate,
  updatedby: product.updatedby,
  log_inst: product.log_inst,
  batch_lots:
    product.batch_lots_products?.map((b: any) => ({
      id: b.id,
      batch_number: b.batch_number,
      quantity: b.quantity,
    })) || [],
  inventory_stock:
    product.inventory_stock_products?.map((s: any) => ({
      id: s.id,
      location_id: s.location_id,
      current_stock: s.current_stock,
    })) || [],
  price_history:
    product.price_history_products?.map((p: any) => ({
      id: p.id,
      price: p.price,
      effective_date: p.effective_date,
    })) || [],
  order_items:
    product.order_items?.map((oi: any) => ({
      id: oi.id,
      order_id: oi.order_id,
      quantity: oi.quantity,
      price: oi.price,
    })) || [],
  product_brands:
    product.product_brands?.map((b: any) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      logo: b.logo,
    })) || [],
  product_unit_of_measurement:
    product.unit_of_measurement_products?.map((u: any) => ({
      id: u.id,
      name: u.name,
    })) || [],
  product_categories_products:
    product.product_categories_products?.map((c: any) => ({
      id: c.id,
      name: c.name,
    })) || [],
});

export const productsController = {
  async createProduct(req: Request, res: Response) {
    try {
      const data = req.body;
      const newCode = await generateProductsCode(data.name);

      const product = await prisma.products.create({
        data: {
          ...data,
          code: newCode,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          batch_lots_products: true,
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
        },
      });

      res.status(201).json({
        message: 'Product created successfully',
        data: serializeProduct(product),
      });
    } catch (error: any) {
      console.error('Create Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllProducts(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { category: { contains: searchLower } },
            { brand: { contains: searchLower } },
          ],
        }),

        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.products,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          batch_lots_products: true,
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
        },
      });

      const totalProducts = await prisma.products.count();
      const activeProducts = await prisma.products.count({
        where: { is_active: 'Y' },
      });
      const inactiveProducts = await prisma.products.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newProductsThisMonth = await prisma.products.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Products retrieved successfully',
        data.map((p: any) => serializeProduct(p)),
        200,
        pagination,
        {
          total_products: totalProducts,
          active_products: activeProducts,
          inactive_products: inactiveProducts,
          new_products_this_month: newProductsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Products Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.products.findUnique({
        where: { id: Number(id) },
        include: {
          batch_lots_products: true,
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
        },
      });

      if (!product)
        return res.status(404).json({ message: 'Product not found' });

      res.json({
        message: 'Product fetched successfully',
        data: serializeProduct(product),
      });
    } catch (error: any) {
      console.error('Get Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateProduct(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingProduct = await prisma.products.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProduct)
        return res.status(404).json({ message: 'Product not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const product = await prisma.products.update({
        where: { id: Number(id) },
        data,
        include: {
          batch_lots_products: true,
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
        },
      });

      res.json({
        message: 'Product updated successfully',
        data: serializeProduct(product),
      });
    } catch (error: any) {
      console.error('Update Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingProduct = await prisma.products.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProduct)
        return res.status(404).json({ message: 'Product not found' });

      await prisma.products.delete({ where: { id: Number(id) } });

      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      console.error('Delete Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
