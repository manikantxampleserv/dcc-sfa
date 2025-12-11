import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface ProductSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  category_id: number;
  brand_id: number;
  unit_of_measurement: number;
  base_price?: number | null;
  tax_rate?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  route_type_id?: number | null;
  outlet_group_id?: number | null;
  tracking_type?: string | null;
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
  product_brand: { id: number; name: string; code: string; logo: string };
  product_unit: { id: number; name: string };
  product_category: { id: number; category_name: string };
  product_sub_category: { id: number; sub_category_name: string };
  route_type?: { id: number; name: string } | null;
  outlet_group?: { id: number; name: string; code: string } | null;
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

const normalizeToArray = (value: any) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const serializeProduct = (product: any): ProductSerialized => ({
  id: product.id,
  name: product.name,
  code: product.code,
  description: product.description,
  category_id: product.category_id,
  brand_id: product.brand_id,
  unit_of_measurement: product.unit_of_measurement,
  base_price: product.base_price,
  tax_rate: product.tax_rate,
  is_active: product.is_active,
  createdate: product.createdate,
  createdby: product.createdby,
  updatedate: product.updatedate,
  updatedby: product.updatedby,
  log_inst: product.log_inst,
  route_type_id: product.route_type_id,
  outlet_group_id: product.outlet_group_id,
  tracking_type: product.tracking_type,

  batch_lots: normalizeToArray(product.batch_lots_products).map((b: any) => ({
    id: b.id,
    batch_number: b.batch_number,
    quantity: b.quantity,
  })),

  inventory_stock: normalizeToArray(product.inventory_stock_products).map(
    (s: any) => ({
      id: s.id,
      location_id: s.location_id,
      current_stock: s.current_stock,
    })
  ),

  price_history: normalizeToArray(product.price_history_products).map(
    (p: any) => ({
      id: p.id,
      price: p.price,
      effective_date: p.effective_date,
    })
  ),

  order_items: normalizeToArray(product.order_items).map((oi: any) => ({
    id: oi.id,
    order_id: oi.order_id,
    quantity: oi.quantity,
    price: oi.price,
  })),

  product_brand: {
    id: product.product_brands?.id,
    name: product.product_brands?.name,
    code: product.product_brands?.code,
    logo: product.product_brands?.logo,
  },

  product_unit: {
    id: product.product_unit_of_measurement?.id,
    name: product.product_unit_of_measurement?.name,
  },

  product_category: {
    id: product.product_categories_products?.id,
    category_name: product.product_categories_products?.category_name,
  },
  product_sub_category: {
    id: product.product_sub_categories_products?.id,
    sub_category_name:
      product.product_sub_categories_products?.sub_category_name,
  },
  route_type: product.products_route_type
    ? {
        id: product.products_route_type.id,
        name: product.products_route_type.name,
      }
    : null,
  outlet_group: product.products_outlet_group
    ? {
        id: product.products_outlet_group.id,
        name: product.products_outlet_group.name,
        code: product.products_outlet_group.code,
      }
    : null,
});

export const productsController = {
  async createProduct(req: Request, res: Response) {
    try {
      const data = req.body;
      const newCode = await generateProductsCode(data.name);

      const product = await prisma.products.create({
        data: {
          name: data.name,
          code: newCode,
          description: data.description,
          category_id: data.category_id,
          sub_category_id: data.sub_category_id,
          brand_id: data.brand_id,
          unit_of_measurement: data.unit_of_measurement,
          base_price: data.base_price,
          tax_rate: data.tax_rate,
          is_active: data.is_active || 'Y',
          route_type_id: data.route_type_id || null,
          outlet_group_id: data.outlet_group_id || null,
          tracking_type: data.tracking_type || null,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        } as any,
        include: {
          batch_lots_products: true,
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
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
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
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
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
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
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
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

  async getProductDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '', product_id } = req.query;
      const searchLower = search.toLowerCase().trim();
      const productId = product_id ? Number(product_id) : null;

      const where: any = {
        is_active: 'Y',
      };

      if (productId) {
        where.id = productId;
      } else if (searchLower) {
        where.OR = [
          {
            name: {
              contains: searchLower,
            },
          },
          {
            code: {
              contains: searchLower,
            },
          },
        ];
      }

      const products = await prisma.products.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 50,
      });

      res.success('Products dropdown fetched successfully', products, 200);
    } catch (error: any) {
      console.error('Error fetching products dropdown:', error);
      res.error(error.message);
    }
  },
};
