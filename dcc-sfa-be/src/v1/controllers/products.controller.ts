import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface BatchLotInput {
  batch_lot_id: number;
  quantity: number;
}

interface ProductSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  category_id: number;
  sub_category_id: number;
  brand_id: number;
  unit_of_measurement: number;
  base_price?: number | null;
  tax_rate?: number | null;
  tax_id?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  route_type_id?: number | null;
  outlet_group_id?: number | null;
  tracking_type?: string | null;
  product_type_id?: number | null;
  product_target_group_id?: number | null;
  product_web_order_id?: number | null;
  volume_id?: number | null;
  flavour_id?: number | null;
  shelf_life_id?: number | null;
  vat_percentage?: number | null;
  weight_in_grams?: number | null;
  volume_in_liters?: number | null;

  batch_lots?: {
    id: number;
    batch_lot_id: number;
    batch_number: string;
    lot_number?: string | null;
    quantity: number;
    manufacturing_date?: Date | null;
    expiry_date?: Date | null;
    remaining_quantity?: number | null;
  }[];

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
  tax_master?: {
    id: number;
    name: string;
    code: string;
    tax_rate: number;
  } | null;
  product_type?: { id: number; name: string; code: string } | null;
  product_target_group?: { id: number; name: string; code: string } | null;
  product_web_order?: { id: number; name: string; code: string } | null;
  volume?: { id: number; name: string; code: string } | null;
  flavour?: { id: number; name: string; code: string } | null;
  shelf_life?: { id: number; name: string; code: string } | null;
}

const productInclude = {
  product_product_batches: {
    include: {
      batch_lot_product_batches: true,
    },
  },
  inventory_stock_products: true,
  price_history_products: true,
  order_items: true,
  product_brands: true,
  product_unit_of_measurement: true,
  product_categories_products: true,
  product_sub_categories_products: true,
  products_route_type: true,
  products_outlet_group: true,
  product_tax_master: true,
  product_types_products: true,
  product_target_groups_products: true,
  product_web_orders_products: true,
  product_volumes_products: true,
  product_flavours_products: true,
  product_shelf_life_products: true,
};

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
  sub_category_id: product.sub_category_id,
  brand_id: product.brand_id,
  unit_of_measurement: product.unit_of_measurement,
  base_price: product.base_price ? Number(product.base_price) : null,
  tax_rate: product.tax_rate ? Number(product.tax_rate) : null,
  tax_id: product.tax_id,
  is_active: product.is_active,
  createdate: product.createdate,
  createdby: product.createdby,
  updatedate: product.updatedate,
  updatedby: product.updatedby,
  log_inst: product.log_inst,
  route_type_id: product.route_type_id,
  outlet_group_id: product.outlet_group_id,
  tracking_type: product.tracking_type,
  product_type_id: product.product_type_id,
  product_target_group_id: product.product_target_group_id,
  product_web_order_id: product.product_web_order_id,
  volume_id: product.volume_id,
  flavour_id: product.flavour_id,
  shelf_life_id: product.shelf_life_id,
  vat_percentage: product.vat_percentage
    ? Number(product.vat_percentage)
    : null,
  weight_in_grams: product.weight_in_grams
    ? Number(product.weight_in_grams)
    : null,
  volume_in_liters: product.volume_in_liters
    ? Number(product.volume_in_liters)
    : null,

  batch_lots: normalizeToArray(product.product_product_batches).map(
    (pb: any) => ({
      id: pb.id,
      batch_lot_id: pb.batch_lot_id,
      batch_number: pb.batch_lot_product_batches?.batch_number,
      lot_number: pb.batch_lot_product_batches?.lot_number,
      quantity: pb.quantity,

      manufacturing_date: pb.batch_lot_product_batches?.manufacturing_date,
      expiry_date: pb.batch_lot_product_batches?.expiry_date,
      remaining_quantity: pb.batch_lot_product_batches?.remaining_quantity,
    })
  ),

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

  tax_master: product.product_tax_master
    ? {
        id: product.product_tax_master.id,
        name: product.product_tax_master.name,
        code: product.product_tax_master.code,
        tax_rate: Number(product.product_tax_master.tax_rate),
      }
    : null,

  product_type: product.product_types_products
    ? {
        id: product.product_types_products.id,
        name: product.product_types_products.name,
        code: product.product_types_products.code,
      }
    : null,

  product_target_group: product.product_target_groups_products
    ? {
        id: product.product_target_groups_products.id,
        name: product.product_target_groups_products.name,
        code: product.product_target_groups_products.code,
      }
    : null,

  product_web_order: product.product_web_orders_products
    ? {
        id: product.product_web_orders_products.id,
        name: product.product_web_orders_products.name,
        code: product.product_web_orders_products.code,
      }
    : null,

  volume: product.product_volumes_products
    ? {
        id: product.product_volumes_products.id,
        name: product.product_volumes_products.name,
        code: product.product_volumes_products.code,
      }
    : null,

  flavour: product.product_flavours_products
    ? {
        id: product.product_flavours_products.id,
        name: product.product_flavours_products.name,
        code: product.product_flavours_products.code,
      }
    : null,

  shelf_life: product.product_shelf_life_products
    ? {
        id: product.product_shelf_life_products.id,
        name: product.product_shelf_life_products.name,
        code: product.product_shelf_life_products.code,
      }
    : null,
});

async function createDefaultInventoryStock(
  tx: any,
  productId: number,
  locationId: number | null,
  userId: number
): Promise<void> {
  const finalLocationId = locationId || 1;

  await tx.inventory_stock.create({
    data: {
      product_id: productId,
      location_id: finalLocationId,
      current_stock: 0,
      reserved_stock: 0,
      available_stock: 0,
      minimum_stock: 0,
      maximum_stock: 0,
      batch_id: null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    },
  });
}

export const productsController = {
  // async createProduct(req: Request, res: Response) {
  //   try {
  //     const data = req.body;
  //     const userId = req.user?.id || 1;
  //     const batchLots: BatchLotInput[] = data.batch_lots || [];

  //     let productCode =
  //       data.code && data.code.trim() !== '' ? data.code.trim() : null;

  //     if (!productCode) {
  //       productCode = await generateProductsCode(data.name);
  //       let attempts = 0;
  //       while (attempts < 10) {
  //         const existing = await prisma.products.findUnique({
  //           where: { code: productCode },
  //         });
  //         if (!existing) break;
  //         productCode = await generateProductsCode(data.name);
  //         attempts++;
  //       }
  //     } else {
  //       const existingProduct = await prisma.products.findUnique({
  //         where: { code: productCode },
  //       });

  //       if (existingProduct) {
  //         return res
  //           .status(400)
  //           .json({ message: 'Product code already exists' });
  //       }
  //     }

  //     if (batchLots.length > 0) {
  //       const batchLotIds = batchLots.map(b => b.batch_lot_id);

  //       const uniqueIds = new Set(batchLotIds);
  //       if (uniqueIds.size !== batchLotIds.length) {
  //         return res.status(400).json({
  //           message: 'Duplicate batch_lot_id found in the request',
  //         });
  //       }

  //       const existingBatchLots = await prisma.batch_lots.findMany({
  //         where: { id: { in: batchLotIds } },
  //         select: { id: true, batch_number: true, lot_number: true },
  //       });

  //       const foundIds = existingBatchLots.map(b => b.id);
  //       const missingIds = batchLotIds.filter(id => !foundIds.includes(id));

  //       if (missingIds.length > 0) {
  //         return res.status(400).json({
  //           message: `Batch lots with IDs ${missingIds.join(', ')} not found`,
  //         });
  //       }
  //     }

  //     const product = await prisma.products.create({
  //       data: {
  //         name: data.name,
  //         code: productCode,
  //         description: data.description || null,
  //         category_id: data.category_id,
  //         sub_category_id: data.sub_category_id,
  //         brand_id: data.brand_id,
  //         unit_of_measurement: data.unit_of_measurement,
  //         base_price: data.base_price || null,
  //         tax_rate: data.tax_rate || null,
  //         tax_id: data.tax_id || null,
  //         is_active: data.is_active || 'Y',
  //         route_type_id: data.route_type_id || null,
  //         outlet_group_id: data.outlet_group_id || null,
  //         tracking_type: data.tracking_type || null,
  //         product_type_id: data.product_type_id || null,
  //         product_target_group_id: data.product_target_group_id || null,
  //         product_web_order_id: data.product_web_order_id || null,
  //         volume_id: data.volume_id || null,
  //         flavour_id: data.flavour_id || null,
  //         shelf_life_id: data.shelf_life_id || null,
  //         vat_percentage: data.vat_percentage || null,
  //         weight_in_grams: data.weight_in_grams || null,
  //         volume_in_liters: data.volume_in_liters || null,
  //         createdate: new Date(),
  //         createdby: userId,
  //         log_inst: data.log_inst || 1,
  //       },
  //     });

  //     if (batchLots.length > 0) {
  //       for (const batchLot of batchLots) {
  //         await prisma.product_batches.create({
  //           data: {
  //             product_id: product.id,
  //             batch_lot_id: batchLot.batch_lot_id,
  //             quantity: batchLot.quantity,
  //             is_active: 'Y',
  //             createdate: new Date(),
  //             createdby: userId,
  //             log_inst: 1,
  //           },
  //         });
  //       }
  //     }

  //     const completeProduct = await prisma.products.findUnique({
  //       where: { id: product.id },
  //       include: productInclude,
  //     });

  //     res.status(201).json({
  //       message: 'Product created successfully',
  //       data: serializeProduct(completeProduct),
  //     });
  //   } catch (error: any) {
  //     console.error('Create Product Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  async createProduct(req: Request, res: Response) {
    try {
      const data = req.body;
      const userId = req.user?.id || 1;
      const batchLots: BatchLotInput[] = data.batch_lots || [];

      let productCode =
        data.code && data.code.trim() !== '' ? data.code.trim() : null;

      if (!productCode) {
        productCode = await generateProductsCode(data.name);
        let attempts = 0;
        while (attempts < 10) {
          const existing = await prisma.products.findUnique({
            where: { code: productCode },
          });
          if (!existing) break;
          productCode = await generateProductsCode(data.name);
          attempts++;
        }
      } else {
        const existingProduct = await prisma.products.findUnique({
          where: { code: productCode },
        });

        if (existingProduct) {
          return res
            .status(400)
            .json({ message: 'Product code already exists' });
        }
      }

      if (batchLots.length > 0) {
        const batchLotIds = batchLots.map(b => b.batch_lot_id);

        const uniqueIds = new Set(batchLotIds);
        if (uniqueIds.size !== batchLotIds.length) {
          return res.status(400).json({
            message: 'Duplicate batch_lot_id found in the request',
          });
        }

        const existingBatchLots = await prisma.batch_lots.findMany({
          where: { id: { in: batchLotIds } },
          select: { id: true, batch_number: true, lot_number: true },
        });

        const foundIds = existingBatchLots.map(b => b.id);
        const missingIds = batchLotIds.filter(id => !foundIds.includes(id));

        if (missingIds.length > 0) {
          return res.status(400).json({
            message: `Batch lots with IDs ${missingIds.join(', ')} not found`,
          });
        }
      }

      const result = await prisma.$transaction(async tx => {
        const product = await tx.products.create({
          data: {
            name: data.name,
            code: productCode,
            description: data.description || null,
            category_id: data.category_id,
            sub_category_id: data.sub_category_id,
            brand_id: data.brand_id,
            unit_of_measurement: data.unit_of_measurement,
            base_price: data.base_price || null,
            tax_rate: data.tax_rate || null,
            tax_id: data.tax_id || null,
            is_active: data.is_active || 'Y',
            route_type_id: data.route_type_id || null,
            outlet_group_id: data.outlet_group_id || null,
            tracking_type: data.tracking_type || 'none',
            product_type_id: data.product_type_id || null,
            product_target_group_id: data.product_target_group_id || null,
            product_web_order_id: data.product_web_order_id || null,
            volume_id: data.volume_id || null,
            flavour_id: data.flavour_id || null,
            shelf_life_id: data.shelf_life_id || null,
            vat_percentage: data.vat_percentage || null,
            weight_in_grams: data.weight_in_grams || null,
            volume_in_liters: data.volume_in_liters || null,
            createdate: new Date(),
            createdby: userId,
            log_inst: data.log_inst || 1,
          },
        });

        if (batchLots.length > 0) {
          for (const batchLot of batchLots) {
            await tx.product_batches.create({
              data: {
                product_id: product.id,
                batch_lot_id: batchLot.batch_lot_id,
                quantity: batchLot.quantity,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });
          }
        }

        // Create default inventory stock if tracking_type is 'none'
        if (product.tracking_type === 'none') {
          await createDefaultInventoryStock(
            tx,
            product.id,
            data.location_id || null,
            userId
          );
        }

        return product;
      });

      const completeProduct = await prisma.products.findUnique({
        where: { id: result.id },
        include: productInclude,
      });

      res.status(201).json({
        message: 'Product created successfully',
        data: serializeProduct(completeProduct),
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
          product_product_batches: {
            include: {
              batch_lot_product_batches: true,
            },
          },
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
          product_tax_master: true,
          product_types_products: true,
          product_target_groups_products: true,
          product_web_orders_products: true,
          product_volumes_products: true,
          product_flavours_products: true,
          product_shelf_life_products: true,
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
          product_product_batches: {
            include: {
              batch_lot_product_batches: true,
            },
          },
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
          product_tax_master: true,
          product_types_products: true,
          product_target_groups_products: true,
          product_web_orders_products: true,
          product_volumes_products: true,
          product_flavours_products: true,
          product_shelf_life_products: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

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
      const userId = req.user?.id || 1;

      const existingProduct = await prisma.products.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const { code, batch_lots, ...restData } = req.body;

      const updateData: any = {
        ...restData,
        ...(code && code.trim() !== '' && { code }),
        updatedate: new Date(),
        updatedby: userId,
      };

      if (updateData.code && updateData.code !== existingProduct.code) {
        const existingCode = await prisma.products.findFirst({
          where: {
            code: updateData.code,
            id: { not: Number(id) },
          },
        });

        if (existingCode) {
          return res
            .status(400)
            .json({ message: 'Product code already exists' });
        }
      }

      if (batch_lots !== undefined) {
        if (Array.isArray(batch_lots) && batch_lots.length > 0) {
          const batchLotIds = batch_lots.map((b: any) => b.batch_lot_id);

          const uniqueIds = new Set(batchLotIds);
          if (uniqueIds.size !== batchLotIds.length) {
            return res.status(400).json({
              message: 'Duplicate batch_lot_id found in the request',
            });
          }

          const existingBatchLots = await prisma.batch_lots.findMany({
            where: { id: { in: batchLotIds } },
            select: { id: true },
          });

          const foundIds = existingBatchLots.map(b => b.id);
          const missingIds = batchLotIds.filter(
            (batchId: number) => !foundIds.includes(batchId)
          );

          if (missingIds.length > 0) {
            return res.status(400).json({
              message: `Batch lots with IDs ${missingIds.join(', ')} not found`,
            });
          }
        }

        await prisma.product_batches.deleteMany({
          where: { product_id: Number(id) },
        });

        if (Array.isArray(batch_lots) && batch_lots.length > 0) {
          for (const batchLot of batch_lots) {
            await prisma.product_batches.create({
              data: {
                product_id: Number(id),
                batch_lot_id: batchLot.batch_lot_id,
                quantity: batchLot.quantity,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });
          }
        }
      }

      await prisma.products.update({
        where: { id: Number(id) },
        data: updateData,
      });

      const product = await prisma.products.findUnique({
        where: { id: Number(id) },
        include: {
          product_product_batches: {
            include: {
              batch_lot_product_batches: true,
            },
          },
          inventory_stock_products: true,
          price_history_products: true,
          order_items: true,
          product_brands: true,
          product_unit_of_measurement: true,
          product_categories_products: true,
          product_sub_categories_products: true,
          products_route_type: true,
          products_outlet_group: true,
          product_tax_master: true,
          product_types_products: true,
          product_target_groups_products: true,
          product_web_orders_products: true,
          product_volumes_products: true,
          product_flavours_products: true,
          product_shelf_life_products: true,
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
          batchLots: {
            select: {
              id: true,
              batch_number: true,
              lot_number: true,
              remaining_quantity: true,
            },
          },
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
