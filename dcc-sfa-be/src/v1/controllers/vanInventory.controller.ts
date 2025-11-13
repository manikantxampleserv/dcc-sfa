import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface VanInventoryItemSerialized {
  id: number;
  parent_id: number;
  product_id: number;
  product_name?: string | null;
  unit?: string | null;
  quantity?: number | null;
  unit_price?: string | null;
  discount_amount?: string | null;
  tax_amount?: string | null;
  total_amount?: string | null;
  notes?: string | null;
}

interface VanInventorySerialized {
  id: number;
  user_id: number;
  status: string;
  loading_type: string;
  document_date?: Date | null;
  last_updated?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  vehicle_id?: number | null;
  location_type?: string | null;
  user?: { id: number; name: string; email: string } | null;
  vehicle?: { id: number; vehicle_number: string; type: string } | null;
  items?: VanInventoryItemSerialized[] | null;
}

const serializeVanInventory = (item: any): VanInventorySerialized => ({
  id: item.id,
  user_id: item.user_id,
  status: item.status,
  loading_type: item.loading_type,
  document_date: item.document_date,
  last_updated: item.last_updated,
  is_active: item.is_active,
  createdate: item.createdate,
  createdby: item.createdby,
  updatedate: item.updatedate,
  updatedby: item.updatedby,
  log_inst: item.log_inst,
  vehicle_id: item.vehicle_id,
  location_type: item.location_type,
  user: item.van_inventory_users
    ? {
        id: item.van_inventory_users.id,
        name: item.van_inventory_users.name,
        email: item.van_inventory_users.email,
      }
    : null,
  vehicle: item.vehicle
    ? {
        id: item.vehicle.id,
        vehicle_number: item.vehicle.vehicle_number,
        type: item.vehicle.type,
      }
    : null,
  items:
    item.van_inventory_items_inventory?.map((it: any) => ({
      id: it.id,
      parent_id: it.parent_id,
      product_id: it.product_id,
      product_name: it.product_name,
      unit: it.unit,
      quantity: it.quantity,
      unit_price: it.unit_price ? String(it.unit_price) : undefined,
      discount_amount: it.discount_amount
        ? String(it.discount_amount)
        : undefined,
      tax_amount: it.tax_amount ? String(it.tax_amount) : undefined,
      total_amount: it.total_amount ? String(it.total_amount) : undefined,
      notes: it.notes,
    })) || [],
});

export const vanInventoryController = {
  async createOrUpdateVanInventory(req: Request, res: Response) {
    const data = req.body;
    const userId = (req as any).user?.id || 1;
    const { van_inventory_items, inventoryItems, ...inventoryData } = data;
    const items = van_inventory_items || inventoryItems || [];
    let inventoryId = inventoryData.id;

    try {
      const result = await prisma.$transaction(
        async tx => {
          let inventory;
          let isUpdate = false;

          if (inventoryId) {
            const existing = await tx.van_inventory.findUnique({
              where: { id: Number(inventoryId) },
            });
            if (existing) isUpdate = true;
          }

          if (!inventoryData.user_id) {
            throw new Error('Invalid user_id: missing');
          }
          const userExists = await tx.users.findUnique({
            where: { id: Number(inventoryData.user_id) },
          });
          if (!userExists)
            throw new Error(`Invalid user_id: ${inventoryData.user_id}`);

          if (inventoryData.vehicle_id) {
            const vehicleExists = await tx.vehicles.findUnique({
              where: { id: Number(inventoryData.vehicle_id) },
            });
            if (!vehicleExists)
              throw new Error(
                `Invalid vehicle_id: ${inventoryData.vehicle_id}`
              );
          }

          if (Array.isArray(items) && items.length > 0) {
            for (const it of items) {
              if (!it.product_id) {
                throw new Error(
                  'Invalid product_id in items: missing product_id'
                );
              }
              const productExists = await tx.products.findUnique({
                where: { id: Number(it.product_id) },
              });
              if (!productExists)
                throw new Error(
                  `Invalid product_id in items: ${it.product_id}`
                );
            }
          }

          const payload = {
            user_id: Number(inventoryData.user_id),
            status: inventoryData.status || 'A',
            loading_type: inventoryData.loading_type || 'L',
            document_date:
              inventoryData.document_date &&
              inventoryData.document_date.trim() !== ''
                ? new Date(inventoryData.document_date)
                : new Date(),
            vehicle_id: inventoryData.vehicle_id || null,
            location_type: inventoryData.location_type || 'van',
            is_active: inventoryData.is_active || 'Y',
          };

          if (isUpdate && inventoryId) {
            inventory = await tx.van_inventory.update({
              where: { id: Number(inventoryId) },
              data: {
                ...payload,
                updatedby: userId,
                updatedate: new Date(),
                log_inst: { increment: 1 },
              },
            });
          } else {
            inventory = await tx.van_inventory.create({
              data: {
                ...payload,
                createdby: userId,
                createdate: new Date(),
                log_inst: 1,
              },
            });
            inventoryId = inventory.id;
          }

          const processedItemIds: number[] = [];

          if (Array.isArray(items) && items.length > 0) {
            const itemsToCreate: any[] = [];
            const itemsToUpdate: { id: number; data: any }[] = [];

            for (const item of items) {
              const qty =
                item.quantity !== undefined ? parseInt(item.quantity, 10) : 0;
              const itemData = {
                parent_id: inventory.id,
                product_id: Number(item.product_id),
                product_name: item.product_name || null,
                unit: item.unit || null,
                quantity: Number.isNaN(qty) ? 0 : qty,
                unit_price: item.unit_price || 0,
                discount_amount: item.discount_amount || 0,
                tax_amount: item.tax_amount || 0,
                total_amount: item.total_amount || 0,
                notes: item.notes || null,
              };

              if (item.id) {
                const existingItem = await tx.van_inventory_items.findFirst({
                  where: { id: Number(item.id), parent_id: inventory.id },
                });

                if (existingItem) {
                  itemsToUpdate.push({ id: Number(item.id), data: itemData });
                  processedItemIds.push(Number(item.id));
                } else {
                  itemsToCreate.push(itemData);
                }
              } else {
                itemsToCreate.push(itemData);
              }
            }

            if (itemsToCreate.length > 0) {
              const created = await tx.van_inventory_items.createMany({
                data: itemsToCreate,
              });

              if (created.count > 0) {
                const newItems = await tx.van_inventory_items.findMany({
                  where: { parent_id: inventory.id },
                  orderBy: { id: 'desc' },
                  take: created.count,
                });
                processedItemIds.push(...newItems.map(i => i.id));
              }
            }

            for (const { id, data } of itemsToUpdate) {
              await tx.van_inventory_items.update({
                where: { id },
                data,
              });
            }

            if (isUpdate) {
              await tx.van_inventory_items.deleteMany({
                where: {
                  parent_id: inventory.id,
                  ...(processedItemIds.length > 0
                    ? { id: { notIn: processedItemIds } }
                    : {}),
                },
              });
            }
          } else if (isUpdate) {
            await tx.van_inventory_items.deleteMany({
              where: { parent_id: inventory.id },
            });
          }

          const finalInventory = await tx.van_inventory.findUnique({
            where: { id: inventory.id },
            include: {
              van_inventory_users: true,
              vehicle: true,
              van_inventory_items_inventory: true,
              van_inventory_stock_movements: true,
            },
          });

          return { finalInventory, wasUpdate: isUpdate };
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );
      const finalInventory = (result as any).finalInventory;
      const wasUpdate = (result as any).wasUpdate === true;

      res.status(wasUpdate ? 200 : 201).json({
        message: wasUpdate
          ? 'Van Inventory updated successfully'
          : 'Van Inventory created successfully',
        data: serializeVanInventory(finalInventory),
      });
    } catch (error: any) {
      console.error('Create/Update Van Inventory Error:', error);

      if (error.message && error.message.startsWith('Invalid')) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message && error.message.includes('missing')) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: 'Failed to process van inventory',
        error: error.message,
      });
    }
  },

  async getAllVanInventory(req: any, res: any) {
    try {
      const { page, limit, search, status, user_id } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { van_inventory_users: { name: { contains: searchLower } } },
            { vehicle: { vehicle_number: { contains: searchLower } } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(user_id && { user_id: parseInt(user_id as string, 10) }),
      };

      const { data, pagination } = await paginate({
        model: prisma.van_inventory,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          van_inventory_users: true,
          vehicle: true,
          van_inventory_items_inventory: true,
          van_inventory_stock_movements: true,
        },
      });

      const [
        totalVanInventory,
        activeVanInventory,
        inactiveVanInventory,
        vanInventoryThisMonth,
      ] = await Promise.all([
        prisma.van_inventory.count(),
        prisma.van_inventory.count({ where: { is_active: 'Y' } }),
        prisma.van_inventory.count({ where: { is_active: 'N' } }),
        prisma.van_inventory.count({
          where: {
            createdate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lt: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                1
              ),
            },
          },
        }),
      ]);

      const serializedData = data.map((v: any) => serializeVanInventory(v));

      res.success(
        'Van inventory fetched successfully',
        serializedData,
        200,
        pagination,
        {
          total_records: totalVanInventory,
          active_records: activeVanInventory,
          inactive_records: inactiveVanInventory,
          van_inventory_this_month: vanInventoryThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getVanInventoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
        include: {
          van_inventory_users: true,
          van_inventory_stock_movements: true,
          van_inventory_items_inventory: true,
          vehicle: true,
        },
      });

      if (!record)
        return res.status(404).json({ message: 'Van inventory not found' });

      res.json({
        message: 'Van inventory fetched successfully',
        data: serializeVanInventory(record),
      });
    } catch (error: any) {
      console.error('Get Van Inventory by ID Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateVanInventory(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Van inventory not found' });

      const updated = await prisma.van_inventory.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          updatedby: (req as any).user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          van_inventory_users: true,
          vehicle: true,
        },
      });

      res.json({
        message: 'Van inventory updated successfully',
        data: serializeVanInventory(updated),
      });
    } catch (error: any) {
      console.error('Update Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVanInventory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Van inventory not found' });

      await prisma.van_inventory.delete({ where: { id: Number(id) } });
      res.json({ message: 'Van inventory deleted successfully' });
    } catch (error: any) {
      console.error('Delete Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Van Inventory Items Management
  async createVanInventoryItem(req: Request, res: Response) {
    try {
      const { vanInventoryId } = req.params;
      const data = req.body;

      if (!data.product_id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      if (!data.quantity) {
        return res.status(400).json({ message: 'Quantity is required' });
      }
      if (!data.unit_price) {
        return res.status(400).json({ message: 'Unit price is required' });
      }

      const vanInventory = await prisma.van_inventory.findUnique({
        where: { id: Number(vanInventoryId) },
      });

      if (!vanInventory) {
        return res.status(404).json({ message: 'Van inventory not found' });
      }

      const product = await prisma.products.findUnique({
        where: { id: Number(data.product_id) },
        include: {
          product_unit_of_measurement: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const vanInventoryItem = await prisma.van_inventory_items.create({
        data: {
          parent_id: Number(vanInventoryId),
          product_id: Number(data.product_id),
          product_name: product.name,
          unit:
            product.product_unit_of_measurement?.name ||
            product.product_unit_of_measurement?.symbol ||
            'pcs',
          quantity: Number(data.quantity),
          unit_price: Number(data.unit_price),
          discount_amount: Number(data.discount_amount) || 0,
          tax_amount: Number(data.tax_amount) || 0,
          total_amount:
            Number(data.quantity) * Number(data.unit_price) -
            (Number(data.discount_amount) || 0) +
            (Number(data.tax_amount) || 0),
          notes: data.notes || null,
        },
        include: {
          van_inventory_items_products: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Van inventory item created successfully',
        data: vanInventoryItem,
      });
    } catch (error: any) {
      console.error('Create Van Inventory Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getVanInventoryItems(req: Request, res: Response) {
    try {
      const { vanInventoryId } = req.params;

      const vanInventoryItems = await prisma.van_inventory_items.findMany({
        where: { parent_id: Number(vanInventoryId) },
        include: {
          van_inventory_items_products: {
            include: {
              product_unit_of_measurement: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      res.json({
        success: true,
        message: 'Van inventory items retrieved successfully',
        data: vanInventoryItems,
      });
    } catch (error: any) {
      console.error('Get Van Inventory Items Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateVanInventoryItem(req: Request, res: Response) {
    try {
      const { vanInventoryId, itemId } = req.params;
      const data = req.body;

      const existingItem = await prisma.van_inventory_items.findFirst({
        where: {
          id: Number(itemId),
          parent_id: Number(vanInventoryId),
        },
      });

      if (!existingItem) {
        return res
          .status(404)
          .json({ message: 'Van inventory item not found' });
      }

      const vanInventoryItem = await prisma.van_inventory_items.update({
        where: { id: Number(itemId) },
        data: {
          quantity: data.quantity ? Number(data.quantity) : undefined,
          unit_price: data.unit_price ? Number(data.unit_price) : undefined,
          discount_amount:
            data.discount_amount !== undefined
              ? Number(data.discount_amount)
              : undefined,
          tax_amount:
            data.tax_amount !== undefined ? Number(data.tax_amount) : undefined,
          total_amount:
            data.quantity && data.unit_price
              ? Number(data.quantity) * Number(data.unit_price) -
                (Number(data.discount_amount) || 0) +
                (Number(data.tax_amount) || 0)
              : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: {
          van_inventory_items_products: true,
        },
      });

      res.json({
        success: true,
        message: 'Van inventory item updated successfully',
        data: vanInventoryItem,
      });
    } catch (error: any) {
      console.error('Update Van Inventory Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVanInventoryItem(req: Request, res: Response) {
    try {
      const { vanInventoryId, itemId } = req.params;

      const existingItem = await prisma.van_inventory_items.findFirst({
        where: {
          id: Number(itemId),
          parent_id: Number(vanInventoryId),
        },
      });

      if (!existingItem) {
        return res
          .status(404)
          .json({ message: 'Van inventory item not found' });
      }

      await prisma.van_inventory_items.delete({
        where: { id: Number(itemId) },
      });

      res.json({
        success: true,
        message: 'Van inventory item deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Van Inventory Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async bulkUpdateVanInventoryItems(req: Request, res: Response) {
    try {
      const { vanInventoryId } = req.params;
      const { vanInventoryItems } = req.body;

      if (!Array.isArray(vanInventoryItems)) {
        return res
          .status(400)
          .json({ message: 'Van inventory items must be an array' });
      }

      const vanInventory = await prisma.van_inventory.findUnique({
        where: { id: Number(vanInventoryId) },
      });

      if (!vanInventory) {
        return res.status(404).json({ message: 'Van inventory not found' });
      }

      const result = await prisma.$transaction(async tx => {
        await tx.van_inventory_items.deleteMany({
          where: { parent_id: Number(vanInventoryId) },
        });

        const newVanInventoryItems = [];
        for (const item of vanInventoryItems) {
          if (item.product_id && item.quantity && item.unit_price) {
            const product = await tx.products.findUnique({
              where: { id: Number(item.product_id) },
              include: {
                product_unit_of_measurement: true,
              },
            });

            if (product) {
              const vanInventoryItem = await tx.van_inventory_items.create({
                data: {
                  parent_id: Number(vanInventoryId),
                  product_id: Number(item.product_id),
                  product_name: product.name,
                  unit:
                    product.product_unit_of_measurement?.name ||
                    product.product_unit_of_measurement?.symbol ||
                    'pcs',
                  quantity: Number(item.quantity),
                  unit_price: Number(item.unit_price),
                  discount_amount: Number(item.discount_amount) || 0,
                  tax_amount: Number(item.tax_amount) || 0,
                  total_amount:
                    Number(item.quantity) * Number(item.unit_price) -
                    (Number(item.discount_amount) || 0) +
                    (Number(item.tax_amount) || 0),
                  notes: item.notes || null,
                },
              });
              newVanInventoryItems.push(vanInventoryItem);
            }
          }
        }

        return newVanInventoryItems;
      });

      res.json({
        success: true,
        message: 'Van inventory items updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Bulk Update Van Inventory Items Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
