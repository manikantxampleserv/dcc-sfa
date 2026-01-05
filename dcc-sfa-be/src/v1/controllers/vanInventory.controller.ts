import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
interface SalespersonData {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  profile_image: string | null;
}
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
  batch_lot_id?: number | null;
  batch_number?: string | null;
  lot_number?: string | null;
  expiry_date?: Date | null;
  product_remaining_quantity?: number | null;
  batch_total_remaining_quantity?: number | null;
  product_serials?: Array<{
    id: number;
    serial_number: string;
    status: string;
    warranty_expiry?: Date | null;
  }> | null;
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
  location_id?: number | null;
  location_type?: string | null;
  user?: { id: number; name: string; email: string } | null;
  vehicle?: { id: number; vehicle_number: string; type: string } | null;
  depot?: { id: number; name: string; code: string } | null;
  items?: VanInventoryItemSerialized[] | null;
}

const serializeVanInventory = (item: any): VanInventorySerialized => {
  return {
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
    location_id: item.location_id,
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
    depot: item.van_inventory_depot
      ? {
          id: item.van_inventory_depot.id,
          name: item.van_inventory_depot.name,
          code: item.van_inventory_depot.code,
        }
      : null,
    items:
      item.van_inventory_items_inventory?.map((it: any) => {
        let productBatch = null;
        let batchLot = null;
        let serialNumbers = null;

        if (
          it.batch_lot_id &&
          it.van_inventory_items_products?.product_product_batches
        ) {
          productBatch =
            it.van_inventory_items_products.product_product_batches.find(
              (pb: any) => pb.batch_lot_id === it.batch_lot_id
            );

          if (productBatch?.batch_lot_product_batches) {
            batchLot = productBatch.batch_lot_product_batches;
          }
        }

        if (it.van_inventory_items_products?.serial_numbers_products) {
          const serials =
            it.van_inventory_items_products.serial_numbers_products;
          if (serials && serials.length > 0) {
            serialNumbers = serials.map((sn: any) => ({
              id: sn.id,
              serial_number: sn.serial_number,
              status: sn.status,
              warranty_expiry: sn.warranty_expiry || null,
              batch_id: sn.batch_id || null,
              customer_id: sn.customer_id || null,
              customer: sn.serial_numbers_customers
                ? {
                    id: sn.serial_numbers_customers.id,
                    name: sn.serial_numbers_customers.name,
                    email: sn.serial_numbers_customers.email,
                  }
                : null,
              sold_date: sn.sold_date || null,
              created_date: sn.createdate || null,
            }));
          }
        }

        const result = {
          id: it.id,
          parent_id: it.parent_id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit: it.unit,
          quantity: it.quantity,
          unit_price: it.unit_price ? String(it.unit_price) : null,
          discount_amount: it.discount_amount
            ? String(it.discount_amount)
            : null,
          tax_amount: it.tax_amount ? String(it.tax_amount) : null,
          total_amount: it.total_amount ? String(it.total_amount) : null,
          notes: it.notes,
          batch_lot_id: it.batch_lot_id,
          batch_number: batchLot?.batch_number || null,
          lot_number: batchLot?.lot_number || null,
          expiry_date: batchLot?.expiry_date || null,
          product_remaining_quantity: productBatch?.quantity ?? null,
          batch_total_remaining_quantity: batchLot?.remaining_quantity ?? null,
          product_serials:
            serialNumbers && serialNumbers.length > 0 ? serialNumbers : null,
        };

        return result;
      }) || [],
  };
};

async function updateBatchLotQuantity(
  tx: any,
  batchLotId: number | null,
  quantity: number,
  loadingType: string
): Promise<void> {
  if (!batchLotId) {
    throw new Error('batchLotId is required');
  }

  const batchLot = await tx.batch_lots.findUnique({
    where: { id: batchLotId },
  });

  if (!batchLot) {
    throw new Error(`Batch lot with ID ${batchLotId} not found`);
  }

  if (batchLot.is_active !== 'Y') {
    throw new Error(`Batch lot ${batchLot.batch_number} is not active`);
  }

  if (new Date(batchLot.expiry_date) < new Date()) {
    throw new Error(`Batch lot ${batchLot.batch_number} has expired`);
  }

  let newRemainingQuantity: number;

  if (loadingType === 'U') {
    newRemainingQuantity = batchLot.remaining_quantity - quantity;
    if (newRemainingQuantity < 0) {
      throw new Error(
        `Insufficient quantity in batch ${batchLot.batch_number}. Available: ${batchLot.remaining_quantity}, Requested: ${quantity}`
      );
    }
  } else if (loadingType === 'L') {
    newRemainingQuantity = batchLot.remaining_quantity + quantity;
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }

  await tx.batch_lots.update({
    where: { id: batchLotId },
    data: {
      remaining_quantity: newRemainingQuantity,
      updatedate: new Date(),
    },
  });
}

async function updateProductBatchQuantity(
  tx: any,
  productId: number,
  batchLotId: number | null,
  quantity: number,
  loadingType: string
): Promise<void> {
  if (!batchLotId) {
    throw new Error('batchLotId is required');
  }

  const productBatch = await tx.product_batches.findFirst({
    where: {
      product_id: productId,
      batch_lot_id: batchLotId,
      is_active: 'Y',
    },
  });

  if (!productBatch) {
    throw new Error(
      `Product batch not found for product ${productId} and batch ${batchLotId}`
    );
  }

  let newQuantity: number;

  if (loadingType === 'U') {
    newQuantity = productBatch.quantity - quantity;
    if (newQuantity < 0) {
      throw new Error(
        `Insufficient quantity in product batch. Available: ${productBatch.quantity}, Requested: ${quantity}`
      );
    }
  } else if (loadingType === 'L') {
    newQuantity = productBatch.quantity + quantity;
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }

  await tx.product_batches.update({
    where: { id: productBatch.id },
    data: {
      quantity: newQuantity,
      updatedate: new Date(),
    },
  });
}
1;

async function getAvailableBatchesForProduct(
  tx: any,
  productId: number,
  loadingType: string
): Promise<any[]> {
  const productBatches = await tx.product_batches.findMany({
    where: {
      product_id: productId,
      is_active: 'Y',
    },
    include: {
      batch_lot_product_batches: true,
    },
  });

  const batches = productBatches
    .filter((pb: any) => {
      const bl = pb.batch_lot_product_batches;
      if (!bl || bl.is_active !== 'Y') return false;
      if (new Date(bl.expiry_date) <= new Date()) return false;

      if (loadingType === 'L' && bl.remaining_quantity <= 0) return false;

      return true;
    })
    .map((pb: any) => pb.batch_lot_product_batches)
    .sort((a: any, b: any) => {
      return (
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
    });

  return batches;
}

async function createOrGetBatchForProduct(
  tx: any,
  productId: number,
  userId: number,
  initialQuantity: number,
  batchData?: {
    batch_number?: string;
    lot_number?: string;
    manufacturing_date?: Date;
    expiry_date?: Date;
    supplier_name?: string;
  }
): Promise<any> {
  const product = await tx.products.findUnique({
    where: { id: productId },
    select: { code: true, name: true },
  });

  const batchNumber =
    batchData?.batch_number || `${product.code}-${Date.now()}`;
  const lotNumber = batchData?.lot_number || `LOT-${Date.now()}`;

  const existingBatch = await tx.batch_lots.findFirst({
    where: {
      OR: [{ batch_number: batchNumber }, { lot_number: lotNumber }],
      is_active: 'Y',
    },
  });

  if (existingBatch) {
    const duplicateField =
      existingBatch.batch_number === batchNumber
        ? 'Batch number'
        : 'Lot number';
    const duplicateValue =
      existingBatch.batch_number === batchNumber ? batchNumber : lotNumber;

    throw new Error(
      `${duplicateField} "${duplicateValue}" already exists (Batch ID: ${existingBatch.id}). ` +
        `Please use a different ${duplicateField.toLowerCase()} or select the existing batch using batch_lot_id.`
    );
  }

  const newBatch = await tx.batch_lots.create({
    data: {
      batch_number: batchNumber,
      lot_number: lotNumber,
      manufacturing_date: batchData?.manufacturing_date || new Date(),
      expiry_date:
        batchData?.expiry_date ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      quantity: initialQuantity,
      remaining_quantity: initialQuantity,
      supplier_name: batchData?.supplier_name || null,
      purchase_price: null,
      quality_grade: 'A',
      storage_location: null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
      productsId: productId,
    },
  });

  await tx.product_batches.create({
    data: {
      product_id: productId,
      batch_lot_id: newBatch.id,
      quantity: initialQuantity,
      is_active: 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    },
  });

  console.log(
    ` Created NEW Batch: ${batchNumber}, Lot: ${lotNumber} with initial quantity: ${initialQuantity}`
  );
  return newBatch;
}

// async function updateInventoryStock(
//   tx: any,
//   productId: number,
//   locationId: number | null,
//   quantity: number,
//   loadingType: string,
//   batchId?: number | null,
//   serialId?: number | null,
//   userId?: number
// ): Promise<void> {
//   const whereClause: any = {
//     product_id: productId,
//     location_id: locationId ?? 1,
//   };

//   if (batchId !== null) whereClause.batch_id = batchId;
//   if (serialId !== null) whereClause.serial_number_id = serialId;

//   const existingStock = await tx.inventory_stock.findFirst({
//     where: whereClause,
//   });

//   let newCurrentStock: number;

//   if (loadingType === 'U') {
//     newCurrentStock = existingStock
//       ? existingStock.current_stock - quantity
//       : -quantity;
//     if (newCurrentStock < 0) {
//       throw new Error(
//         `Insufficient inventory stock. Available: ${existingStock?.current_stock || 0}, Requested: ${quantity}`
//       );
//     }
//   } else if (loadingType === 'L') {
//     newCurrentStock = existingStock
//       ? existingStock.current_stock + quantity
//       : quantity;
//   } else {
//     throw new Error(`Invalid loading type: ${loadingType}`);
//   }

//   if (existingStock) {
//     await tx.inventory_stock.update({
//       where: { id: existingStock.id },
//       data: {
//         current_stock: newCurrentStock,
//         available_stock: newCurrentStock,
//         updatedate: new Date(),
//         updatedby: userId,
//       },
//     });
//   } else {
//     await tx.inventory_stock.create({
//       data: {
//         product_id: productId,
//         location_id: locationId || 1,
//         current_stock: newCurrentStock,
//         reserved_stock: 0,
//         available_stock: newCurrentStock,
//         minimum_stock: 0,
//         maximum_stock: 0,
//         batch_id: batchId || null,
//         serial_number_id: serialId || null,
//         is_active: 'Y',
//         createdate: new Date(),
//         createdby: userId || 1,
//         log_inst: 1,
//       },
//     });
//   }
// }

async function updateInventoryStock(
  tx: any,
  productId: number,
  locationId: number | null,
  quantity: number,
  loadingType: string,
  batchId?: number | null,
  serialId?: number | null,
  userId?: number
): Promise<void> {
  const whereClause: any = {
    product_id: productId,
    location_id: locationId ?? 1,
  };

  if (batchId !== null) whereClause.batch_id = batchId;
  if (serialId !== null) whereClause.serial_number_id = serialId;

  const existingStock = await tx.inventory_stock.findFirst({
    where: whereClause,
  });

  // ===== KEY CHANGE: On LOAD, CREATE stock entry (don't deduct) =====
  if (loadingType === 'L') {
    if (existingStock) {
      // If stock already exists, increment it
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          current_stock: (existingStock.current_stock ?? 0) + quantity,
          available_stock: (existingStock.available_stock ?? 0) + quantity,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    } else {
      // Create new inventory_stock entry with the loaded quantity
      await tx.inventory_stock.create({
        data: {
          product_id: productId,
          location_id: locationId || 1,
          current_stock: quantity,
          reserved_stock: 0,
          available_stock: quantity,
          minimum_stock: 0,
          maximum_stock: 0,
          batch_id: batchId || null,
          serial_number_id: serialId || null,
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId || 1,
          log_inst: 1,
        },
      });
    }
  } else if (loadingType === 'U') {
    return;
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }
}

async function createStockMovement(
  tx: any,
  data: {
    product_id: number;
    batch_id?: number | null;
    serial_id?: number | null;
    movement_type: string;
    reference_type: string;
    reference_id: number;
    from_location_id?: number | null;
    to_location_id?: number | null;
    quantity: number;
    remarks?: string;
    van_inventory_id?: number;
    createdby: number;
  }
): Promise<void> {
  await tx.stock_movements.create({
    data: {
      product_id: data.product_id,
      batch_id: data.batch_id ?? null,
      serial_id: data.serial_id ?? null,
      movement_type: data.movement_type,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      from_location_id: data.from_location_id ?? null,
      to_location_id: data.to_location_id ?? null,
      quantity: data.quantity,
      movement_date: new Date(),
      remarks: data.remarks || null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: data.createdby,
      log_inst: 1,
      van_inventory_id: data.van_inventory_id ?? null,
    },
  });
}

async function createOrUpdateSerialNumber(
  tx: any,
  productId: number,
  serialData:
    | string
    | {
        serial_number: string;
        warranty_expiry?: Date;
        customer_id?: number;
        notes?: string;
      },
  batchId: number | null,
  locationId: number | null,
  loadingType: string,
  userId: number
): Promise<any> {
  const serialNumber =
    typeof serialData === 'string' ? serialData : serialData.serial_number;
  const warrantyExpiry =
    typeof serialData === 'object' ? serialData.warranty_expiry : null;
  const customerId =
    typeof serialData === 'object' ? serialData.customer_id : null;

  const existingSerial = await tx.serial_numbers.findUnique({
    where: { serial_number: serialNumber },
  });

  if (loadingType === 'L') {
    if (existingSerial) {
      throw new Error(`Serial number ${serialNumber} already exists`);
    }

    return await tx.serial_numbers.create({
      data: {
        product_id: productId,
        serial_number: serialNumber,
        batch_id: batchId,
        status: 'in_van',
        location_id: locationId || null,
        warranty_expiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        customer_id: customerId || null,
        is_active: 'Y',
        createdate: new Date(),
        createdby: userId,
        log_inst: 1,
      },
    });
  } else if (loadingType === 'U') {
    if (!existingSerial) {
      throw new Error(`Serial number ${serialNumber} not found`);
    }

    return await tx.serial_numbers.update({
      where: { serial_number: serialNumber },
      data: {
        status: 'available',
        location_id: locationId,
        updatedate: new Date(),
        updatedby: userId,
      },
    });
  }
}

export const vanInventoryController = {
  async getSalespersonInventoryItems(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const { page, limit, product_id } = req.query;
      if (!salesperson_id) {
        return res.status(400).json({
          success: false,
          message: 'Salesperson ID is required',
        });
      }
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const salespersonIdNum = parseInt(salesperson_id as string, 10);
      const user = await prisma.users.findUnique({
        where: { id: salespersonIdNum },
        select: { id: true, name: true, email: true },
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Salesperson not found',
        });
      }
      const vans = await prisma.van_inventory.findMany({
        where: { user_id: salespersonIdNum, is_active: 'Y' },
        select: { id: true },
      });
      const vanIds = vans.map(v => v.id);
      if (vanIds.length === 0) {
        return res.json({
          success: true,
          message: 'No inventory items found for salesperson',
          data: [],
          pagination: {
            current_page: pageNum,
            per_page: limitNum,
            total_pages: 0,
            total_count: 0,
            has_next: false,
            has_prev: false,
          },
        });
      }
      const itemsRaw = await prisma.van_inventory_items.findMany({
        where: {
          parent_id: { in: vanIds },
          ...(product_id
            ? { product_id: parseInt(product_id as string, 10) }
            : {}),
        },
        include: {
          van_inventory_items_products: {
            select: { id: true, name: true, code: true, tracking_type: true },
          },
          van_inventory_items_batch_lot: {
            select: {
              id: true,
              batch_number: true,
              lot_number: true,
              expiry_date: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });
      const totalCount = itemsRaw.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = itemsRaw.slice(startIndex, startIndex + limitNum);
      const data = paginated.map(it => ({
        item_id: it.id,
        van_inventory_id: it.parent_id,
        product_id: it.product_id,
        product_name:
          it.van_inventory_items_products?.name || it.product_name || null,
        product_code: it.van_inventory_items_products?.code || null,
        tracking_type: it.van_inventory_items_products?.tracking_type || null,
        unit: it.unit || null,
        quantity: it.quantity,
        unit_price: Number(it.unit_price || 0),
        discount_amount: Number(it.discount_amount || 0),
        tax_amount: Number(it.tax_amount || 0),
        total_amount: Number(it.total_amount || 0),
        notes: it.notes || null,
        batch_lot_id: it.batch_lot_id || null,
        batch: it.van_inventory_items_batch_lot
          ? {
              id: it.van_inventory_items_batch_lot.id,
              batch_number: it.van_inventory_items_batch_lot.batch_number,
              lot_number: it.van_inventory_items_batch_lot.lot_number,
              expiry_date: it.van_inventory_items_batch_lot.expiry_date,
            }
          : null,
      }));
      return res.json({
        success: true,
        message: 'Salesperson inventory items fetched successfully',
        data,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total_pages: Math.ceil(totalCount / limitNum),
          total_count: totalCount,
          has_next: startIndex + limitNum < totalCount,
          has_prev: startIndex > 0,
        },
      });
    } catch (error: any) {
      console.error('Get Salesperson Inventory Items Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve salesperson inventory items',
        error: error.message,
      });
    }
  },

  async getSalespersonInventoryItemsDropdown(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const { search } = req.query;
      if (!salesperson_id) {
        return res.status(400).json({
          success: false,
          message: 'Salesperson ID is required',
        });
      }
      const salespersonIdNum = parseInt(salesperson_id as string, 10);
      const vans = await prisma.van_inventory.findMany({
        where: { user_id: salespersonIdNum, is_active: 'Y' },
        select: { id: true },
      });
      const vanIds = vans.map(v => v.id);
      if (vanIds.length === 0) {
        return res.json({
          success: true,
          message: 'No items found',
          data: [],
        });
      }
      const items = await prisma.van_inventory_items.findMany({
        where: { parent_id: { in: vanIds } },
        include: {
          van_inventory_items_products: {
            select: {
              id: true,
              name: true,
              code: true,
              base_price: true,
              tracking_type: true,
            },
          },
        },
      });
      const map = new Map<
        number,
        {
          id: number;
          name: string;
          code: string;
          unit_price: number;
          product_id: number;
          tracking_type: string | null;
        }
      >();
      items.forEach(it => {
        const p = it.van_inventory_items_products;
        if (p) {
          if (
            !search ||
            (p.name &&
              p.name.toLowerCase().includes((search as string).toLowerCase()))
          ) {
            map.set(p.id, {
              id: it.id,
              name: p.name || 'N/A',
              code: p.code || '',
              unit_price: Number(p.base_price || 0),
              product_id: p.id,
              tracking_type: p.tracking_type || null,
            });
          }
        }
      });
      return res.json({
        success: true,
        message: 'Dropdown items fetched successfully',
        data: Array.from(map.values()),
      });
    } catch (error: any) {
      console.error('Get Salesperson Inventory Items Dropdown Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve dropdown items',
        error: error.message,
      });
    }
  },

  async getAvailableBatches(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { loading_type } = req.query;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      const product = await prisma.products.findUnique({
        where: { id: Number(productId) },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const batches = await prisma.$transaction(async tx => {
        return await getAvailableBatchesForProduct(
          tx,
          Number(productId),
          (loading_type as string) || 'L'
        );
      });

      res.json({
        success: true,
        message: 'Available batches retrieved successfully',
        data: batches.map(batch => ({
          id: batch.id,
          batch_number: batch.batch_number,
          lot_number: batch.lot_number,
          expiry_date: batch.expiry_date,
          quantity: batch.quantity,
          remaining_quantity: batch.remaining_quantity,
          is_active: batch.is_active,
        })),
      });
    } catch (error: any) {
      console.error('Get Available Batches Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async createOrUpdateVanInventory(req: Request, res: Response) {
    const data = req.body;
    const userId = (req as any).user?.id || 1;

    const { van_inventory_items, inventoryItems, ...inventoryData } = data;
    const items = van_inventory_items || inventoryItems || [];
    let inventoryId = inventoryData.id;

    try {
      const processedItemIds: number[] = [];
      const result = await prisma.$transaction(
        async tx => {
          let inventory;
          let isUpdate = false;

          if (inventoryId) {
            const existing = await tx.van_inventory.findUnique({
              where: { id: Number(inventoryId) },
            });
            if (existing) {
              isUpdate = true;
            }
          }

          if (!inventoryData.user_id) {
            throw new Error('user_id is required');
          }

          const userExists = await tx.users.findUnique({
            where: { id: Number(inventoryData.user_id) },
          });
          if (!userExists) {
            throw new Error(`User ${inventoryData.user_id} not found`);
          }

          if (inventoryData.vehicle_id) {
            const vehicleExists = await tx.vehicles.findUnique({
              where: { id: Number(inventoryData.vehicle_id) },
            });
            if (!vehicleExists) {
              throw new Error(`Vehicle ${inventoryData.vehicle_id} not found`);
            }
          }

          const loadingType = inventoryData.loading_type || 'L';

          const payload = {
            user_id: Number(inventoryData.user_id),
            status: inventoryData.status || 'A',
            loading_type: loadingType,
            document_date:
              inventoryData.document_date &&
              inventoryData.document_date.trim() !== ''
                ? new Date(inventoryData.document_date)
                : new Date(),
            vehicle_id: inventoryData.vehicle_id
              ? Number(inventoryData.vehicle_id)
              : null,
            location_type: inventoryData.location_type || 'van',
            location_id: inventoryData.location_id
              ? Number(inventoryData.location_id)
              : null,
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

          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              const qty = parseInt(item.quantity, 10) || 0;

              if (qty <= 0) {
                throw new Error('Quantity must be greater than 0');
              }

              if (!item.product_id) {
                throw new Error('product_id is required for each item');
              }

              const product = await tx.products.findUnique({
                where: { id: Number(item.product_id) },
                include: { product_unit_of_measurement: true },
              });

              if (!product) {
                throw new Error(`Product ${item.product_id} not found`);
              }

              const trackingType =
                product.tracking_type?.toUpperCase() || 'NONE';

              if (loadingType === 'L') {
                if (trackingType === 'BATCH') {
                  if (
                    !item.product_batches ||
                    !Array.isArray(item.product_batches) ||
                    item.product_batches.length === 0
                  ) {
                    throw new Error(
                      `Batches are required for batch-tracked product "${product.name}". ` +
                        `Received fields: ${Object.keys(item).join(', ')}`
                    );
                  }

                  let totalBatchQty = 0;
                  const createdBatches = [];

                  for (const batchInput of item.product_batches) {
                    const batchQty = parseInt(batchInput.quantity, 10) || 0;
                    if (batchQty <= 0) {
                      throw new Error('Batch quantity must be greater than 0');
                    }

                    totalBatchQty += batchQty;

                    const existingBatch = await tx.batch_lots.findFirst({
                      where: {
                        batch_number: batchInput.batch_number,
                        is_active: 'Y',
                      },
                    });

                    if (existingBatch) {
                      throw new Error(
                        `Batch number "${batchInput.batch_number}" already exists (Batch ID: ${existingBatch.id}). Please use a different batch number.`
                      );
                    }

                    const newBatch = await tx.batch_lots.create({
                      data: {
                        batch_number: batchInput.batch_number,
                        lot_number:
                          batchInput.lot_number || `LOT-${Date.now()}`,
                        manufacturing_date: batchInput.manufacturing_date
                          ? new Date(batchInput.manufacturing_date)
                          : new Date(),
                        expiry_date: batchInput.expiry_date
                          ? new Date(batchInput.expiry_date)
                          : new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() + 2
                              )
                            ),
                        quantity: batchQty,
                        remaining_quantity: batchQty,
                        supplier_name: batchInput.supplier_name || null,
                        purchase_price: batchInput.purchase_price || null,
                        quality_grade: batchInput.quality_grade || 'A',
                        storage_location: batchInput.storage_location || null,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                        productsId: product.id,
                      },
                    });

                    await tx.product_batches.create({
                      data: {
                        product_id: product.id,
                        batch_lot_id: newBatch.id,
                        quantity: batchQty,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                      },
                    });

                    await tx.van_inventory_items.create({
                      data: {
                        parent_id: inventory.id,
                        product_id: product.id,
                        product_name: product.name,
                        unit:
                          product.product_unit_of_measurement?.name || 'pcs',
                        quantity: batchQty,
                        unit_price: Number(item.unit_price) || 0,
                        discount_amount: Number(item.discount_amount) || 0,
                        tax_amount: Number(item.tax_amount) || 0,
                        total_amount: batchQty * (Number(item.unit_price) || 0),
                        notes: item.notes || null,
                        batch_lot_id: newBatch.id,
                      },
                    });

                    await updateInventoryStock(
                      tx,
                      product.id,
                      inventoryData.location_id || null,
                      batchQty,
                      'L',
                      newBatch.id,
                      null,
                      userId
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: newBatch.id,
                      serial_id: null,
                      movement_type: 'VAN_LOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: inventoryData.location_id || null,
                      to_location_id: null,
                      quantity: batchQty,
                      remarks: `Loaded to van - Batch: ${newBatch.batch_number}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });

                    createdBatches.push(newBatch);
                  }

                  console.log(
                    ` Created ${createdBatches.length} batches for product ${product.name}`
                  );
                } else if (trackingType === 'SERIAL') {
                  console.log('🔍 Starting SERIAL UNLOAD process...');

                  if (
                    !item.product_serials ||
                    !Array.isArray(item.product_serials) ||
                    item.product_serials.length === 0
                  ) {
                    throw new Error(
                      `Serial numbers are required for unloading serial-tracked product "${product.name}"`
                    );
                  }

                  let totalSerialQty = 0;
                  for (const serialInput of item.product_serials) {
                    const serialQty = parseInt(serialInput.quantity, 10) || 1;
                    totalSerialQty += serialQty;
                  }

                  console.log(
                    ` Total serials to unload: ${totalSerialQty}, Item quantity: ${qty}`
                  );

                  if (totalSerialQty !== qty) {
                    throw new Error(
                      `Total serial quantity (${totalSerialQty}) does not match item quantity (${qty})`
                    );
                  }

                  console.log(
                    ` Processing ${totalSerialQty} serials for unload`
                  );

                  for (const serialInput of item.product_serials) {
                    const serialQty = parseInt(serialInput.quantity, 10) || 1;
                    const serialNumber =
                      typeof serialInput === 'string'
                        ? serialInput
                        : serialInput.serial_number;

                    if (!serialNumber) {
                      throw new Error('Serial number is required');
                    }

                    if (serialQty !== 1) {
                      throw new Error(
                        `Serial quantity must be 1. Serial "${serialNumber}" has quantity ${serialQty}`
                      );
                    }

                    console.log(` Processing serial: "${serialNumber}"`);

                    const existingSerial = await tx.serial_numbers.findUnique({
                      where: { serial_number: serialNumber },
                    });

                    if (!existingSerial) {
                      throw new Error(
                        `Serial number "${serialNumber}" not found in system`
                      );
                    }

                    console.log(
                      ` Found serial in DB - ID: ${existingSerial.id}, Status: ${existingSerial.status}`
                    );

                    if (existingSerial.product_id !== product.id) {
                      throw new Error(
                        `Serial "${serialNumber}" belongs to a different product (Expected: ${product.id}, Found: ${existingSerial.product_id})`
                      );
                    }

                    console.log(` Looking for van_inventory_items entry`);
                    console.log(` parent_id: ${inventory.id}`);
                    console.log(`  product_id: ${product.id}`);
                    console.log(`  serial_id: ${existingSerial.id}`);

                    const vanItem = await tx.van_inventory_items.findFirst({
                      where: {
                        parent_id: inventory.id,
                        product_id: product.id,
                        serial_id: existingSerial.id,
                      },
                    });

                    if (!vanItem) {
                      throw new Error(
                        `Serial "${serialNumber}" (ID: ${existingSerial.id}) not found in van_inventory_items for van ${inventory.id}`
                      );
                    }

                    console.log(
                      ` Found van_inventory_items entry - ID: ${vanItem.id}, Quantity: ${vanItem.quantity}`
                    );

                    await tx.van_inventory_items.delete({
                      where: { id: vanItem.id },
                    });

                    console.log(
                      ` DELETED van_inventory_items ID: ${vanItem.id} for serial: "${serialNumber}"`
                    );

                    await tx.serial_numbers.update({
                      where: { id: existingSerial.id },
                      data: {
                        status: 'available',
                        location_id: payload.location_id ?? 1,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });

                    console.log(
                      ` Updated serial "${serialNumber}" status: ${existingSerial.status} `
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: null,
                      serial_id: existingSerial.id,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: payload.location_id,
                      quantity: 1,
                      remarks: `Serial ${serialNumber} unloaded from van (previous status: ${existingSerial.status})`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });

                    console.log(
                      ` Created stock movement for: "${serialNumber}"`
                    );
                  }

                  console.log(
                    ` Successfully unloaded ${totalSerialQty} serials from van`
                  );
                } else {
                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: qty,
                      unit_price: Number(item.unit_price) || 0,
                      discount_amount: Number(item.discount_amount) || 0,
                      tax_amount: Number(item.tax_amount) || 0,
                      total_amount: qty * (Number(item.unit_price) || 0),
                      notes: item.notes || null,
                      batch_lot_id: null,
                    },
                  });

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventoryData.location_id || null,
                    qty,
                    'L',
                    null,
                    null,
                    userId
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: inventoryData.location_id || null,
                    to_location_id: null,
                    quantity: qty,
                    remarks: 'Loaded to van',
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });

                  console.log(
                    ` Loaded ${qty} units of product ${product.name} (NONE tracking)`
                  );
                }
              } else if (loadingType === 'U') {
                if (trackingType === 'BATCH') {
                  if (
                    !item.product_batches ||
                    !Array.isArray(item.product_batches) ||
                    item.product_batches.length === 0
                  ) {
                    throw new Error(
                      `Batches are required for unloading batch-tracked product "${product.name}"`
                    );
                  }

                  for (const batchInput of item.product_batches) {
                    const batchQty = parseInt(batchInput.quantity, 10) || 0;
                    if (batchQty <= 0) {
                      throw new Error('Batch quantity must be greater than 0');
                    }

                    let batchLotId: number;
                    if (batchInput.batch_number) {
                      const existingBatch = await tx.batch_lots.findFirst({
                        where: {
                          batch_number: batchInput.batch_number,
                          is_active: 'Y',
                        },
                      });

                      if (!existingBatch) {
                        throw new Error(
                          `Batch with batch_number "${batchInput.batch_number}" not found or is not active`
                        );
                      }

                      if (new Date(existingBatch.expiry_date) < new Date()) {
                        throw new Error(
                          `Batch "${batchInput.batch_number}" has expired on ${existingBatch.expiry_date}`
                        );
                      }

                      batchLotId = existingBatch.id;
                      console.log(
                        `Found batch_lot_id: ${batchLotId} for batch_number: ${batchInput.batch_number}`
                      );
                    } else if (batchInput.batch_lot_id) {
                      batchLotId = batchInput.batch_lot_id;
                    } else {
                      throw new Error(
                        'Either batch_number or batch_lot_id is required for unloading batches'
                      );
                    }

                    const vanItem = await tx.van_inventory_items.findFirst({
                      where: {
                        parent_id: inventory.id,
                        product_id: product.id,
                        batch_lot_id: batchLotId,
                      },
                    });

                    console.log('Print:', inventory.id, product.id, batchLotId);

                    if (!vanItem) {
                      throw new Error(
                        `Batch "${batchInput.batch_number || batchLotId}" not found in van inventory for product "${product.name}"`
                      );
                    }

                    if (vanItem.quantity < batchQty) {
                      throw new Error(
                        `Insufficient quantity in van for batch "${batchInput.batch_number || batchLotId}". Available: ${vanItem.quantity}, Requested: ${batchQty}`
                      );
                    }

                    const newQty = vanItem.quantity - batchQty;

                    if (newQty <= 0) {
                      await tx.van_inventory_items.delete({
                        where: { id: vanItem.id },
                      });
                      console.log(
                        'Removed batch from van (quantity reached 0)'
                      );
                    } else {
                      await tx.van_inventory_items.update({
                        where: { id: vanItem.id },
                        data: { quantity: newQty },
                      });
                      console.log(
                        `Reduced van quantity: ${vanItem.quantity} → ${newQty}`
                      );
                    }

                    const batchLot = await tx.batch_lots.findUnique({
                      where: { id: batchLotId },
                      select: { batch_number: true },
                    });

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: batchLotId,
                      serial_id: null,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: batchQty,
                      remarks: `Unloaded from van - Batch ${batchLot?.batch_number || batchLotId}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }

                  console.log(
                    'Unloaded batches from van for product ' + product.name
                  );
                } else if (trackingType === 'SERIAL') {
                  console.log('Starting SERIAL UNLOAD process');

                  if (
                    !item.product_serials ||
                    !Array.isArray(item.product_serials) ||
                    item.product_serials.length === 0
                  ) {
                    throw new Error(
                      `Serial numbers are required for unloading serial-tracked product "${product.name}"`
                    );
                  }

                  let totalSerialQty = 0;
                  for (const serialInput of item.product_serials) {
                    const serialQty = parseInt(serialInput.quantity, 10) || 1;
                    totalSerialQty += serialQty;
                  }

                  console.log(
                    ` Total serials to unload: ${totalSerialQty}, Item quantity: ${qty}`
                  );

                  if (totalSerialQty !== qty) {
                    throw new Error(
                      `Total serial quantity (${totalSerialQty}) does not match item quantity (${qty})`
                    );
                  }

                  console.log(
                    ` Processing ${totalSerialQty} serials for unload`
                  );

                  for (const serialInput of item.product_serials) {
                    const serialQty = parseInt(serialInput.quantity, 10) || 1;
                    const serialNumber =
                      typeof serialInput === 'string'
                        ? serialInput
                        : serialInput.serial_number;

                    if (!serialNumber) {
                      throw new Error('Serial number is required');
                    }

                    if (serialQty !== 1) {
                      throw new Error(
                        `Serial quantity must be 1. Serial "${serialNumber}" has quantity ${serialQty}`
                      );
                    }

                    console.log(`Processing serial: "${serialNumber}"`);

                    // Find existing serial in database
                    const existingSerial = await tx.serial_numbers.findUnique({
                      where: { serial_number: serialNumber },
                    });

                    if (!existingSerial) {
                      throw new Error(
                        `Serial number "${serialNumber}" not found in system`
                      );
                    }

                    console.log(
                      ` Found serial in DB - ID: ${existingSerial.id}, Status: ${existingSerial.status}`
                    );

                    if (existingSerial.product_id !== product.id) {
                      throw new Error(
                        `Serial "${serialNumber}" belongs to a different product (Expected: ${product.id}, Found: ${existingSerial.product_id})`
                      );
                    }

                    console.log(` Looking for van_inventory_items entry`);
                    console.log(`  parent_id: ${inventory.id}`);
                    console.log(` product_id: ${product.id}`);
                    console.log(` serial_id: ${existingSerial.id}`);

                    const vanItem = await tx.van_inventory_items.findFirst({
                      where: {
                        parent_id: inventory.id,
                        product_id: product.id,
                        serial_id: existingSerial.id,
                      },
                    });

                    if (!vanItem) {
                      throw new Error(
                        `Serial "${serialNumber}" (ID: ${existingSerial.id}) not found in van_inventory_items for van ${inventory.id}`
                      );
                    }

                    console.log(
                      ` Found van_inventory_items entry - ID: ${vanItem.id}, Quantity: ${vanItem.quantity}`
                    );

                    await tx.van_inventory_items.delete({
                      where: { id: vanItem.id },
                    });

                    console.log(
                      `DELETED van_inventory_items ID: ${vanItem.id} for serial: "${serialNumber}"`
                    );

                    await tx.serial_numbers.update({
                      where: { id: existingSerial.id },
                      data: {
                        status: 'available',
                        location_id: payload.location_id ?? 1,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });

                    console.log(
                      ` Updated serial "${serialNumber}" status: in_van `
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: null,
                      serial_id: existingSerial.id,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: payload.location_id,
                      quantity: 1,
                      remarks: `Serial ${serialNumber} unloaded from van`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });

                    console.log(
                      `Created stock movement for: "${serialNumber}"`
                    );
                  }

                  console.log(
                    `✅ Successfully unloaded ${totalSerialQty} serials from van (inventory_stock NOT updated)`
                  );
                } else {
                  const vanItem = await tx.van_inventory_items.findFirst({
                    where: {
                      parent_id: inventory.id,
                      product_id: product.id,
                    },
                  });

                  if (!vanItem) {
                    throw new Error(
                      `Product "${product.name}" not found in van inventory`
                    );
                  }

                  if (vanItem.quantity < qty) {
                    throw new Error(
                      `Insufficient quantity in van. Available: ${vanItem.quantity}, Requested: ${qty}`
                    );
                  }

                  const newQty = vanItem.quantity - qty;

                  if (newQty <= 0) {
                    await tx.van_inventory_items.delete({
                      where: { id: vanItem.id },
                    });
                    console.log('Removed product from van (quantity = 0)');
                  } else {
                    await tx.van_inventory_items.update({
                      where: { id: vanItem.id },
                      data: {
                        quantity: newQty,
                        total_amount: newQty * (Number(item.unit_price) || 0),
                      },
                    });
                    console.log(
                      `Reduced quantity: ${vanItem.quantity} t ${newQty}`
                    );
                  }

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: payload.location_id,
                    quantity: qty,
                    remarks: `Unloaded from van`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });

                  console.log(
                    `Unloaded ${qty} units of product "${product.name}"`
                  );
                }
              }
            }
          }

          // const finalInventory = await tx.van_inventory.findUnique({
          //   where: { id: inventory.id },
          //   include: {
          //     van_inventory_users: true,
          //     vehicle: true,
          //     van_inventory_depot: true,
          //     van_inventory_items_inventory: {
          //       include: {
          //         van_inventory_items_products: {
          //           include: {
          //             product_unit_of_measurement: true,
          //             product_product_batches: {
          //               include: {
          //                 batch_lot_product_batches: true,
          //               },
          //             },
          //             serial_numbers_products: {
          //               where: { status: 'in_van' },
          //               include: {
          //                 serial_numbers_customers: true,
          //               },
          //             },
          //           },
          //         },
          //         van_inventory_items_batch_lot: true,
          //       },
          //     },
          //     van_inventory_stock_movements: true,
          //   },
          // });

          const finalInventory = await tx.van_inventory.findUnique({
            where: { id: inventory.id },
            include: {
              van_inventory_users: true,
              vehicle: true,
              van_inventory_depot: true,
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: {
                    include: {
                      product_unit_of_measurement: true,
                      product_product_batches: {
                        include: {
                          batch_lot_product_batches: true,
                        },
                      },
                    },
                  },
                  van_inventory_items_batch_lot: true,
                  van_inventory_serial: {
                    include: {
                      serial_numbers_customers: true,
                    },
                  },
                },
              },
              van_inventory_stock_movements: true,
            },
          });

          return { finalInventory, wasUpdate: isUpdate };
        },
        { maxWait: 15000, timeout: 45000 }
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

      const badRequestKeywords = [
        'required',
        'not found',
        'Insufficient',
        'expired',
        'not active',
        'Invalid',
        'must be',
        'already exists',
      ];

      if (badRequestKeywords.some(kw => error.message?.includes(kw))) {
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
          van_inventory_depot: true,
          van_inventory_items_inventory: {
            include: {
              van_inventory_items_products: {
                include: {
                  product_unit_of_measurement: true,
                  product_product_batches: {
                    where: {
                      is_active: 'Y',
                    },
                    include: {
                      batch_lot_product_batches: true,
                    },
                  },
                },
              },
            },
          },
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
          van_inventory_depot: true,
          van_inventory_stock_movements: true,
          van_inventory_items_inventory: {
            include: {
              van_inventory_items_products: {
                include: {
                  product_unit_of_measurement: true,
                  product_product_batches: {
                    where: {
                      is_active: 'Y',
                    },
                    include: {
                      batch_lot_product_batches: true,
                    },
                  },
                },
              },
            },
          },
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
      const { van_inventory_items, ...inventoryData } = req.body;
      const userId = (req as any).user?.id || 1;

      const existing = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Van inventory not found' });

      const payload: any = {
        updatedby: userId,
        updatedate: new Date(),
        log_inst: { increment: 1 },
      };

      if (inventoryData.user_id !== undefined) {
        payload.user_id = Number(inventoryData.user_id);
      }
      if (inventoryData.status !== undefined) {
        payload.status = inventoryData.status;
      }
      if (inventoryData.loading_type !== undefined) {
        payload.loading_type = inventoryData.loading_type;
      }
      if (inventoryData.document_date !== undefined) {
        payload.document_date =
          inventoryData.document_date &&
          inventoryData.document_date.trim() !== ''
            ? new Date(inventoryData.document_date)
            : new Date();
      }
      if (inventoryData.vehicle_id !== undefined) {
        payload.vehicle_id = inventoryData.vehicle_id
          ? Number(inventoryData.vehicle_id)
          : null;
      }
      if (inventoryData.location_type !== undefined) {
        payload.location_type = inventoryData.location_type;
      }
      if (inventoryData.location_id !== undefined) {
        payload.location_id = inventoryData.location_id
          ? Number(inventoryData.location_id)
          : null;
      }
      if (inventoryData.is_active !== undefined) {
        payload.is_active = inventoryData.is_active;
      }

      const updated = await prisma.van_inventory.update({
        where: { id: Number(id) },
        data: payload,
        include: {
          van_inventory_users: true,
          vehicle: true,
          van_inventory_depot: true,
          van_inventory_items_inventory: true,
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

  async getProductBatches(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { loading_type, include_expired, sort_by } = req.query;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      const product = await prisma.products.findUnique({
        where: { id: Number(productId) },
        select: {
          id: true,
          name: true,
          code: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const productBatches = await prisma.product_batches.findMany({
        where: {
          product_id: Number(productId),
          is_active: 'Y',
        },
        include: {
          batch_lot_product_batches: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      let batches = productBatches
        .filter((pb: any) => {
          const batchLot = pb.batch_lot_product_batches;

          if (!batchLot) return false;
          if (batchLot.is_active !== 'Y') return false;

          const isExpired = new Date(batchLot.expiry_date) <= new Date();
          if (!include_expired && isExpired) return false;

          if (loading_type === 'L' && batchLot.remaining_quantity <= 0) {
            return false;
          }

          return true;
        })
        .map((pb: any) => {
          const batchLot = pb.batch_lot_product_batches;

          return {
            product_batch_id: pb.id,
            product_batch_quantity: pb.quantity,
            product_batch_created_date: pb.createdate,
            product_batch_created_by: pb.createdby,
            product_batch_updated_date: pb.updatedate,
            product_batch_updated_by: pb.updatedby,
            product_batch_is_active: pb.is_active,

            batch_lot_id: batchLot.id,
            batch_number: batchLot.batch_number,
            lot_number: batchLot.lot_number,
            manufacturing_date: batchLot.manufacturing_date,

            batch_remaining_quantity: batchLot.remaining_quantity,
          };
        });

      const sortBy = (sort_by as string) || 'batch_number';

      batches.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'batch_number':
            return a.batch_number.localeCompare(b.batch_number);

          case 'manufacturing_date':
            return (
              new Date(b.manufacturing_date).getTime() -
              new Date(a.manufacturing_date).getTime()
            );

          case 'product_batch_created_date':
            return (
              new Date(b.product_batch_created_date).getTime() -
              new Date(a.product_batch_created_date).getTime()
            );

          case 'remaining_quantity':
            return b.batch_remaining_quantity - a.batch_remaining_quantity;

          default:
            return a.batch_number.localeCompare(b.batch_number);
        }
      });

      const stats = {
        total_batches: batches.length,
        total_product_batch_quantity: batches.reduce((sum: number, b: any) => {
          return sum + b.product_batch_quantity;
        }, 0),
        total_remaining_quantity: batches.reduce((sum: number, b: any) => {
          return sum + (b.batch_remaining_quantity || 0);
        }, 0),
      };

      res.json({
        success: true,
        message: 'Product batches retrieved successfully',
        data: {
          product: {
            id: product.id,
            name: product.name,
            code: product.code,
          },
          batches,
          stats,
        },
      });
    } catch (error: any) {
      console.error('Get Product Batches Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product batches',
        error: error.message,
      });
    }
  },
  async getProductBatchDetails(req: Request, res: Response) {
    try {
      const { productId, batchId } = req.params;

      if (!productId || !batchId) {
        return res.status(400).json({
          message: 'Product ID and Batch ID are required',
        });
      }

      const productBatch = await prisma.product_batches.findFirst({
        where: {
          product_id: Number(productId),
          batch_lot_id: Number(batchId),
          is_active: 'Y',
        },
        include: {
          batch_lot_product_batches: true,
          product_product_batches: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!productBatch) {
        return res.status(404).json({
          message: 'Batch not found for this product',
        });
      }

      const batchLot = productBatch.batch_lot_product_batches;
      const isExpired = new Date(batchLot.expiry_date) <= new Date();
      const isExpiringSoon =
        !isExpired &&
        new Date(batchLot.expiry_date) <=
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const response = {
        batch_id: batchLot.id,
        batch_number: batchLot.batch_number,
        lot_number: batchLot.lot_number,
        manufacturing_date: batchLot.manufacturing_date,
        expiry_date: batchLot.expiry_date,
        days_until_expiry: Math.floor(
          (new Date(batchLot.expiry_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ),
        is_expired: isExpired,
        is_expiring_soon: isExpiringSoon,
        product_batch_id: productBatch.id,
        product_batch_quantity: productBatch.quantity,
        product_batch_remaining: productBatch.quantity,
        batch_total_quantity: batchLot.quantity,
        batch_total_remaining: batchLot.remaining_quantity,
        supplier_name: batchLot.supplier_name,
        purchase_price: batchLot.purchase_price
          ? Number(batchLot.purchase_price)
          : null,
        quality_grade: batchLot.quality_grade,
        storage_location: batchLot.storage_location,
        product: productBatch.product_product_batches,
        availability_status: isExpired
          ? 'expired'
          : batchLot.remaining_quantity <= 0
            ? 'out_of_stock'
            : isExpiringSoon
              ? 'expiring_soon'
              : 'available',
        can_load: !isExpired && batchLot.remaining_quantity > 0,
        can_unload: true,
      };

      res.json({
        success: true,
        message: 'Batch details retrieved successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Product Batch Details Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve batch details',
        error: error.message,
      });
    }
  },

  async getBulkProductBatches(req: Request, res: Response) {
    try {
      const { product_ids, loading_type } = req.body;

      if (!Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({
          message: 'product_ids array is required',
        });
      }

      const results = await Promise.all(
        product_ids.map(async (productId: number) => {
          const product = await prisma.products.findUnique({
            where: { id: Number(productId) },
            select: {
              id: true,
              name: true,
              code: true,
            },
          });

          if (!product) {
            return {
              product_id: productId,
              error: 'Product not found',
              batches: [],
            };
          }

          const productBatches = await prisma.product_batches.findMany({
            where: {
              product_id: Number(productId),
              is_active: 'Y',
            },
            include: {
              batch_lot_product_batches: true,
            },
          });

          const batches = productBatches
            .filter((pb: any) => {
              const bl = pb.batch_lot_product_batches;
              if (!bl || bl.is_active !== 'Y') return false;
              if (new Date(bl.expiry_date) <= new Date()) return false;
              if (loading_type === 'L' && bl.remaining_quantity <= 0)
                return false;
              return true;
            })
            .map((pb: any) => {
              const bl = pb.batch_lot_product_batches;
              return {
                batch_id: bl.id,
                batch_number: bl.batch_number,
                lot_number: bl.lot_number,
                expiry_date: bl.expiry_date,
                product_batch_quantity: pb.quantity,
                product_batch_remaining: pb.quantity,
                batch_total_remaining: bl.remaining_quantity,
              };
            })
            .sort(
              (a: any, b: any) =>
                new Date(a.expiry_date).getTime() -
                new Date(b.expiry_date).getTime()
            );

          return {
            product,
            batches,
            available_quantity: batches.reduce(
              (sum: number, b: any) => sum + b.batch_total_remaining,
              0
            ),
          };
        })
      );

      res.json({
        success: true,
        message: 'Bulk product batches retrieved successfully',
        data: results,
      });
    } catch (error: any) {
      console.error('Get Bulk Product Batches Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bulk product batches',
        error: error.message,
      });
    }
  },

  // async getSalespersonInventory(req: Request, res: Response) {
  //   try {
  //     const { salesperson_id } = req.params;
  //     const {
  //       page,
  //       limit,
  //       product_id,
  //       include_expired_batches = 'false',
  //       batch_status,
  //       serial_status,
  //     } = req.query;

  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 50;

  //     const processVanInventoryItems = (
  //       vanInventories: any[],
  //       salesperson: any
  //       // batchStatusBreakdown: any,
  //       // serialStatusBreakdown: Record<string, number>
  //     ) => {
  //       const products: Map<number, any> = new Map();
  //       let totalQuantity = 0;

  //       for (const vanInventory of vanInventories) {
  //         for (const item of vanInventory.van_inventory_items_inventory) {
  //           if (
  //             product_id &&
  //             item.product_id !== parseInt(product_id as string, 10)
  //           ) {
  //             continue;
  //           }

  //           const product = item.van_inventory_items_products;
  //           const batch = item.van_inventory_items_batch_lot;

  //           let batchInfo = null;
  //           if (batch) {
  //             const isExpired = new Date(batch.expiry_date) <= new Date();
  //             const daysUntilExpiry = Math.floor(
  //               (new Date(batch.expiry_date).getTime() - Date.now()) /
  //                 (1000 * 60 * 60 * 24)
  //             );
  //             const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

  //             if (batch_status) {
  //               if (batch_status === 'active' && (isExpired || isExpiringSoon))
  //                 continue;
  //               if (batch_status === 'expiring' && !isExpiringSoon) continue;
  //               if (batch_status === 'expired' && !isExpired) continue;
  //             }

  //             if (include_expired_batches !== 'true' && isExpired) continue;

  //             const batchStatusValue = isExpired
  //               ? 'expired'
  //               : isExpiringSoon
  //                 ? 'expiring_soon'
  //                 : 'active';

  //             // batchStatusBreakdown[batchStatusValue]++;

  //             batchInfo = {
  //               batch_lot_id: batch.id,
  //               batch_number: batch.batch_number,
  //               lot_number: batch.lot_number,
  //               manufacturing_date: batch.manufacturing_date,
  //               expiry_date: batch.expiry_date,
  //               supplier_name: batch.supplier_name,
  //               quality_grade: batch.quality_grade,
  //               total_quantity: batch.quantity,
  //               remaining_quantity: batch.remaining_quantity,
  //               is_expired: isExpired,
  //               is_expiring_soon: isExpiringSoon,
  //               days_until_expiry: daysUntilExpiry,
  //               status: batchStatusValue,
  //             };
  //           }

  //           const serials =
  //             product?.serial_numbers_products?.map((serial: any) => {
  //               const warrantyExpired =
  //                 serial.warranty_expiry &&
  //                 new Date(serial.warranty_expiry) <= new Date();

  //               // const status = serial.status || 'unknown';
  //               // serialStatusBreakdown[status] =
  //               //   (serialStatusBreakdown[status] || 0) + 1;

  //               return {
  //                 serial_id: serial.id,
  //                 serial_number: serial.serial_number,
  //                 status: serial.status,
  //                 warranty_expiry: serial.warranty_expiry,
  //                 warranty_expired: warrantyExpired,
  //                 warranty_days_remaining: serial.warranty_expiry
  //                   ? Math.floor(
  //                       (new Date(serial.warranty_expiry).getTime() -
  //                         Date.now()) /
  //                         (1000 * 60 * 60 * 24)
  //                     )
  //                   : null,
  //                 batch_id: serial.batch_id,
  //                 batch: serial.batch_lots,
  //                 customer_id: serial.customer_id,
  //                 customer: serial.serial_numbers_customers,
  //                 sold_date: serial.sold_date,
  //               };
  //             }) || [];

  //           const productId = item.product_id;

  //           if (!products.has(productId)) {
  //             products.set(productId, {
  //               product_id: productId,
  //               product_name: product?.name || null,
  //               product_code: product?.code || null,
  //               tracking_type: product?.tracking_type || 'none',
  //               total_quantity: 0,
  //               van_entries: [],
  //               batches: [],
  //               serials: [],
  //             });
  //           }

  //           const productData = products.get(productId)!;
  //           productData.total_quantity += item.quantity || 0;
  //           totalQuantity += item.quantity || 0;

  //           productData.van_entries.push({
  //             van_inventory_id: vanInventory.id,
  //             van_inventory_status: vanInventory.status,
  //             van_inventory_loading_type: vanInventory.loading_type,
  //             item_id: item.id,
  //             quantity: item.quantity,
  //             batch: batchInfo,
  //           });

  //           if (batchInfo) {
  //             const existingBatch = productData.batches.find(
  //               (b: any) => b.batch_lot_id === batchInfo!.batch_lot_id
  //             );
  //             if (!existingBatch) {
  //               productData.batches.push(batchInfo);
  //             }
  //           }

  //           for (const serial of serials) {
  //             const existingSerial = productData.serials.find(
  //               (s: any) => s.serial_id === serial.serial_id
  //             );
  //             if (!existingSerial) {
  //               productData.serials.push(serial);
  //             }
  //           }
  //         }
  //       }

  //       return {
  //         products: Array.from(products.values()),
  //         totalQuantity,
  //       };
  //     };

  //     if (
  //       !salesperson_id ||
  //       salesperson_id === '' ||
  //       salesperson_id === 'all'
  //     ) {
  //       const allSalespersons = await prisma.users.findMany({
  //         where: {},
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //           phone_number: true,
  //           profile_image: true,
  //         },
  //       });

  //       const consolidatedSalespersons: any[] = [];
  //       let overallBatchStatusBreakdown = {
  //         active: 0,
  //         expiring_soon: 0,
  //         expired: 0,
  //       };
  //       let overallSerialStatusBreakdown: Record<string, number> = {};
  //       let overallTotalQuantity = 0;
  //       let overallTotalProducts = new Set<number>();
  //       let overallTotalVanInventories = new Set<number>();
  //       let overallTotalBatches = 0;
  //       let overallTotalSerials = 0;

  //       for (const salesperson of allSalespersons) {
  //         const vanInventories = await prisma.van_inventory.findMany({
  //           where: {
  //             user_id: salesperson.id,
  //             is_active: 'Y',
  //             // status: 'A',
  //           },
  //           select: {
  //             id: true,
  //             status: true,
  //             loading_type: true,
  //             van_inventory_items_inventory: {
  //               select: {
  //                 id: true,
  //                 product_id: true,
  //                 quantity: true,
  //                 batch_lot_id: true,
  //                 van_inventory_items_batch_lot: {
  //                   select: {
  //                     id: true,
  //                     batch_number: true,
  //                     lot_number: true,
  //                     manufacturing_date: true,
  //                     expiry_date: true,
  //                     supplier_name: true,
  //                     quality_grade: true,
  //                     quantity: true,
  //                     remaining_quantity: true,
  //                   },
  //                 },
  //                 van_inventory_items_products: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     tracking_type: true,
  //                     serial_numbers_products: {
  //                       where: {
  //                         is_active: 'Y',
  //                         ...(serial_status && {
  //                           status: serial_status as string,
  //                         }),
  //                       },
  //                       select: {
  //                         id: true,
  //                         serial_number: true,
  //                         status: true,
  //                         warranty_expiry: true,
  //                         batch_id: true,
  //                         customer_id: true,
  //                         sold_date: true,
  //                         batch_lots: {
  //                           select: {
  //                             id: true,
  //                             batch_number: true,
  //                             lot_number: true,
  //                             expiry_date: true,
  //                           },
  //                         },
  //                         serial_numbers_customers: {
  //                           select: {
  //                             id: true,
  //                             name: true,
  //                             code: true,
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           orderBy: { document_date: 'desc' },
  //         });

  //         if (vanInventories.length === 0) continue;

  //         const salespersonBatchBreakdown = {
  //           active: 0,
  //           expiring_soon: 0,
  //           expired: 0,
  //         };
  //         const salespersonSerialBreakdown: Record<string, number> = {};

  //         const { products, totalQuantity } = processVanInventoryItems(
  //           vanInventories,
  //           salesperson
  //           // salespersonBatchBreakdown,
  //           // salespersonSerialBreakdown
  //         );

  //         if (products.length === 0) continue;

  //         const uniqueVanInventories = new Set<number>();
  //         let totalBatches = 0;
  //         let totalSerials = 0;

  //         products.forEach((product: any) => {
  //           overallTotalProducts.add(product.product_id);
  //           product.van_entries.forEach((entry: any) => {
  //             uniqueVanInventories.add(entry.van_inventory_id);
  //             overallTotalVanInventories.add(entry.van_inventory_id);
  //           });
  //           totalBatches += product.batches.length;
  //           totalSerials += product.serials.length;
  //         });

  //         overallTotalQuantity += totalQuantity;
  //         overallTotalBatches += totalBatches;
  //         overallTotalSerials += totalSerials;

  //         overallBatchStatusBreakdown.active +=
  //           salespersonBatchBreakdown.active;
  //         overallBatchStatusBreakdown.expiring_soon +=
  //           salespersonBatchBreakdown.expiring_soon;
  //         overallBatchStatusBreakdown.expired +=
  //           salespersonBatchBreakdown.expired;

  //         Object.entries(salespersonSerialBreakdown).forEach(([key, value]) => {
  //           overallSerialStatusBreakdown[key] =
  //             (overallSerialStatusBreakdown[key] || 0) + value;
  //         });

  //         consolidatedSalespersons.push({
  //           salesperson_id: salesperson.id,
  //           salesperson_name: salesperson.name,
  //           salesperson_email: salesperson.email,
  //           salesperson_phone: salesperson.phone_number,
  //           salesperson_profile_image: salesperson.profile_image,

  //           total_van_inventories: uniqueVanInventories.size,
  //           total_products: products.length,
  //           total_quantity: totalQuantity,
  //           total_batches: totalBatches,
  //           total_serials: totalSerials,
  //         });
  //       }

  //       const startIndex = (pageNum - 1) * limitNum;
  //       const paginatedData = consolidatedSalespersons.slice(
  //         startIndex,
  //         startIndex + limitNum
  //       );

  //       const pagination = {
  //         current_page: pageNum,
  //         per_page: limitNum,
  //         total_pages: Math.ceil(consolidatedSalespersons.length / limitNum),
  //         total_count: consolidatedSalespersons.length,
  //         has_next:
  //           pageNum < Math.ceil(consolidatedSalespersons.length / limitNum),
  //         has_prev: pageNum > 1,
  //       };

  //       return res.json({
  //         success: true,
  //         message: 'All salesperson inventory data retrieved successfully',
  //         data: paginatedData,
  //         statistics: {
  //           total_salespersons: consolidatedSalespersons.length,
  //           total_van_inventories: overallTotalVanInventories.size,
  //           total_unique_products: overallTotalProducts.size,
  //           total_quantity: overallTotalQuantity,
  //           total_batches: overallTotalBatches,
  //           total_serials: overallTotalSerials,
  //         },
  //         // batch_status_breakdown: overallBatchStatusBreakdown,
  //         // serial_status_breakdown: overallSerialStatusBreakdown,
  //         pagination,
  //       });
  //     }

  //     const salespersonIdNum = parseInt(salesperson_id as string, 10);

  //     const salesperson = await prisma.users.findUnique({
  //       where: { id: salespersonIdNum },
  //       select: {
  //         id: true,
  //         name: true,
  //         email: true,
  //         phone_number: true,
  //         profile_image: true,
  //       },
  //     });

  //     if (!salesperson) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Salesperson not found',
  //       });
  //     }

  //     const vanInventories = await prisma.van_inventory.findMany({
  //       where: {
  //         user_id: salespersonIdNum,
  //         is_active: 'Y',
  //         status: 'A',
  //       },
  //       select: {
  //         id: true,
  //         status: true,
  //         loading_type: true,
  //         van_inventory_items_inventory: {
  //           select: {
  //             id: true,
  //             product_id: true,
  //             quantity: true,
  //             batch_lot_id: true,
  //             van_inventory_items_batch_lot: {
  //               select: {
  //                 id: true,
  //                 batch_number: true,
  //                 lot_number: true,
  //                 manufacturing_date: true,
  //                 expiry_date: true,
  //                 supplier_name: true,
  //                 quality_grade: true,
  //                 quantity: true,
  //                 remaining_quantity: true,
  //               },
  //             },
  //             van_inventory_items_products: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 code: true,
  //                 tracking_type: true,
  //                 serial_numbers_products: {
  //                   where: {
  //                     is_active: 'Y',
  //                     ...(serial_status && { status: serial_status as string }),
  //                   },
  //                   select: {
  //                     id: true,
  //                     serial_number: true,
  //                     status: true,
  //                     warranty_expiry: true,
  //                     batch_id: true,
  //                     customer_id: true,
  //                     sold_date: true,
  //                     batch_lots: {
  //                       select: {
  //                         id: true,
  //                         batch_number: true,
  //                         lot_number: true,
  //                         expiry_date: true,
  //                       },
  //                     },
  //                     serial_numbers_customers: {
  //                       select: {
  //                         id: true,
  //                         name: true,
  //                         code: true,
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: { document_date: 'desc' },
  //     });

  //     if (vanInventories.length === 0) {
  //       return res.json({
  //         success: true,
  //         message: 'No inventory found for this salesperson',
  //         data: {
  //           salesperson_id: salesperson.id,
  //           salesperson_name: salesperson.name,
  //           salesperson_email: salesperson.email,
  //           salesperson_phone: salesperson.phone_number,
  //           salesperson_profile_image: salesperson.profile_image,
  //           total_van_inventories: 0,
  //           total_products: 0,
  //           total_quantity: 0,
  //           total_batches: 0,
  //           total_serials: 0,

  //           // batch_status_breakdown: {
  //           //   active: 0,
  //           //   expiring_soon: 0,
  //           //   expired: 0,
  //           // },
  //           // serial_status_breakdown: {},
  //           products: [],
  //         },
  //       });
  //     }

  //     // const batchStatusBreakdown = {
  //     //   active: 0,
  //     //   expiring_soon: 0,
  //     //   expired: 0,
  //     // };
  //     // const serialStatusBreakdown: Record<string, number> = {};

  //     const { products, totalQuantity } = processVanInventoryItems(
  //       vanInventories,
  //       salesperson
  //       // batchStatusBreakdown,
  //       // serialStatusBreakdown
  //     );

  //     const uniqueVanInventories = new Set<number>();
  //     let totalBatches = 0;
  //     let totalSerials = 0;

  //     products.forEach((product: any) => {
  //       product.van_entries.forEach((entry: any) => {
  //         uniqueVanInventories.add(entry.van_inventory_id);
  //       });
  //       totalBatches += product.batches.length;
  //       totalSerials += product.serials.length;
  //     });

  //     const startIndex = (pageNum - 1) * limitNum;
  //     const paginatedProducts = products.slice(
  //       startIndex,
  //       startIndex + limitNum
  //     );

  //     const pagination = {
  //       current_page: pageNum,
  //       per_page: limitNum,
  //       total_pages: Math.ceil(products.length / limitNum),
  //       total_count: products.length,
  //       has_next: pageNum < Math.ceil(products.length / limitNum),
  //       has_prev: pageNum > 1,
  //     };

  //     res.json({
  //       success: true,
  //       message: 'Salesperson inventory retrieved successfully',
  //       data: {
  //         salesperson_id: salesperson.id,
  //         salesperson_name: salesperson.name,
  //         salesperson_email: salesperson.email,
  //         salesperson_phone: salesperson.phone_number,
  //         salesperson_profile_image: salesperson.profile_image,

  //         total_van_inventories: uniqueVanInventories.size,
  //         total_products: products.length,
  //         total_quantity: totalQuantity,
  //         total_batches: totalBatches,
  //         total_serials: totalSerials,

  //         // batch_status_breakdown: batchStatusBreakdown,
  //         // serial_status_breakdown: serialStatusBreakdown,
  //         products: paginatedProducts,
  //       },
  //       pagination,
  //     });
  //   } catch (error: any) {
  //     console.error('Get Salesperson Inventory Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve salesperson inventory',
  //       error: error.message,
  //     });
  //   }
  // },

  async getSalespersonInventory(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const { date } = req.query;

      if (!salesperson_id) {
        return res.status(400).json({
          success: false,
          message: 'Salesperson ID is required',
        });
      }

      const salespersonIdNum = parseInt(salesperson_id as string, 10);

      const salesperson = await prisma.users.findUnique({
        where: { id: salespersonIdNum },
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          profile_image: true,
        },
      });

      if (!salesperson) {
        return res.status(404).json({
          success: false,
          message: 'Salesperson not found',
        });
      }

      const dateObj = date ? new Date(date as string) : new Date();
      if (Number.isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid date format. Expected ISO date string (e.g., 2026-01-05)',
        });
      }

      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const vanInventories = await prisma.van_inventory.findMany({
        where: {
          user_id: salespersonIdNum,
          is_active: 'Y',
          document_date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          van_inventory_users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              vehicle_number: true,
              type: true,
            },
          },
          van_inventory_depot: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          van_inventory_items_inventory: {
            include: {
              van_inventory_items_products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  tracking_type: true,
                },
              },
              van_inventory_items_batch_lot: {
                select: {
                  id: true,
                  batch_number: true,
                  lot_number: true,
                  manufacturing_date: true,
                  expiry_date: true,
                  supplier_name: true,
                  quality_grade: true,
                  quantity: true,
                  remaining_quantity: true,
                },
              },
              van_inventory_serial: {
                select: {
                  id: true,
                  serial_number: true,
                  status: true,
                  warranty_expiry: true,
                  batch_id: true,
                  customer_id: true,
                  sold_date: true,
                  serial_numbers_customers: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { document_date: 'desc' },
      });

      if (vanInventories.length === 0) {
        return res.json({
          success: true,
          message:
            'No van inventory found for this salesperson on the specified date',
          data: {
            salesperson,
            inventory_date: startOfDay,
            van_inventories: [],
            summary: {
              total_van_inventories: 0,
              total_items: 0,
              total_products: 0,
              total_batches: 0,
              total_serials: 0,
            },
          },
        });
      }

      const formattedInventories = vanInventories.map(inventory => {
        const items = inventory.van_inventory_items_inventory.map(item => {
          const product = item.van_inventory_items_products;
          const trackingType = product?.tracking_type?.toUpperCase() || 'NONE';

          const itemData: any = {
            item_id: item.id,
            product_id: item.product_id,
            product_name: product?.name || item.product_name || null,
            product_code: product?.code || null,
            tracking_type: trackingType,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price ? Number(item.unit_price) : 0,
            discount_amount: item.discount_amount
              ? Number(item.discount_amount)
              : 0,
            tax_amount: item.tax_amount ? Number(item.tax_amount) : 0,
            total_amount: item.total_amount ? Number(item.total_amount) : 0,
            notes: item.notes,
          };

          if (trackingType === 'BATCH' && item.van_inventory_items_batch_lot) {
            const batch = item.van_inventory_items_batch_lot;
            const isExpired = new Date(batch.expiry_date) <= new Date();
            const daysUntilExpiry = Math.floor(
              (new Date(batch.expiry_date).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );

            itemData.batch = {
              batch_lot_id: batch.id,
              batch_number: batch.batch_number,
              lot_number: batch.lot_number,
              manufacturing_date: batch.manufacturing_date,
              expiry_date: batch.expiry_date,
              supplier_name: batch.supplier_name,
              quality_grade: batch.quality_grade,
              total_quantity: batch.quantity,
              remaining_quantity: batch.remaining_quantity,
              is_expired: isExpired,
              days_until_expiry: daysUntilExpiry,
              status: isExpired
                ? 'expired'
                : daysUntilExpiry <= 30
                  ? 'expiring_soon'
                  : 'active',
            };
          }

          if (trackingType === 'SERIAL' && item.van_inventory_serial) {
            const serial = item.van_inventory_serial;
            const warrantyExpired =
              serial.warranty_expiry &&
              new Date(serial.warranty_expiry) <= new Date();

            itemData.serial = {
              serial_id: serial.id,
              serial_number: serial.serial_number,
              status: serial.status,
              warranty_expiry: serial.warranty_expiry,
              warranty_expired: warrantyExpired,
              warranty_days_remaining: serial.warranty_expiry
                ? Math.floor(
                    (new Date(serial.warranty_expiry).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null,
              batch_id: serial.batch_id,
              customer_id: serial.customer_id,
              customer: serial.serial_numbers_customers,
              sold_date: serial.sold_date,
            };
          }

          return itemData;
        });

        return {
          van_inventory_id: inventory.id,
          user_id: inventory.user_id,
          status: inventory.status,
          loading_type: inventory.loading_type,
          document_date: inventory.document_date,
          vehicle_id: inventory.vehicle_id,
          location_id: inventory.location_id,
          location_type: inventory.location_type,
          is_active: inventory.is_active,
          user: inventory.van_inventory_users,
          vehicle: inventory.vehicle,
          depot: inventory.van_inventory_depot,
          items,
        };
      });

      let totalItems = 0;
      const uniqueProducts = new Set<number>();
      let totalBatches = 0;
      let totalSerials = 0;

      formattedInventories.forEach(inv => {
        totalItems += inv.items.length;
        inv.items.forEach((item: any) => {
          uniqueProducts.add(item.product_id);
          if (item.batch) totalBatches++;
          if (item.serial) totalSerials++;
        });
      });

      res.json({
        success: true,
        message: 'Van inventory retrieved successfully',
        data: {
          salesperson,
          inventory_date: startOfDay,
          van_inventories: formattedInventories,
          summary: {
            total_van_inventories: vanInventories.length,
            total_items: totalItems,
            total_products: uniqueProducts.size,
            total_batches: totalBatches,
            total_serials: totalSerials,
          },
        },
      });
    } catch (error: any) {
      console.error('Get Salesperson Inventory Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve salesperson inventory',
        error: error.message,
      });
    }
  },
};
