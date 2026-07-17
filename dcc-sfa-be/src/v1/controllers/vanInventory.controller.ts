import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { getTimeFilter } from '../../utils/dateFilters';
import { getContainerOwnerAndSelf } from '../utils/inventory.utils';
import { getSourceSystemLabel } from '../../utils/sourceSystem';
import { createRequest, resolveRequesterDepotId } from './requests.controller';
import { isAdminRole } from '../../configs/permissions.config';
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
  sap_docentry?: string | null;
  sap_docnum?: string | null;
  source_system?: string | null;
  is_cancelled?: string | null;
  remarks?: string | null;
  product_remaining_quantity?: number | null;
  batch_total_remaining_quantity?: number | null;
  tracking_type?: string | null;
  serial_number?: string[] | null;
  tax_details?: {
    id: number;
    name: string;
    code: string;
    tax_rate: number;
    description?: string | null;
  } | null;
  product_serials?: Array<{
    id: number;
    serial_number: string;
    status: string;
    warranty_expiry?: Date | null;
  }> | null;
  product_batches?: Array<{
    batch_lot_id: number;
    batch_number: string;
    lot_number: string;
    expiry_date: Date;
    quantity: number;
    remaining_quantity: number;
    unit_price: string;
    total_amount: string;
  }> | null;
}

interface VanInventorySerialized {
  id: number;
  sap_docentry?: string | null;
  sap_docnum?: string | null;
  is_cancelled?: string | null;
  remarks?: string | null;
  source_system?: string | null;
  source_system_label?: string | null;
  user_id: number;
  status: string;
  loading_type: string;
  approval_status?: string | null;
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
  sale_type?: string | null;
  sub_inventory_users?: Array<{
    id: number;
    name: string;
    email: string;
  }> | null;
  user?: { id: number; name: string; email: string; code: string } | null;
  vehicle?: { id: number; vehicle_number: string; type: string } | null;
  depot?: { id: number; name: string; code: string } | null;
  items?: VanInventoryItemSerialized[] | null;
  summary?: any | null;
}

const serializeVanInventory = (item: any): VanInventorySerialized => {
  const productGroups = new Map<number, any[]>();

  item.van_inventory_items_inventory?.forEach((it: any) => {
    if (
      it.source_system !== 'sfa' &&
      item.loading_type !== 'U' &&
      (it.sap_docnum === null || it.sap_docnum === undefined)
    )
      return;
    const productId = it.product_id;
    if (!productGroups.has(productId)) {
      productGroups.set(productId, []);
    }
    productGroups.get(productId)!.push(it);
  });

  const processedItems: any[] = [];
  const groupedProducts: any[] = [];
  const trackingTypeSummary = new Map<string, any>();

  productGroups.forEach((items, productId) => {
    const firstItem = items[0];
    const product = firstItem.van_inventory_items_products;
    const trackingType = product?.tracking_type?.toLowerCase() || 'none';

    let totalQuantity = 0;
    let totalBaseQuantity = 0;
    let totalAmount = 0;
    const batches: any[] = [];
    const serials: any[] = [];
    let productSerials: any[] = [];
    let productBatches: any[] = [];

    items.forEach((it: any) => {
      let productBatch: any = null;
      let batchLot: any = null;
      let serialNumbers: any = null;

      if (it.van_inventory_items_batch_lot) {
        batchLot = it.van_inventory_items_batch_lot;
      } else if (
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

      if (it.van_inventory_serial) {
        const sn = it.van_inventory_serial;
        serialNumbers = [
          {
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
          },
        ];
      }

      totalQuantity += it.quantity || 0;
      totalBaseQuantity += it.base_quantity || 0;
      totalAmount += parseFloat(it.total_amount || 0);

      if (trackingType === 'batch' && batchLot) {
        const batchInfo = {
          batch_lot_id: batchLot.id,
          batch_number: batchLot.batch_number,
          lot_number: batchLot.lot_number,
          expiry_date: batchLot.expiry_date,
          remaining_quantity: batchLot.remaining_quantity,
        };

        if (!batches.find(b => b.batch_lot_id === batchLot.id)) {
          batches.push(batchInfo);
        }
      } else if (
        trackingType === 'serial' &&
        serialNumbers &&
        serialNumbers.length > 0
      ) {
        serialNumbers.forEach((sn: any) => {
          if (!serials.find(existing => existing.id === sn.id)) {
            serials.push(sn);
          }
        });
      }
    });

    if (trackingType === 'batch') {
      batches.forEach(batch => {
        const batchItems = items.filter(
          it => it.batch_lot_id === batch.batch_lot_id
        );
        const batchQuantity = batchItems.reduce(
          (sum, it) => sum + (it.quantity || 0),
          0
        );
        const batchBaseQuantity = batchItems.reduce(
          (sum, it) => sum + (it.base_quantity || 0),
          0
        );
        const batchAmount = batchItems.reduce(
          (sum, it) => sum + parseFloat(it.total_amount || 0),
          0
        );

        productBatches.push({
          batch_lot_id: batch.batch_lot_id,
          batch_number: batch.batch_number,
          lot_number: batch.lot_number,
          expiry_date: batch.expiry_date,
          quantity: batchQuantity,
          base_quantity: batchBaseQuantity,
          remaining_quantity: batch.remaining_quantity,
          unit_price: batchItems[0]?.unit_price || '0',
          total_amount: String(batchAmount),
        });
      });
    } else if (trackingType === 'serial') {
      if (serials.length > 0) {
        productSerials.push(
          ...serials.map((sn: any) => ({
            type: 'serial',
            ...sn,
          }))
        );
      } else {
        productSerials.push({
          type: 'serial',
          quantity: serials.length,
          unit_price: items[0]?.unit_price || '0',
          total_amount: String(totalAmount),
          note: 'No serial numbers created yet',
        });
      }
    }
    const groupedProduct = {
      product_id: productId,
      product_name: product?.name || firstItem.product_name,
      unit: firstItem.unit,
      tracking_type: trackingType,
      quantity: totalQuantity,
      total_amount: String(totalAmount),
      batches: batches,
      serials: serials,
      unit_price: firstItem.unit_price,
    };

    groupedProducts.push(groupedProduct);

    if (!trackingTypeSummary.has(trackingType)) {
      trackingTypeSummary.set(trackingType, {
        tracking_type: trackingType,
        product_count: 0,
        total_quantity: 0,
        total_batches: 0,
        total_serials: 0,
      });
    }

    const summary = trackingTypeSummary.get(trackingType);
    summary.product_count++;
    summary.total_quantity += totalQuantity;
    summary.total_batches += batches.length;
    summary.total_serials += serials.length;

    const aggregatedItem = {
      id: firstItem.id,
      parent_id: firstItem.parent_id,
      sap_docnum: firstItem.sap_docnum,
      sap_docentry: firstItem.sap_docentry,
      source_system: firstItem.source_system,

      is_cancelled: firstItem.is_cancelled,
      remarks: firstItem.remarks,
      product_id: productId,
      product_name: product?.name || firstItem.product_name,
      unit: firstItem.unit,
      quantity: totalQuantity,
      base_quantity: totalBaseQuantity,
      unit_price: firstItem.unit_price ? String(firstItem.unit_price) : null,
      discount_amount: firstItem.discount_amount
        ? String(firstItem.discount_amount)
        : null,
      tax_amount: firstItem.tax_amount ? String(firstItem.tax_amount) : null,
      total_amount: String(totalAmount),
      notes: firstItem.notes,
      batch_lot_id: trackingType === 'batch' ? firstItem.batch_lot_id : null,
      batch_number: trackingType === 'batch' ? firstItem.batch_number : null,
      lot_number: trackingType === 'batch' ? firstItem.lot_number : null,
      expiry_date: trackingType === 'batch' ? firstItem.expiry_date : null,
      product_remaining_quantity:
        trackingType === 'batch' ? firstItem.product_remaining_quantity : null,
      batch_total_remaining_quantity:
        trackingType === 'batch'
          ? firstItem.batch_total_remaining_quantity
          : null,
      tracking_type: trackingType,
      serial_number:
        serials.length > 0 ? serials.map((sn: any) => sn.serial_number) : null,
      tax_details: product?.product_tax_master
        ? {
          id: product.product_tax_master.id,
          name: product.product_tax_master.name,
          code: product.product_tax_master.code,
          tax_rate: Number(product.product_tax_master.tax_rate),
          description: product.product_tax_master.description,
        }
        : null,
      product_serials: productSerials.length > 0 ? productSerials : null,
      product_batches: productBatches.length > 0 ? productBatches : null,
    };

    processedItems.push(aggregatedItem);
  });

  const summary = {
    total_products: productGroups.size,
    total_quantity: Array.from(trackingTypeSummary.values()).reduce(
      (sum, type) => sum + type.total_quantity,
      0
    ),
    total_batches: Array.from(trackingTypeSummary.values()).reduce(
      (sum, type) => sum + type.total_batches,
      0
    ),
    total_serials: Array.from(trackingTypeSummary.values()).reduce(
      (sum, type) => sum + type.total_serials,
      0
    ),
  };
  const firstInventoryItem = item.van_inventory_items_inventory?.[0];

  return {
    id: item.id,
    source_system: firstInventoryItem?.source_system || null,
    source_system_label: getSourceSystemLabel(
      firstInventoryItem?.source_system
    ),

    is_cancelled: item.is_cancelled,
    remarks: item.remarks,
    user_id: item.user_id,
    status: item.status,
    loading_type: item.loading_type,
    approval_status: item.approval_status || null,
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
    sale_type: item.sale_type || null,
    sub_inventory_users: item.van_inventory_sub_users
      ? item.van_inventory_sub_users.map((su: any) => ({
        id: su.users?.id || su.user_id,
        name: su.users?.name || '',
        email: su.users?.email || '',
      }))
      : [],
    user: item.van_inventory_users
      ? {
        id: item.van_inventory_users.id,
        name: item.van_inventory_users.name,
        email: item.van_inventory_users.email,
        code: item.van_inventory_users.employee_id,
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
    items: processedItems,
    summary: summary,
  };
};

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

async function updateInventoryStock(
  tx: any,
  productId: number,
  locationId: number | null,
  quantity: number,
  loadingType: string,
  batchId?: number | null,
  serialId?: number | null,
  userId?: number,
  vanUserId?: number | null,
  baseQuantity: number = 0
): Promise<void> {
  let validLocationId = locationId;
  let salespersonId: number | null = vanUserId || null;
  if (!validLocationId) {
    const targetUserId = vanUserId || userId || 1;
    const user = await tx.users.findUnique({ where: { id: targetUserId } });
    const depotName = `Van - ${user?.name || targetUserId}`;
    let vanDepot = await tx.depots.findFirst({ where: { name: depotName } });

    if (!vanDepot) {
      const parentDepot = await tx.depots.findFirst({ orderBy: { id: 'asc' } });
      vanDepot = await tx.depots.create({
        data: {
          parent_id: parentDepot ? parentDepot.parent_id : 1,
          name: depotName,
          code: `VAN-${targetUserId}`,
          is_active: 'Y',
          createdby: userId || 1,
        },
      });
    }
    validLocationId = vanDepot.id;
  }

  const whereClause: any = {
    product_id: productId,
    location_id: validLocationId,
    is_unloadAll: 'N',
  };

  if (batchId !== null) whereClause.batch_id = batchId;
  if (serialId !== null) whereClause.serial_number_id = serialId;

  const existingStock = await tx.inventory_stock.findFirst({
    where: whereClause,
  });

  if (loadingType === 'L') {
    if (existingStock) {
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          is_unloadAll: 'N',
          current_stock: (existingStock.current_stock ?? 0) + quantity,
          available_stock: (existingStock.available_stock ?? 0) + quantity,
          base_quantity: (existingStock.base_quantity ?? 0) + baseQuantity,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    } else {
      await tx.inventory_stock.create({
        data: {
          product_id: productId,
          location_id: validLocationId,
          salesperson_id: salespersonId,
          current_stock: quantity,
          reserved_stock: 0,
          available_stock: quantity,
          minimum_stock: 0,
          maximum_stock: 0,
          batch_id: batchId || null,
          serial_number_id: serialId || null,
          base_quantity: baseQuantity,
          is_active: 'Y',
          is_unloadAll: 'N',
          createdate: new Date(),
          createdby: userId || 1,
          log_inst: 1,
        },
      });
    }
  } else if (loadingType === 'U') {
    if (existingStock) {
      const newCurrentStock = Math.max(
        0,
        (existingStock.current_stock ?? 0) - quantity
      );
      const newAvailableStock = Math.max(
        0,
        (existingStock.available_stock ?? 0) - quantity
      );
      const newBaseQuantity = Math.max(
        0,
        (existingStock.base_quantity ?? 0) - baseQuantity
      );
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          current_stock: newCurrentStock,
          available_stock: newAvailableStock,
          base_quantity: newBaseQuantity,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    }
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
    base_quantity?: number;
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
      base_quantity: data.base_quantity ?? 0,
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

async function updateSubUsersInventoryStock(
  tx: any,
  inventoryData: any,
  productId: number,
  quantity: number,
  loadingType: string,
  batchId?: number | null,
  serialId?: number | null,
  userId?: number,
  movementData?: {
    remarks?: string;
    movement_type: string;
    van_inventory_id: number;
  }
): Promise<void> {
  return;
}

const normalizeInventoryItemSerials = (item: any): any[] => {
  const candidates = [
    item?.serials,
    item?.product_serials,
    item?.serial_numbers,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate;
    }
  }

  return [];
};

async function processApprovedVanInventoryStock(
  inventoryId: number,
  userId: number,
  requestData?: any
): Promise<void> {
  console.log(
    ` processApprovedVanInventoryStock starting for inventory ID: ${inventoryId} `
  );
  const inventory = await prisma.van_inventory.findUnique({
    where: { id: inventoryId },
    include: {
      van_inventory_items_inventory: {
        include: {
          van_inventory_items_batch_lot: true,
          van_inventory_serial: true,
        },
      },
    },
  });

  if (!inventory) {
    console.log(' Inventory not found');
    return;
  }
  console.log('Found inventory:', {
    id: inventory.id,
    approval_status: inventory.approval_status,
    is_cancelled: inventory.is_cancelled,
    loading_type: inventory.loading_type,
  });

  if (inventory.approval_status !== 'A' || inventory.is_cancelled === 'Y') {
    console.log(' Skipping: not approved or cancelled');
    return;
  }

  let items = Array.isArray(requestData?.van_inventory_items)
    ? requestData.van_inventory_items
    : Array.isArray(requestData?.items)
      ? requestData.items
      : Array.isArray(requestData?.inventoryItems)
        ? requestData.inventoryItems
        : [];

  let itemsSource = 'requestData';
  if (!Array.isArray(items) || items.length === 0) {
    items = inventory.van_inventory_items_inventory || [];
    itemsSource = 'database';
  }
  console.log(` Found ${items.length} items from ${itemsSource}`);

  if (!Array.isArray(items) || items.length === 0) {
    console.log(' No items to process');
    return;
  }

  await prisma.$transaction(
    async (tx: any) => {
      const loadingType = inventory.loading_type || 'L';
      if (loadingType === 'L') {
        const existingProcessedMovements = await tx.stock_movements.count({
          where: {
            reference_type: 'VAN_INVENTORY',
            reference_id: inventory.id,
            movement_type: 'VAN_LOAD',
          },
        });
        console.log(
          ` Existing VAN_LOAD stock movements for this inventory: ${existingProcessedMovements}`
        );

        if (existingProcessedMovements > 0) {
          console.log(' Skipping: VAN_LOAD stock movements already processed');
          return;
        }
      } else if (loadingType === 'U') {
        const existingProcessedMovements = await tx.stock_movements.count({
          where: {
            reference_type: 'VAN_INVENTORY',
            reference_id: inventory.id,
            movement_type: 'VAN_UNLOAD',
          },
        });
        console.log(
          ` Existing VAN_UNLOAD stock movements for this inventory: ${existingProcessedMovements}`
        );

        if (existingProcessedMovements > 0) {
          console.log(
            ' Skipping: VAN_UNLOAD stock movements already processed'
          );
          return;
        }
      }

      const inventoryUserId = Number(inventory.user_id);
      const inventoryLocationId = inventory.location_id
        ? Number(inventory.location_id)
        : null;
      console.log(` Processing items with loading_type: ${loadingType}`);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`--- Processing item ${i + 1}/${items.length} ---`);
        console.log('  Item data:', JSON.stringify(item, null, 2));

        let productId = item?.product_id;

        if (!productId && item?.product_sap_code) {
          console.log(
            '  No product_id, trying to find product by product_sap_code:',
            item.product_sap_code
          );
          const productBySapCode = await tx.products.findFirst({
            where: { sap_code: item.product_sap_code },
          });

          if (productBySapCode) {
            productId = productBySapCode.id;
            console.log('  Found product by sap_code, product_id:', productId);
          }
        }

        if (!productId) {
          console.log(
            '   Skipping: no product_id and product not found by sap_code'
          );
          continue;
        }

        const qty = parseInt(item.quantity, 10) || 0;
        const baseQty = parseInt(item.base_quantity, 10) || 0;
        if (qty <= 0 && baseQty <= 0) {
          console.log('   Skipping: invalid quantity');
          continue;
        }
        console.log('  Quantity:', qty, 'Base Quantity:', baseQty);

        const product = await tx.products.findUnique({
          where: { id: Number(productId) },
          include: { product_unit_of_measurement: true },
        });

        if (!product) {
          console.log('   Skipping: product not found for id', productId);
          continue;
        }
        console.log(
          '  Product found:',
          product.name,
          '(tracking type:',
          product.tracking_type,
          ')'
        );

        const trackingType = product.tracking_type?.toUpperCase() || 'NONE';

        if (loadingType === 'L') {
          console.log('  Processing as LOAD');
          if (trackingType === 'BATCH') {
            console.log('  Tracking type: BATCH');
            const batchData = item.batches || item.product_batches;
            if (!Array.isArray(batchData) || batchData.length === 0) {
              console.log('   Skipping: no batch data');
              continue;
            }
            console.log(`  Found ${batchData.length} batch(es)`);

            for (let b = 0; b < batchData.length; b++) {
              const batchInput = batchData[b];
              console.log(`  Processing batch ${b + 1}/${batchData.length} `);
              console.log(
                '  Batch input:',
                JSON.stringify(batchInput, null, 2)
              );
              const batchQty = parseInt(batchInput.quantity, 10) || 0;
              const batchBaseQty = parseInt(batchInput.base_quantity, 10) || 0;
              if (batchQty <= 0 && batchBaseQty <= 0) {
                console.log('   Skipping batch: invalid quantity');
                continue;
              }
              console.log(
                '  Batch quantity:',
                batchQty,
                'Base Quantity:',
                batchBaseQty
              );

              let batchLot = await tx.batch_lots.findFirst({
                where: {
                  batch_number: batchInput.batch_number,
                  productsId: product.id,
                  is_active: 'Y',
                  // createdby: inventoryUserId,
                },
              });

              if (batchLot) {
                console.log('  Found existing batch_lot, updating.');
                await tx.batch_lots.update({
                  where: { id: batchLot.id },
                  data: {
                    quantity: batchLot.quantity + batchQty,
                    remaining_quantity: batchLot.remaining_quantity + batchQty,
                    updatedate: new Date(),
                  },
                });
                console.log('  Batch_lot updated');
              } else {
                console.log(' Creating new batch_lot...');
                batchLot = await tx.batch_lots.create({
                  data: {
                    batch_number: batchInput.batch_number,
                    lot_number: batchInput.lot_number || `LOT-${Date.now()}`,
                    manufacturing_date: batchInput.manufacturing_date
                      ? new Date(batchInput.manufacturing_date)
                      : new Date(),
                    expiry_date: batchInput.expiry_date
                      ? new Date(batchInput.expiry_date)
                      : new Date(
                        new Date().setFullYear(new Date().getFullYear() + 2)
                      ),
                    quantity: batchQty,
                    remaining_quantity: batchQty,
                    supplier_name: batchInput.supplier_name || null,
                    purchase_price: batchInput.purchase_price || null,
                    quality_grade: batchInput.quality_grade || 'A',
                    storage_location: batchInput.storage_location || null,
                    is_active: 'Y',
                    createdate: new Date(),
                    // createdby: inventoryUserId,
                    log_inst: 1,
                    productsId: product.id,
                  },
                });
                console.log('  New batch_lot created:', batchLot.id);
              }

              let productBatch = await tx.product_batches.findFirst({
                where: {
                  product_id: product.id,
                  batch_lot_id: batchLot.id,
                  is_active: 'Y',
                },
              });

              if (productBatch) {
                console.log('  Found existing product_batch, updating...');
                await tx.product_batches.update({
                  where: { id: productBatch.id },
                  data: {
                    quantity: productBatch.quantity + batchQty,
                    updatedate: new Date(),
                  },
                });
                console.log('  Product_batch updated');
              } else {
                console.log(' Creating new product_batch...');
                await tx.product_batches.create({
                  data: {
                    product_id: product.id,
                    batch_lot_id: batchLot.id,
                    quantity: batchQty,
                    is_active: 'Y',
                    createdate: new Date(),
                    createdby: userId,
                    log_inst: 1,
                  },
                });
                console.log('  New product_batch created');
              }

              let existingVanItem = await tx.van_inventory_items.findFirst({
                where: {
                  parent_id: inventory.id,
                  product_id: product.id,
                  batch_lot_id: batchLot.id,
                },
                include: {
                  van_inventory_items_inventory: true,
                },
              });

              if (!existingVanItem) {
                const unlinkedVanItem = await tx.van_inventory_items.findFirst({
                  where: {
                    parent_id: inventory.id,
                    product_id: product.id,
                    batch_lot_id: null,
                  },
                });

                if (unlinkedVanItem) {
                  existingVanItem = await tx.van_inventory_items.update({
                    where: { id: unlinkedVanItem.id },
                    data: {
                      batch_lot_id: batchLot.id,
                    },
                  });
                  console.log(
                    `  Linked existing unlinked van_inventory_item (ID: ${unlinkedVanItem.id}) to batch_lot: ${batchLot.id}`
                  );
                }
              }

              if (existingVanItem) {
                console.log(
                  '  Found existing van_inventory_item in current inventory, skipping quantity update after approval.'
                );
              } else {
                console.log(' Creating new van_inventory_item..');
                await tx.van_inventory_items.create({
                  data: {
                    parent_id: inventory.id,
                    product_id: product.id,
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name || 'pcs',
                    quantity: batchQty,
                    source_system: 'sfa',
                    base_quantity: batchBaseQty,
                    unit_price: Number(item.unit_price || 0),
                    discount_amount: Number(item.discount_amount || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    total_amount: batchQty * Number(item.unit_price || 0),
                    notes: item.notes || null,
                    batch_lot_id: batchLot.id,
                  },
                });
                console.log('  New van_inventory_item created');
              }

              console.log('   Updating inventory stock...');
              await updateInventoryStock(
                tx,
                product.id,
                inventoryLocationId,
                batchQty,
                'L',
                batchLot.id,
                null,
                userId,
                inventoryUserId,
                batchBaseQty
              );
              console.log('  Inventory stock updated');

              console.log('   Creating stock movement..');
              await createStockMovement(tx, {
                product_id: product.id,
                batch_id: batchLot.id,
                serial_id: null,
                movement_type: 'VAN_LOAD',
                reference_type: 'VAN_INVENTORY',
                reference_id: inventory.id,
                from_location_id: null,
                to_location_id: null,
                quantity: batchQty,
                base_quantity: batchBaseQty,
                remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
                van_inventory_id: inventory.id,
                createdby: userId,
              });
              console.log('  Stock movement created');
            }
          } else if (trackingType === 'SERIAL') {
            console.log('  Tracking type: SERIAL');
            const serialData = normalizeInventoryItemSerials(item);
            console.log(
              '  Normalized serial data:',
              JSON.stringify(serialData, null, 2)
            );
            if (!Array.isArray(serialData) || serialData.length === 0) {
              console.log('   Skipping: no serial data');
              continue;
            }
            console.log(`  Found ${serialData.length} serials to process`);

            for (let s = 0; s < serialData.length; s++) {
              const serialInput = serialData[s];
              console.log(`  Processing serial ${s + 1}/${serialData.length}`);
              console.log(
                '  Serial input:',
                JSON.stringify(serialInput, null, 2)
              );
              const serialNumber =
                typeof serialInput === 'string'
                  ? serialInput
                  : serialInput?.serial_number;
              console.log('  Extracted serial number:', serialNumber);

              if (!serialNumber) {
                console.log('   Skipping serial: no serial number');
                continue;
              }

              let existingSerial = await tx.serial_numbers.findUnique({
                where: { serial_number: serialNumber },
              });
              console.log(
                '  Found existing serial?',
                !!existingSerial,
                existingSerial ? `status: ${existingSerial.status}` : 'n/a'
              );

              if (existingSerial) {
                if (existingSerial.status === 'in_van') {
                  console.log('   Skipping: serial already in van');
                  continue;
                }

                console.log('  Updating existing serial status to in_van...');
                await tx.serial_numbers.update({
                  where: { id: existingSerial.id },
                  data: {
                    status: 'in_van',
                    location_id: null,
                    updatedate: new Date(),
                    updatedby: userId,
                  },
                });
                console.log('  Serial updated');
              } else {
                console.log('  Creating new serial..');
                existingSerial = await tx.serial_numbers.create({
                  data: {
                    product_id: product.id,
                    serial_number: serialNumber,
                    batch_id: serialInput?.batch_id || null,
                    status: 'in_van',
                    location_id: null,
                    warranty_expiry: serialInput?.warranty_expiry
                      ? new Date(serialInput.warranty_expiry)
                      : null,
                    customer_id: serialInput?.customer_id || null,
                    is_active: 'Y',
                    createdate: new Date(),
                    createdby: userId,
                    log_inst: 1,
                  },
                });
                console.log('  New serial created:', existingSerial.id);
              }

              let existingVanItem = await tx.van_inventory_items.findFirst({
                where: {
                  parent_id: inventory.id,
                  product_id: product.id,
                  serial_id: existingSerial.id,
                },
                include: {
                  van_inventory_items_inventory: true,
                },
              });
              console.log(
                '  Found existing van item for serial in current inventory?',
                !!existingVanItem
              );

              if (!existingVanItem) {
                const unlinkedVanItem = await tx.van_inventory_items.findFirst({
                  where: {
                    parent_id: inventory.id,
                    product_id: product.id,
                    serial_id: null,
                  },
                });

                if (unlinkedVanItem) {
                  existingVanItem = await tx.van_inventory_items.update({
                    where: { id: unlinkedVanItem.id },
                    data: {
                      serial_id: existingSerial.id,
                    },
                  });
                  console.log(
                    `  Linked existing unlinked serial van_item (ID: ${unlinkedVanItem.id}) to serial: ${existingSerial.id}`
                  );
                }
              }

              if (existingVanItem) {
                console.log(
                  '  Found existing van item for serial, skipping quantity update after approval.'
                );
              } else {
                console.log(' Creating new van item for serial...');
                await tx.van_inventory_items.create({
                  data: {
                    parent_id: inventory.id,
                    product_id: product.id,
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name || 'pcs',
                    quantity: 1,
                    source_system: 'sfa',
                    unit_price: Number(item.unit_price || 0),
                    discount_amount: Number(item.discount_amount || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    total_amount: Number(item.unit_price || 0),
                    notes: item.notes || null,
                    serial_id: existingSerial.id,
                  },
                });
                console.log('  New van item created');
              }

              console.log('   Updating inventory stock for serial...');
              await updateInventoryStock(
                tx,
                product.id,
                inventoryLocationId,
                1,
                'L',
                null,
                existingSerial.id,
                userId,
                inventoryUserId
              );
              console.log('  Inventory stock updated');

              console.log('   Creating stock movement for serial...');
              await createStockMovement(tx, {
                product_id: product.id,
                batch_id: null,
                serial_id: existingSerial.id,
                movement_type: 'VAN_LOAD',
                reference_type: 'VAN_INVENTORY',
                reference_id: inventory.id,
                from_location_id: null,
                to_location_id: null,
                quantity: 1,
                remarks: `Loaded serial ${serialNumber} to van`,
                van_inventory_id: inventory.id,
                createdby: userId,
              });
              console.log('  Stock movement created for serial');
            }
          } else {
            const existingVanItem = await tx.van_inventory_items.findFirst({
              where: {
                parent_id: inventory.id,
                product_id: product.id,
                batch_lot_id: null,
                serial_id: null,
              },
            });

            if (existingVanItem) {
              console.log(
                '  Found existing van item, skipping quantity update after approval.'
              );
            } else {
              await tx.van_inventory_items.create({
                data: {
                  parent_id: inventory.id,
                  product_id: product.id,
                  product_name: product.name,
                  unit: product.product_unit_of_measurement?.name || 'pcs',
                  quantity: qty,
                  source_system: 'sfa',
                  base_quantity: baseQty,
                  unit_price: Number(item.unit_price || 0),
                  discount_amount: Number(item.discount_amount || 0),
                  tax_amount: Number(item.tax_amount || 0),
                  total_amount: qty * Number(item.unit_price || 0),
                  notes: item.notes || null,
                  batch_lot_id: null,
                  serial_id: null,
                },
              });
            }

            await updateInventoryStock(
              tx,
              product.id,
              inventoryLocationId,
              qty,
              'L',
              null,
              null,
              userId,
              inventoryUserId,
              baseQty
            );

            await createStockMovement(tx, {
              product_id: product.id,
              batch_id: null,
              serial_id: null,
              movement_type: 'VAN_LOAD',
              reference_type: 'VAN_INVENTORY',
              reference_id: inventory.id,
              from_location_id: null,
              to_location_id: null,
              quantity: qty,
              base_quantity: baseQty,
              remarks: `Loaded ${qty} units to van`,
              van_inventory_id: inventory.id,
              createdby: userId,
            });
          }
        } else if (loadingType === 'U') {
          console.log('  Processing as UNLOAD');
          if (trackingType === 'BATCH') {
            console.log('  Tracking type: BATCH');
            let batchData = item.batches || item.product_batches;
            if (
              (!Array.isArray(batchData) || batchData.length === 0) &&
              (item.van_inventory_items_batch_lot || item.batch_lot_id)
            ) {
              batchData = [
                {
                  batch_number:
                    item.van_inventory_items_batch_lot?.batch_number ||
                    item.notes ||
                    '',
                  quantity: item.quantity,
                  base_quantity: item.base_quantity || 0,
                  batch_lot_id:
                    item.batch_lot_id || item.van_inventory_items_batch_lot?.id,
                },
              ];
            }
            if (!Array.isArray(batchData) || batchData.length === 0) {
              console.log('   Skipping: no batch data');
              continue;
            }
            console.log(`  Found ${batchData.length} batch(es)`);

            for (let b = 0; b < batchData.length; b++) {
              const batchInput = batchData[b];
              console.log(
                `  --- Processing unload batch ${b + 1}/${batchData.length} ---`
              );
              console.log(
                '  Batch input:',
                JSON.stringify(batchInput, null, 2)
              );
              const batchQty = parseInt(batchInput.quantity, 10) || 0;
              const batchBaseQty = parseInt(batchInput.base_quantity, 10) || 0;
              if (batchQty <= 0 && batchBaseQty <= 0) {
                console.log('   Skipping batch: invalid quantity');
                continue;
              }
              console.log(
                '  Batch quantity to unload:',
                batchQty,
                'Base Quantity:',
                batchBaseQty
              );

              let batchLot = null;
              const batchLotId = batchInput.batch_lot_id || item.batch_lot_id;
              if (batchLotId) {
                batchLot = await tx.batch_lots.findFirst({
                  where: {
                    id: Number(batchLotId),
                    is_active: 'Y',
                  },
                });
              }
              if (!batchLot) {
                batchLot = await tx.batch_lots.findFirst({
                  where: {
                    batch_number: batchInput.batch_number,
                    productsId: product.id,
                    is_active: 'Y',
                    // // createdby: inventoryUserId,
                  },
                });
              }

              if (!batchLot) {
                console.log(
                  '   Skipping: batch_lot not found for batch_number',
                  batchInput.batch_number
                );
                continue;
              }
              console.log(
                '  Found batch_lot:',
                batchLot.id,
                batchLot.batch_number
              );

              // Buggy vanItems check removed (it ignores transferred stock and adjustments)

              const inventoryStock = await tx.inventory_stock.findFirst({
                where: {
                  product_id: product.id,
                  location_id: inventoryLocationId || 1,
                  batch_id: batchLot.id,
                  salesperson_id: inventoryUserId,
                },
              });

              if (inventoryStock) {
                console.log(
                  '   Updating inventory_stock: current_stock',
                  inventoryStock.current_stock,
                  '→',
                  Math.max(0, (inventoryStock.current_stock || 0) - batchQty)
                );
                await tx.inventory_stock.update({
                  where: { id: inventoryStock.id },
                  data: {
                    current_stock: Math.max(
                      0,
                      (inventoryStock.current_stock || 0) - batchQty
                    ),
                    available_stock: Math.max(
                      0,
                      (inventoryStock.available_stock || 0) - batchQty
                    ),
                    base_quantity: Math.max(
                      0,
                      (inventoryStock.base_quantity || 0) - batchBaseQty
                    ),
                    updatedate: new Date(),
                    updatedby: userId,
                  },
                });
                console.log('  inventory_stock updated');
              } else {
                console.log('   inventory_stock not found for this batch');
              }

              console.log('   Creating VAN_UNLOAD stock movement');
              await createStockMovement(tx, {
                product_id: product.id,
                batch_id: batchLot.id,
                serial_id: null,
                movement_type: 'VAN_UNLOAD',
                reference_type: 'VAN_INVENTORY',
                reference_id: inventory.id,
                from_location_id: null,
                to_location_id: null,
                quantity: batchQty,
                base_quantity: batchBaseQty,
                remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
                van_inventory_id: inventory.id,
                createdby: userId,
              });
              console.log('  Stock movement created');
            }
          } else if (trackingType === 'SERIAL') {
            console.log('  Tracking type: SERIAL');
            let serialData = normalizeInventoryItemSerials(item);
            if (
              (!Array.isArray(serialData) || serialData.length === 0) &&
              item.van_inventory_serial
            ) {
              serialData = [
                {
                  serial_number: item.van_inventory_serial.serial_number,
                  batch_id: item.van_inventory_serial.batch_id,
                  warranty_expiry: item.van_inventory_serial.warranty_expiry,
                  customer_id: item.van_inventory_serial.customer_id,
                },
              ];
            }
            console.log(
              '  Normalized serial data:',
              JSON.stringify(serialData, null, 2)
            );
            if (!Array.isArray(serialData) || serialData.length === 0) {
              console.log('   Skipping: no serial data');
              continue;
            }
            console.log(`  Found ${serialData.length} serials to unload`);

            for (let s = 0; s < serialData.length; s++) {
              const serialInput = serialData[s];
              console.log(
                `  --- Processing unload serial ${s + 1}/${serialData.length} ---`
              );
              console.log(
                '  Serial input:',
                JSON.stringify(serialInput, null, 2)
              );
              const serialNumber =
                typeof serialInput === 'string'
                  ? serialInput
                  : serialInput?.serial_number;
              console.log('  Extracted serial number:', serialNumber);

              if (!serialNumber) {
                console.log('   Skipping serial: no serial number');
                continue;
              }

              const existingSerial = await tx.serial_numbers.findUnique({
                where: { serial_number: serialNumber },
              });

              if (!existingSerial) {
                console.log('   Skipping: serial not found');
                continue;
              }
              console.log(
                '  Found serial:',
                existingSerial.id,
                existingSerial.serial_number
              );

              const vanItem = await tx.van_inventory_items.findFirst({
                where: {
                  product_id: product.id,
                  serial_id: existingSerial.id,
                  quantity: { gt: 0 },
                  van_inventory_items_inventory: {
                    user_id: inventoryUserId,
                    is_active: 'Y',
                    loading_type: 'L',
                  },
                },
              });

              if (!vanItem) {
                console.log(
                  '   Skipping: van_inventory_item not found for this serial'
                );
                continue;
              }
              console.log('  Found van_inventory_item for this serial');

              const inventoryStock = await tx.inventory_stock.findFirst({
                where: {
                  product_id: product.id,
                  location_id: inventoryLocationId || 1,
                  serial_number_id: existingSerial.id,
                  salesperson_id: inventoryUserId,
                },
              });

              if (inventoryStock) {
                console.log(
                  '   Updating inventory_stock: current_stock',
                  inventoryStock.current_stock,
                  '→',
                  Math.max(0, (inventoryStock.current_stock || 0) - 1)
                );
                await tx.inventory_stock.update({
                  where: { id: inventoryStock.id },
                  data: {
                    current_stock: Math.max(
                      0,
                      (inventoryStock.current_stock || 0) - 1
                    ),
                    available_stock: Math.max(
                      0,
                      (inventoryStock.available_stock || 0) - 1
                    ),
                    updatedate: new Date(),
                    updatedby: userId,
                  },
                });
                console.log('  inventory_stock updated');
              } else {
                console.log('   inventory_stock not found for this serial');
              }

              console.log('   Creating VAN_UNLOAD stock movement');
              await createStockMovement(tx, {
                product_id: product.id,
                batch_id: null,
                serial_id: existingSerial.id,
                movement_type: 'VAN_UNLOAD',
                reference_type: 'VAN_INVENTORY',
                reference_id: inventory.id,
                from_location_id: null,
                to_location_id: null,
                quantity: 1,
                remarks: `Unloaded serial ${serialNumber} from van`,
                van_inventory_id: inventory.id,
                createdby: userId,
              });
              console.log('  Stock movement created');
            }
          } else {
            console.log('  Tracking type: NONE (plain quantity)');
            console.log(
              '  Quantity to unload:',
              qty,
              'Base Quantity:',
              baseQty
            );
            const vanItems = await tx.van_inventory_items.findMany({
              where: {
                product_id: product.id,
                batch_lot_id: null,
                serial_id: null,
                van_inventory_items_inventory: {
                  user_id: inventoryUserId,
                  is_active: 'Y',
                  loading_type: 'L',
                },
              },
            });

            if (vanItems.length === 0) {
              console.log('   Skipping: van_inventory_item not found');
              continue;
            }

            const totalVanQty = vanItems.reduce(
              (sum: number, vi: any) => sum + (vi.quantity || 0),
              0
            );
            const totalVanBaseQty = vanItems.reduce(
              (sum: number, vi: any) => sum + (vi.base_quantity || 0),
              0
            );

            console.log(
              '  Found van_inventory_items with total quantity:',
              totalVanQty,
              'and base quantity:',
              totalVanBaseQty
            );

            if (totalVanQty < qty && qty > 0) {
              console.log(
                '   Skipping: van_item total quantity (',
                totalVanQty,
                ') < qty (',
                qty,
                ')'
              );
              continue;
            }

            const inventoryStock = await tx.inventory_stock.findFirst({
              where: {
                product_id: product.id,
                location_id: inventoryLocationId || 1,
                batch_id: null,
                serial_number_id: null,
                salesperson_id: inventoryUserId,
              },
            });

            if (inventoryStock) {
              console.log(
                '   Updating inventory_stock: current_stock',
                inventoryStock.current_stock,
                '→',
                Math.max(0, (inventoryStock.current_stock || 0) - qty)
              );
              await tx.inventory_stock.update({
                where: { id: inventoryStock.id },
                data: {
                  current_stock: Math.max(
                    0,
                    (inventoryStock.current_stock || 0) - qty
                  ),
                  available_stock: Math.max(
                    0,
                    (inventoryStock.available_stock || 0) - qty
                  ),
                  base_quantity: Math.max(
                    0,
                    (inventoryStock.base_quantity || 0) - baseQty
                  ),
                  updatedate: new Date(),
                  updatedby: userId,
                },
              });
              console.log('  inventory_stock updated');
            } else {
              console.log('   inventory_stock not found');
            }

            console.log('   Creating VAN_UNLOAD stock movement');
            await createStockMovement(tx, {
              product_id: product.id,
              batch_id: null,
              serial_id: null,
              movement_type: 'VAN_UNLOAD',
              reference_type: 'VAN_INVENTORY',
              reference_id: inventory.id,
              from_location_id: null,
              to_location_id: null,
              quantity: qty,
              base_quantity: baseQty,
              remarks: `Sold ${qty} units from van`,
              van_inventory_id: inventory.id,
              createdby: userId,
            });
            console.log('  Stock movement created');
          }
        }
      }
    },
    { maxWait: 60000, timeout: 1200000 }
  );
}

export const vanInventoryController = {
  async processApprovedVanInventoryStock(
    inventoryId: number,
    userId: number,
    requestData?: any
  ) {
    await processApprovedVanInventoryStock(inventoryId, userId, requestData);
  },
  // async getSalespersonInventoryItems(req: Request, res: Response) {
  //   try {
  //     const { salesperson_id } = req.params;
  //     const { page, limit, product_id } = req.query;
  //     if (!salesperson_id) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Salesperson ID is required',
  //       });
  //     }
  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 50;
  //     const salespersonIdNum = parseInt(salesperson_id as string, 10);
  //     const user = await prisma.users.findUnique({
  //       where: { id: salespersonIdNum },
  //       select: { id: true, name: true, email: true },
  //     });
  //     if (!user) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Salesperson not found',
  //       });
  //     }
  //     const vans = await prisma.van_inventory.findMany({
  //       where: { user_id: salespersonIdNum, is_active: 'Y' },
  //       select: { id: true },
  //     });
  //     const vanIds = vans.map(v => v.id);
  //     if (vanIds.length === 0) {
  //       return res.json({
  //         success: true,
  //         message: 'No inventory items found for salesperson',
  //         data: [],
  //         pagination: {
  //           current_page: pageNum,
  //           per_page: limitNum,
  //           total_pages: 0,
  //           total_count: 0,
  //           has_next: false,
  //           has_prev: false,
  //         },
  //       });
  //     }
  //     const itemsRaw = (await prisma.van_inventory_items.findMany({
  //       where: {
  //         parent_id: { in: vanIds },
  //         ...(product_id
  //           ? { product_id: parseInt(product_id as string, 10) }
  //           : {}),
  //       },
  //       include: {
  //         van_inventory_items_products: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //             unit_of_measurement: true,
  //             tracking_type: true,
  //             product_unit_of_measurement: true,
  //           },
  //         },
  //         van_inventory_items_batch_lot: {
  //           select: {
  //             id: true,
  //             batch_number: true,
  //             lot_number: true,
  //             expiry_date: true,
  //           },
  //         },
  //       },
  //       orderBy: { id: 'desc' },
  //     })) as any;
  //     const totalCount = itemsRaw.length;
  //     const startIndex = (pageNum - 1) * limitNum;
  //     const paginated = itemsRaw.slice(startIndex, startIndex + limitNum);
  //     const data = paginated.map((it: any) => ({
  //       item_id: it.id,
  //       van_inventory_id: it.parent_id,
  //       product_id: it.product_id,
  //       product_name:
  //         it.van_inventory_items_products?.name || it.product_name || null,
  //       product_code: it.van_inventory_items_products?.code || null,
  //       tracking_type: it.van_inventory_items_products?.tracking_type || null,
  //       unit: it.unit || null,
  //       unit_of_measurement:
  //         it.van_inventory_items_products?.product_unit_of_measurement,
  //       quantity: it.quantity,
  //       unit_price: Number(it.unit_price || 0),
  //       discount_amount: Number(it.discount_amount || 0),
  //       tax_amount: Number(it.tax_amount || 0),
  //       total_amount: Number(it.total_amount || 0),
  //       notes: it.notes || null,
  //       batch_lot_id: it.batch_lot_id || null,
  //       batch: it.van_inventory_items_batch_lot
  //         ? {
  //           id: it.van_inventory_items_batch_lot.id,
  //           batch_number: it.van_inventory_items_batch_lot.batch_number,
  //           lot_number: it.van_inventory_items_batch_lot.lot_number,
  //           expiry_date: it.van_inventory_items_batch_lot.expiry_date,
  //         }
  //         : null,
  //     }));
  //     return res.json({
  //       success: true,
  //       message: 'Salesperson inventory items fetched successfully',
  //       data,
  //       pagination: {
  //         current_page: pageNum,
  //         per_page: limitNum,
  //         total_pages: Math.ceil(totalCount / limitNum),
  //         total_count: totalCount,
  //         has_next: startIndex + limitNum < totalCount,
  //         has_prev: startIndex > 0,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Get Salesperson Inventory Items Error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve salesperson inventory items',
  //       error: error.message,
  //     });
  //   }
  // },

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
      const stagedStocks = await prisma.inventory_stock.findMany({
        where: {
          salesperson_id: salespersonIdNum,
          is_unloadAll: 'Y',
          is_active: 'Y',
        },
        select: {
          product_id: true,
          batch_id: true,
          serial_number_id: true,
        },
      });

      const stagedBatches = new Set(
        stagedStocks
          .map(s => s.batch_id)
          .filter((id): id is number => id !== null)
      );
      const stagedSerials = new Set(
        stagedStocks
          .map(s => s.serial_number_id)
          .filter((id): id is number => id !== null)
      );
      const stagedProductIds = new Set(
        stagedStocks
          .filter(s => s.batch_id === null && s.serial_number_id === null)
          .map(s => s.product_id)
      );
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
      const itemsRaw = (await prisma.van_inventory_items.findMany({
        where: {
          parent_id: { in: vanIds },
          ...(product_id
            ? { product_id: parseInt(product_id as string, 10) }
            : {}),
        },
        include: {
          van_inventory_items_products: {
            select: {
              id: true,
              name: true,
              code: true,
              unit_of_measurement: true,
              tracking_type: true,
              product_unit_of_measurement: true,
            },
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
      })) as any;
      const filteredItems = itemsRaw.filter((it: any) => {
        if (it.serial_id && stagedSerials.has(it.serial_id)) return false;
        if (it.batch_lot_id && stagedBatches.has(it.batch_lot_id)) return false;
        if (
          !it.serial_id &&
          !it.batch_lot_id &&
          stagedProductIds.has(it.product_id)
        )
          return false;
        return true;
      });

      const totalCount = filteredItems.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = filteredItems.slice(startIndex, startIndex + limitNum);
      const data = paginated.map((it: any) => ({
        item_id: it.id,
        van_inventory_id: it.parent_id,
        product_id: it.product_id,
        product_name:
          it.van_inventory_items_products?.name || it.product_name || null,
        product_code: it.van_inventory_items_products?.code || null,
        tracking_type: it.van_inventory_items_products?.tracking_type || null,
        unit: it.unit || null,
        unit_of_measurement:
          it.van_inventory_items_products?.product_unit_of_measurement,
        quantity: it.quantity,
        unit_price: Number(it.unit_price || 0),
        discount_amount: Number(it.discount_amount || 0),
        tax_amount: Number(it.tax_amount || 0),
        total_amount: Number(it.total_amount || 0),
        notes: it.notes || null,
        sap_docnum: it.sap_docnum || null,
        sap_docentry: it.sap_docentry || null,
        source_system: it.source_system || null,
        source_system_label: getSourceSystemLabel(it.source_system),
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
  // async getSalespersonInventoryItemsDropdown(req: Request, res: Response) {
  //   try {
  //     const { salesperson_id } = req.params;
  //     const { search } = req.query;
  //     if (!salesperson_id) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Salesperson ID is required',
  //       });
  //     }
  //     const salespersonIdNum = parseInt(salesperson_id as string, 10);
  //     const vans = await prisma.van_inventory.findMany({
  //       where: { user_id: salespersonIdNum, is_active: 'Y' },
  //       select: { id: true },
  //     });
  //     const vanIds = vans.map(v => v.id);
  //     if (vanIds.length === 0) {
  //       return res.json({
  //         success: true,
  //         message: 'No items found',
  //         data: [],
  //       });
  //     }
  //     const items = await prisma.van_inventory_items.findMany({
  //       where: { parent_id: { in: vanIds } },
  //       select: {
  //         id: true,
  //         product_id: true,
  //         quantity: true,
  //         van_inventory_items_products: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //             tracking_type: true,
  //             base_price: true,
  //             product_tax_master: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 code: true,
  //                 tax_rate: true,
  //                 description: true,
  //               },
  //             },
  //           },
  //         },
  //         van_inventory_items_batch_lot: {
  //           select: {
  //             id: true,
  //             remaining_quantity: true,
  //           },
  //         },
  //       },
  //     });

  //     const productInventoryMap = new Map<number, number>();

  //     items.forEach(it => {
  //       const productId = it.van_inventory_items_products?.id;
  //       const trackingType =
  //         it.van_inventory_items_products?.tracking_type?.toLowerCase() ||
  //         'none';

  //       if (productId) {
  //         const currentRemaining = productInventoryMap.get(productId) || 0;
  //         let itemRemaining = 0;

  //         if (trackingType === 'batch') {
  //           itemRemaining =
  //             it.van_inventory_items_batch_lot?.remaining_quantity || 0;
  //         } else if (trackingType === 'serial') {
  //           itemRemaining = it.quantity || 0;
  //         } else {
  //           itemRemaining = it.quantity || 0;
  //         }

  //         productInventoryMap.set(productId, currentRemaining + itemRemaining);
  //       }
  //     });

  //     const map = new Map<
  //       number,
  //       {
  //         id: number;
  //         name: string;
  //         code: string;
  //         unit_price: number;
  //         product_id: number;
  //         tracking_type: string | null;
  //         tax_details?: {
  //           id: number;
  //           name: string;
  //           code: string;
  //           tax_rate: number;
  //           description?: string | null;
  //         } | null;
  //       }
  //     >();
  //     items.forEach(it => {
  //       const p = it.van_inventory_items_products;
  //       if (p) {
  //         const productRemainingQuantity = productInventoryMap.get(p.id) || 0;

  //         if (productRemainingQuantity > 0) {
  //           if (
  //             !search ||
  //             (p.name &&
  //               p.name.toLowerCase().includes((search as string).toLowerCase()))
  //           ) {
  //             map.set(p.id, {
  //               id: it.id,
  //               name: p.name || 'N/A',
  //               code: p.code || '',
  //               unit_price: Number(p.base_price || 0),
  //               product_id: p.id,
  //               tracking_type: p.tracking_type || null,
  //               tax_details: p.product_tax_master
  //                 ? {
  //                   id: p.product_tax_master.id,
  //                   name: p.product_tax_master.name,
  //                   code: p.product_tax_master.code,
  //                   tax_rate: Number(p.product_tax_master.tax_rate),
  //                   description: p.product_tax_master.description,
  //                 }
  //                 : null,
  //             });
  //           }
  //         }
  //       }
  //     });
  //     return res.json({
  //       success: true,
  //       message: 'Dropdown items fetched successfully',
  //       data: Array.from(map.values()),
  //     });
  //   } catch (error: any) {
  //     console.error('Get Salesperson Inventory Items Dropdown Error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve dropdown items',
  //       error: error.message,
  //     });
  //   }
  // },

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
      const stagedStocks = await prisma.inventory_stock.findMany({
        where: {
          salesperson_id: salespersonIdNum,
          is_unloadAll: 'Y',
          is_active: 'Y',
        },
        select: {
          product_id: true,
          batch_id: true,
          serial_number_id: true,
        },
      });

      const stagedBatches = new Set(
        stagedStocks
          .map(s => s.batch_id)
          .filter((id): id is number => id !== null)
      );
      const stagedSerials = new Set(
        stagedStocks
          .map(s => s.serial_number_id)
          .filter((id): id is number => id !== null)
      );
      const stagedProductIds = new Set(
        stagedStocks
          .filter(s => s.batch_id === null && s.serial_number_id === null)
          .map(s => s.product_id)
      );
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
        select: {
          id: true,
          product_id: true,
          quantity: true,
          serial_id: true,
          van_inventory_items_products: {
            select: {
              id: true,
              name: true,
              code: true,
              tracking_type: true,
              base_price: true,
              product_tax_master: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  tax_rate: true,
                  description: true,
                },
              },
            },
          },
          van_inventory_items_batch_lot: {
            select: {
              id: true,
              remaining_quantity: true,
            },
          },
        },
      });

      const productInventoryMap = new Map<number, number>();

      const filteredItems = items.filter((it: any) => {
        if (it.serial_id && stagedSerials.has(it.serial_id)) return false;
        if (
          it.van_inventory_items_batch_lot?.id &&
          stagedBatches.has(it.van_inventory_items_batch_lot.id)
        )
          return false;
        if (
          !it.serial_id &&
          !it.van_inventory_items_batch_lot?.id &&
          stagedProductIds.has(it.product_id)
        )
          return false;
        return true;
      });

      filteredItems.forEach(it => {
        const productId = it.van_inventory_items_products?.id;
        const trackingType =
          it.van_inventory_items_products?.tracking_type?.toLowerCase() ||
          'none';

        if (productId) {
          const currentRemaining = productInventoryMap.get(productId) || 0;
          let itemRemaining = 0;

          if (trackingType === 'batch') {
            itemRemaining =
              it.van_inventory_items_batch_lot?.remaining_quantity || 0;
          } else if (trackingType === 'serial') {
            itemRemaining = it.quantity || 0;
          } else {
            itemRemaining = it.quantity || 0;
          }

          productInventoryMap.set(productId, currentRemaining + itemRemaining);
        }
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
          tax_details?: {
            id: number;
            name: string;
            code: string;
            tax_rate: number;
            description?: string | null;
          } | null;
        }
      >();
      filteredItems.forEach(it => {
        const p = it.van_inventory_items_products;
        if (p) {
          const productRemainingQuantity = productInventoryMap.get(p.id) || 0;

          if (productRemainingQuantity > 0) {
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
                tax_details: p.product_tax_master
                  ? {
                    id: p.product_tax_master.id,
                    name: p.product_tax_master.name,
                    code: p.product_tax_master.code,
                    tax_rate: Number(p.product_tax_master.tax_rate),
                    description: p.product_tax_master.description,
                  }
                  : null,
              });
            }
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

  // async createOrUpdateVanInventory(req: Request, res: Response) {
  //   const data = req.body;
  //   const userId = (req as any).user?.id || 1;

  //   const { van_inventory_items, inventoryItems, ...inventoryData } = data;
  //   const items = van_inventory_items || inventoryItems || [];
  //   let inventoryId = inventoryData.id;

  //   try {
  //     const result = await prisma.$transaction(
  //       async tx => {
  //         let inventory: any;
  //         let isUpdate = false;

  //         if (inventoryId) {
  //           const existing = await tx.van_inventory.findUnique({
  //             where: { id: Number(inventoryId) },
  //           });
  //           if (existing) {
  //             isUpdate = true;
  //           }
  //         }

  //         if (!inventoryData.user_id) {
  //           throw new Error('user_id is required');
  //         }

  //         const spUserId = Number(inventoryData.user_id || userId || 1);
  //         const spUser = await tx.users.findUnique({ where: { id: spUserId } });
  //         const depotName = `Van - ${spUser?.name || spUserId}`;
  //         let vanDepot = await tx.depots.findFirst({
  //           where: { name: depotName },
  //         });
  //         if (!vanDepot) {
  //           const parentDepot = await tx.depots.findFirst({
  //             orderBy: { id: 'asc' },
  //           });
  //           vanDepot = await tx.depots.create({
  //             data: {
  //               parent_id: parentDepot ? parentDepot.parent_id : 1,
  //               name: depotName,
  //               code: `VAN-${spUserId}`,
  //               is_active: 'Y',
  //               createdby: userId || 1,
  //             },
  //           });
  //         }
  //         inventoryData.location_id = vanDepot.id;

  //         const userExists = await tx.users.findUnique({
  //           where: { id: Number(inventoryData.user_id) },
  //         });
  //         if (!userExists) {
  //           throw new Error(`User ${inventoryData.user_id} not found`);
  //         }

  //         if (inventoryData.vehicle_id) {
  //           const vehicleExists = await tx.vehicles.findUnique({
  //             where: { id: Number(inventoryData.vehicle_id) },
  //           });
  //           if (!vehicleExists) {
  //             throw new Error(`Vehicle ${inventoryData.vehicle_id} not found`);
  //           }
  //         }

  //         const loadingType = inventoryData.loading_type || 'L';

  //         const payload = {
  //           user_id: Number(inventoryData.user_id),
  //           status: inventoryData.status || 'A',
  //           loading_type: loadingType,
  //           document_date:
  //             inventoryData.document_date &&
  //             inventoryData.document_date.trim() !== ''
  //               ? new Date(inventoryData.document_date)
  //               : new Date(),
  //           vehicle_id: inventoryData.vehicle_id
  //             ? Number(inventoryData.vehicle_id)
  //             : null,
  //           location_type: inventoryData.location_type || 'van',
  //           location_id: inventoryData.location_id
  //             ? Number(inventoryData.location_id)
  //             : null,
  //           is_active: inventoryData.is_active || 'Y',
  //           sale_type: inventoryData.sale_type || null,
  //         };

  //         if (isUpdate && inventoryId) {
  //           inventory = await tx.van_inventory.update({
  //             where: { id: Number(inventoryId) },
  //             data: {
  //               ...payload,
  //               updatedby: userId,
  //               updatedate: new Date(),
  //               log_inst: { increment: 1 },
  //             },
  //           });

  //           // Handle Sub Inventory Users
  //           await tx.van_inventory_sub_users.deleteMany({
  //             where: { parent_id: Number(inventoryId) },
  //           });

  //           if (
  //             inventoryData.sale_type === 'container' &&
  //             Array.isArray(inventoryData.sub_inventory_user_ids)
  //           ) {
  //             const subUsersData = inventoryData.sub_inventory_user_ids.map(
  //               (subUserId: number) => ({
  //                 parent_id: Number(inventoryId),
  //                 user_id: Number(subUserId),
  //                 createdby: userId,
  //                 log_inst: 1,
  //               })
  //             );
  //             await tx.van_inventory_sub_users.createMany({
  //               data: subUsersData,
  //             });
  //           }
  //         } else {
  //           inventory = await tx.van_inventory.create({
  //             data: {
  //               ...payload,
  //               createdby: userId,
  //               createdate: new Date(),
  //               log_inst: 1,
  //             },
  //           });
  //           inventoryId = inventory.id;

  //           // Handle Sub Inventory Users for Create
  //           if (
  //             inventoryData.sale_type === 'container' &&
  //             Array.isArray(inventoryData.sub_inventory_user_ids)
  //           ) {
  //             const subUsersData = inventoryData.sub_inventory_user_ids.map(
  //               (subUserId: number) => ({
  //                 parent_id: inventory.id,
  //                 user_id: Number(subUserId),
  //                 createdby: userId,
  //                 log_inst: 1,
  //               })
  //             );
  //             await tx.van_inventory_sub_users.createMany({
  //               data: subUsersData,
  //             });
  //           }
  //         }

  //         if (Array.isArray(items) && items.length > 0) {
  //           for (const item of items) {
  //             const qty = parseInt(item.quantity, 10) || 0;

  //             if (qty <= 0) {
  //               throw new Error('Quantity must be greater than 0');
  //             }

  //             if (!item.product_id) {
  //               throw new Error('product_id is required for each item');
  //             }

  //             const product = await tx.products.findUnique({
  //               where: { id: Number(item.product_id) },
  //               include: { product_unit_of_measurement: true },
  //             });

  //             if (!product) {
  //               throw new Error(`Product ${item.product_id} not found`);
  //             }

  //             const trackingType =
  //               product.tracking_type?.toUpperCase() || 'NONE';

  //             if (loadingType === 'L') {
  //               if (trackingType === 'BATCH') {
  //                 const batchData = item.batches || item.product_batches;

  //                 if (
  //                   !batchData ||
  //                   !Array.isArray(batchData) ||
  //                   batchData.length === 0
  //                 ) {
  //                   throw new Error(
  //                     `Batches are required for batch-tracked product ${product.name}`
  //                   );
  //                 }

  //                 for (const batchInput of batchData) {
  //                   const batchQty = parseInt(batchInput.quantity, 10) || 0;

  //                   if (batchQty <= 0) {
  //                     throw new Error('Batch quantity must be greater than 0');
  //                   }

  //                   let batchLot = await tx.batch_lots.findFirst({
  //                     where: {
  //                       batch_number: batchInput.batch_number,
  //                       productsId: product.id,
  //                       is_active: 'Y',
  //                       createdby: Number(inventoryData.user_id),
  //                     },
  //                   });

  //                   if (batchLot) {
  //                     await tx.batch_lots.update({
  //                       where: { id: batchLot.id },
  //                       data: {
  //                         quantity: batchLot.quantity + batchQty,
  //                         remaining_quantity:
  //                           batchLot.remaining_quantity + batchQty,
  //                         updatedate: new Date(),
  //                       },
  //                     });
  //                     console.log(
  //                       ` Updated batch_lots: ${batchLot.batch_number}`
  //                     );
  //                   } else {
  //                     batchLot = await tx.batch_lots.create({
  //                       data: {
  //                         batch_number: batchInput.batch_number,
  //                         lot_number:
  //                           batchInput.lot_number || `LOT-${Date.now()}`,
  //                         manufacturing_date: batchInput.manufacturing_date
  //                           ? new Date(batchInput.manufacturing_date)
  //                           : new Date(),
  //                         expiry_date: batchInput.expiry_date
  //                           ? new Date(batchInput.expiry_date)
  //                           : new Date(
  //                               new Date().setFullYear(
  //                                 new Date().getFullYear() + 2
  //                               )
  //                             ),
  //                         quantity: batchQty,
  //                         remaining_quantity: batchQty,
  //                         supplier_name: batchInput.supplier_name || null,
  //                         purchase_price: batchInput.purchase_price || null,
  //                         quality_grade: batchInput.quality_grade || 'A',
  //                         storage_location: batchInput.storage_location || null,
  //                         is_active: 'Y',
  //                         createdate: new Date(),
  //                         createdby: Number(inventoryData.user_id),
  //                         log_inst: 1,
  //                         productsId: product.id,
  //                       },
  //                     });
  //                     console.log(
  //                       ` Created batch_lots: ${batchLot.batch_number}`
  //                     );
  //                   }

  //                   let productBatch = await tx.product_batches.findFirst({
  //                     where: {
  //                       product_id: product.id,
  //                       batch_lot_id: batchLot.id,
  //                       is_active: 'Y',
  //                     },
  //                   });

  //                   if (productBatch) {
  //                     await tx.product_batches.update({
  //                       where: { id: productBatch.id },
  //                       data: {
  //                         quantity: productBatch.quantity + batchQty,
  //                         updatedate: new Date(),
  //                       },
  //                     });
  //                     console.log(` Updated product_batches: +${batchQty}`);
  //                   } else {
  //                     await tx.product_batches.create({
  //                       data: {
  //                         product_id: product.id,
  //                         batch_lot_id: batchLot.id,
  //                         quantity: batchQty,
  //                         is_active: 'Y',
  //                         createdate: new Date(),
  //                         createdby: userId,
  //                         log_inst: 1,
  //                       },
  //                     });
  //                     console.log(` Created product_batches`);
  //                   }

  //                   const existingVanItem =
  //                     await tx.van_inventory_items.findFirst({
  //                       where: {
  //                         product_id: product.id,
  //                         batch_lot_id: batchLot.id,
  //                         van_inventory_items_inventory: {
  //                           user_id: inventoryData.user_id,
  //                           is_active: 'Y',
  //                         },
  //                       },
  //                       include: {
  //                         van_inventory_items_inventory: true,
  //                       },
  //                     });

  //                   if (existingVanItem) {
  //                     const newQuantity = existingVanItem.quantity + batchQty;
  //                     await tx.van_inventory_items.update({
  //                       where: { id: existingVanItem.id },
  //                       data: {
  //                         quantity: newQuantity,
  //                         total_amount:
  //                           newQuantity * Number(item.unit_price || 0),
  //                       },
  //                     });
  //                     console.log(
  //                       ` Updated van_inventory_items (ID: ${existingVanItem.id}): ${existingVanItem.quantity} → ${newQuantity}`
  //                     );
  //                   } else {
  //                     await tx.van_inventory_items.create({
  //                       data: {
  //                         parent_id: inventory.id,
  //                         product_id: product.id,
  //                         product_name: product.name,
  //                         unit:
  //                           product.product_unit_of_measurement?.name || 'pcs',
  //                         quantity: batchQty,
  //                         unit_price: Number(item.unit_price || 0),
  //                         discount_amount: Number(item.discount_amount || 0),
  //                         tax_amount: Number(item.tax_amount || 0),
  //                         total_amount: batchQty * Number(item.unit_price || 0),
  //                         notes: item.notes || null,
  //                         batch_lot_id: batchLot.id,
  //                       },
  //                     });
  //                     console.log(` Created van_inventory_items`);
  //                   }

  //                   await updateInventoryStock(
  //                     tx,
  //                     product.id,
  //                     inventoryData.location_id || null,
  //                     batchQty,
  //                     'L',
  //                     batchLot.id,
  //                     null,
  //                     userId,
  //                     inventoryData.user_id
  //                   );

  //                   await updateSubUsersInventoryStock(
  //                     tx,
  //                     inventoryData,
  //                     product.id,
  //                     batchQty,
  //                     'L',
  //                     batchLot.id,
  //                     null,
  //                     userId,
  //                     {
  //                       movement_type: 'VAN_LOAD',
  //                       van_inventory_id: inventory.id,
  //                       remarks: `Loaded to van (Sub User) - Batch ${batchLot.batch_number}`,
  //                     }
  //                   );

  //                   await createStockMovement(tx, {
  //                     product_id: product.id,
  //                     batch_id: batchLot.id,
  //                     serial_id: null,
  //                     movement_type: 'VAN_LOAD',
  //                     reference_type: 'VAN_INVENTORY',
  //                     reference_id: inventory.id,
  //                     from_location_id: null,
  //                     to_location_id: null,
  //                     quantity: batchQty,
  //                     remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
  //                     van_inventory_id: inventory.id,
  //                     createdby: userId,
  //                   });
  //                 }
  //               } else if (trackingType === 'SERIAL') {
  //                 const serialData = item.serials || item.product_serials;

  //                 if (
  //                   !serialData ||
  //                   !Array.isArray(serialData) ||
  //                   serialData.length === 0
  //                 ) {
  //                   throw new Error(
  //                     `Serial numbers are required for serial-tracked product "${product.name}"`
  //                   );
  //                 }

  //                 console.log(` Product: ${product.name}, ID: ${product.id}`);

  //                 for (const serialInput of serialData) {
  //                   const serialNumber =
  //                     typeof serialInput === 'string'
  //                       ? serialInput
  //                       : serialInput.serial_number;

  //                   if (!serialNumber) {
  //                     throw new Error('Serial number is required');
  //                   }

  //                   let existingSerial = await tx.serial_numbers.findUnique({
  //                     where: { serial_number: serialNumber },
  //                   });

  //                   if (existingSerial) {
  //                     if (existingSerial.status === 'in_van') {
  //                       throw new Error(
  //                         `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
  //                       );
  //                     }

  //                     await tx.serial_numbers.update({
  //                       where: { id: existingSerial.id },
  //                       data: {
  //                         status: 'in_van',
  //                         location_id: null,
  //                         updatedate: new Date(),
  //                         updatedby: userId,
  //                       },
  //                     });
  //                     console.log(
  //                       ` Updated serial ${serialNumber} status → in_van`
  //                     );
  //                   } else {
  //                     existingSerial = await tx.serial_numbers.create({
  //                       data: {
  //                         product_id: product.id,
  //                         serial_number: serialNumber,
  //                         batch_id: serialInput.batch_id || null,
  //                         status: 'in_van',
  //                         location_id: null,
  //                         warranty_expiry: serialInput.warranty_expiry
  //                           ? new Date(serialInput.warranty_expiry)
  //                           : null,
  //                         customer_id: serialInput.customer_id || null,
  //                         is_active: 'Y',
  //                         createdate: new Date(),
  //                         createdby: userId,
  //                         log_inst: 1,
  //                       },
  //                     });
  //                     console.log(` Created new serial ${serialNumber}`);
  //                   }

  //                   const existingVanItem =
  //                     await tx.van_inventory_items.findFirst({
  //                       where: {
  //                         product_id: product.id,
  //                         serial_id: existingSerial.id,
  //                         van_inventory_items_inventory: {
  //                           user_id: inventoryData.user_id,
  //                           is_active: 'Y',
  //                         },
  //                       },
  //                       include: {
  //                         van_inventory_items_inventory: true,
  //                       },
  //                     });

  //                   if (existingVanItem) {
  //                     const newQuantity = existingVanItem.quantity + 1;
  //                     await tx.van_inventory_items.update({
  //                       where: { id: existingVanItem.id },
  //                       data: {
  //                         quantity: newQuantity,
  //                         total_amount:
  //                           newQuantity * Number(item.unit_price || 0),
  //                       },
  //                     });
  //                     console.log(
  //                       ` Updated van_inventory_items ID: ${existingVanItem.id}, quantity: ${existingVanItem.quantity}→${newQuantity}`
  //                     );
  //                   } else {
  //                     await tx.van_inventory_items.create({
  //                       data: {
  //                         parent_id: inventory.id,
  //                         product_id: product.id,
  //                         product_name: product.name,
  //                         unit:
  //                           product.product_unit_of_measurement?.name || 'pcs',
  //                         quantity: 1,
  //                         unit_price: Number(item.unit_price || 0),
  //                         discount_amount: Number(item.discount_amount || 0),
  //                         tax_amount: Number(item.tax_amount || 0),
  //                         total_amount: 1 * Number(item.unit_price || 0),
  //                         notes: item.notes || null,
  //                         serial_id: existingSerial.id,
  //                       },
  //                     });
  //                     console.log(
  //                       `Created new van_inventory_items for serial ${serialNumber}`
  //                     );
  //                   }

  //                   await updateInventoryStock(
  //                     tx,
  //                     product.id,
  //                     inventoryData.location_id || null,
  //                     1,
  //                     'L',
  //                     null,
  //                     existingSerial.id,
  //                     userId,
  //                     inventoryData.user_id
  //                   );

  //                   await updateSubUsersInventoryStock(
  //                     tx,
  //                     inventoryData,
  //                     product.id,
  //                     1,
  //                     'L',
  //                     null,
  //                     existingSerial.id,
  //                     userId,
  //                     {
  //                       movement_type: 'VAN_LOAD',
  //                       van_inventory_id: inventory.id,
  //                       remarks: `Loaded serial ${serialNumber} to van (Sub User)`,
  //                     }
  //                   );

  //                   await createStockMovement(tx, {
  //                     product_id: product.id,
  //                     batch_id: null,
  //                     serial_id: existingSerial.id,
  //                     movement_type: 'VAN_LOAD',
  //                     reference_type: 'VAN_INVENTORY',
  //                     reference_id: inventory.id,
  //                     from_location_id: null,
  //                     to_location_id: null,
  //                     quantity: 1,
  //                     remarks: `Loaded serial ${serialNumber} to van`,
  //                     van_inventory_id: inventory.id,
  //                     createdby: userId,
  //                   });
  //                   console.log(
  //                     ` Created VAN_LOAD stock movement for ${serialNumber}`
  //                   );
  //                 }
  //               } else {
  //                 // NONE tracking type
  //                 const existingVanItem =
  //                   await tx.van_inventory_items.findFirst({
  //                     where: {
  //                       parent_id: inventory.id,
  //                       product_id: product.id,
  //                       batch_lot_id: null,
  //                       serial_id: null,
  //                     },
  //                   });

  //                 if (existingVanItem) {
  //                   await tx.van_inventory_items.update({
  //                     where: { id: existingVanItem.id },
  //                     data: {
  //                       quantity: existingVanItem.quantity + qty,
  //                       total_amount:
  //                         (existingVanItem.quantity + qty) *
  //                         Number(item.unit_price || 0),
  //                     },
  //                   });
  //                   console.log(
  //                     `    Updated van_inventory_items: ${existingVanItem.quantity} → ${existingVanItem.quantity + qty}`
  //                   );
  //                 } else {
  //                   await tx.van_inventory_items.create({
  //                     data: {
  //                       parent_id: inventory.id,
  //                       product_id: product.id,
  //                       product_name: product.name,
  //                       unit:
  //                         product.product_unit_of_measurement?.name || 'pcs',
  //                       quantity: qty,
  //                       unit_price: Number(item.unit_price || 0),
  //                       discount_amount: Number(item.discount_amount || 0),
  //                       tax_amount: Number(item.tax_amount || 0),
  //                       total_amount: qty * Number(item.unit_price || 0),
  //                       notes: item.notes || null,
  //                       batch_lot_id: null,
  //                       serial_id: null,
  //                     },
  //                   });
  //                   console.log(`    Created van_inventory_items`);
  //                 }

  //                 await updateInventoryStock(
  //                   tx,
  //                   product.id,
  //                   inventoryData.location_id || null,
  //                   qty,
  //                   'L',
  //                   null,
  //                   null,
  //                   userId,
  //                   inventoryData.user_id
  //                 );

  //                 await updateSubUsersInventoryStock(
  //                   tx,
  //                   inventoryData,
  //                   product.id,
  //                   qty,
  //                   'L',
  //                   null,
  //                   null,
  //                   userId,
  //                   {
  //                     movement_type: 'VAN_LOAD',
  //                     van_inventory_id: inventory.id,
  //                     remarks: `Loaded ${qty} units to van (Sub User)`,
  //                   }
  //                 );

  //                 await createStockMovement(tx, {
  //                   product_id: product.id,
  //                   batch_id: null,
  //                   serial_id: null,
  //                   movement_type: 'VAN_LOAD',
  //                   reference_type: 'VAN_INVENTORY',
  //                   reference_id: inventory.id,
  //                   from_location_id: null,
  //                   to_location_id: null,
  //                   quantity: qty,
  //                   remarks: `Loaded ${qty} units to van`,
  //                   van_inventory_id: inventory.id,
  //                   createdby: userId,
  //                 });

  //                 console.log(
  //                   ` Loaded ${qty} units of NONE-tracked product ${product.name}\n`
  //                 );
  //               }
  //             } else if (loadingType === 'U') {
  //               if (trackingType === 'BATCH') {
  //                 const batchData = item.batches || item.product_batches;

  //                 for (const batchInput of batchData) {
  //                   const batchQty = parseInt(batchInput.quantity, 10) || 0;

  //                   const batchLot = await tx.batch_lots.findFirst({
  //                     where: {
  //                       batch_number: batchInput.batch_number,
  //                       is_active: 'Y',
  //                     },
  //                   });

  //                   if (!batchLot)
  //                     throw new Error(
  //                       `Batch ${batchInput.batch_number} not found`
  //                     );

  //                   const vanItem = await tx.van_inventory_items.findFirst({
  //                     where: {
  //                       product_id: product.id,
  //                       batch_lot_id: batchLot.id,
  //                       van_inventory_items_inventory: {
  //                         user_id: Number(inventoryData.user_id),
  //                         is_active: 'Y',
  //                       },
  //                     },
  //                   });
  //                   if (!vanItem) throw new Error(`Batch not found in van`);
  //                   if (vanItem.quantity < batchQty)
  //                     throw new Error(`Insufficient van quantity`);

  //                   // await tx.van_inventory_items.update({
  //                   //   where: { id: vanItem.id },
  //                   //   data: {
  //                   //     quantity: vanItem.quantity - batchQty,
  //                   //     total_amount:
  //                   //       (vanItem.quantity - batchQty) *
  //                   //       Number(vanItem.unit_price || 0),
  //                   //   },
  //                   // });

  //                   // await tx.batch_lots.update({
  //                   //   where: { id: batchLot.id },
  //                   //   data: {
  //                   //     remaining_quantity:
  //                   //       batchLot.remaining_quantity - batchQty,
  //                   //     updatedate: new Date(),
  //                   //   },
  //                   // });

  //                   // const productBatch = await tx.product_batches.findFirst({
  //                   //   where: {
  //                   //     product_id: product.id,
  //                   //     batch_lot_id: batchLot.id,
  //                   //     is_active: 'Y',
  //                   //   },
  //                   // });

  //                   // if (productBatch) {
  //                   //   await tx.product_batches.update({
  //                   //     where: { id: productBatch.id },
  //                   //     data: {
  //                   //       quantity: productBatch.quantity - batchQty,
  //                   //       updatedate: new Date(),
  //                   //     },
  //                   //   });
  //                   // }

  //                   const inventoryStock = await tx.inventory_stock.findFirst({
  //                     where: {
  //                       product_id: product.id,
  //                       location_id: inventoryData.location_id || 1,
  //                       batch_id: batchLot.id,
  //                     },
  //                   });

  //                   if (inventoryStock) {
  //                     await tx.inventory_stock.update({
  //                       where: { id: inventoryStock.id },
  //                       data: {
  //                         current_stock:
  //                           (inventoryStock.current_stock || 0) - batchQty,
  //                         available_stock:
  //                           (inventoryStock.available_stock || 0) - batchQty,
  //                         updatedate: new Date(),
  //                         updatedby: userId,
  //                       },
  //                     });
  //                   }

  //                   await updateSubUsersInventoryStock(
  //                     tx,
  //                     inventoryData,
  //                     product.id,
  //                     batchQty,
  //                     'U',
  //                     batchLot.id,
  //                     null,
  //                     userId,
  //                     {
  //                       movement_type: 'VAN_UNLOAD',
  //                       van_inventory_id: inventory.id,
  //                       remarks: `Unloaded from van (Sub User) - Batch ${batchLot.batch_number}`,
  //                     }
  //                   );

  //                   await tx.van_inventory_items.create({
  //                     data: {
  //                       parent_id: inventory.id,
  //                       product_id: product.id,
  //                       product_name: product.name,
  //                       unit:
  //                         product.product_unit_of_measurement?.name || 'pcs',
  //                       quantity: batchQty,
  //                       unit_price: Number(item.unit_price || 0),
  //                       discount_amount: Number(item.discount_amount || 0),
  //                       tax_amount: Number(item.tax_amount || 0),
  //                       total_amount: batchQty * Number(item.unit_price || 0),
  //                       notes: item.notes || null,
  //                       batch_lot_id: batchLot.id,
  //                     },
  //                   });

  //                   await createStockMovement(tx, {
  //                     product_id: product.id,
  //                     batch_id: batchLot.id,
  //                     serial_id: null,
  //                     movement_type: 'VAN_UNLOAD',
  //                     reference_type: 'VAN_INVENTORY',
  //                     reference_id: inventory.id,
  //                     from_location_id: null,
  //                     to_location_id: null,
  //                     quantity: batchQty,
  //                     remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
  //                     van_inventory_id: inventory.id,
  //                     createdby: userId,
  //                   });
  //                 }
  //               } else if (trackingType === 'SERIAL') {
  //                 const serialData = item.serials || item.product_serials;

  //                 for (const serialInput of serialData) {
  //                   const serialNumber =
  //                     typeof serialInput === 'string'
  //                       ? serialInput
  //                       : serialInput.serial_number;

  //                   const existingSerial = await tx.serial_numbers.findUnique({
  //                     where: { serial_number: serialNumber },
  //                   });

  //                   if (!existingSerial)
  //                     throw new Error(`Serial ${serialNumber} not found`);

  //                   const vanItem = await tx.van_inventory_items.findFirst({
  //                     where: {
  //                       product_id: product.id,
  //                       serial_id: existingSerial.id,
  //                       quantity: { gt: 0 },
  //                       van_inventory_items_inventory: {
  //                         user_id: Number(inventoryData.user_id),
  //                         is_active: 'Y',
  //                       },
  //                     },
  //                   });

  //                   if (!vanItem) {
  //                     throw new Error(
  //                       `Serial ${serialNumber} not found in any van inventory`
  //                     );
  //                   }

  //                   console.log(
  //                     ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
  //                   );

  //                   const vanInventoryId = vanItem.parent_id;

  //                   // await tx.van_inventory_items.update({
  //                   //   where: { id: vanItem.id },
  //                   //   data: { quantity: 0 },
  //                   // });

  //                   // await tx.serial_numbers.update({
  //                   //   where: { id: existingSerial.id },
  //                   //   data: {
  //                   //     status: 'available',
  //                   //     location_id: inventoryData.location_id || null,
  //                   //     updatedate: new Date(),
  //                   //     updatedby: userId,
  //                   //   },
  //                   // });
  //                   // console.log(
  //                   //   ` Updated serial ${serialNumber} status → available`
  //                   // );

  //                   const inventoryStock = await tx.inventory_stock.findFirst({
  //                     where: {
  //                       product_id: product.id,
  //                       serial_number_id: existingSerial.id,
  //                     },
  //                   });

  //                   if (inventoryStock) {
  //                     await tx.inventory_stock.update({
  //                       where: { id: inventoryStock.id },
  //                       data: {
  //                         current_stock: Math.max(
  //                           0,
  //                           (inventoryStock.current_stock || 0) - 1
  //                         ),
  //                         available_stock: Math.max(
  //                           0,
  //                           (inventoryStock.available_stock || 0) - 1
  //                         ),
  //                         updatedate: new Date(),
  //                         updatedby: userId,
  //                       },
  //                     });
  //                     console.log(
  //                       ` DECREASED inventory_stock for ${serialNumber}`
  //                     );
  //                   }

  //                   await updateSubUsersInventoryStock(
  //                     tx,
  //                     inventoryData,
  //                     product.id,
  //                     1,
  //                     'U',
  //                     null,
  //                     existingSerial.id,
  //                     userId,
  //                     {
  //                       movement_type: 'VAN_UNLOAD',
  //                       van_inventory_id: inventory.id,
  //                       remarks: `Sold serial ${serialNumber} (Sub User)`,
  //                     }
  //                   );

  //                   await createStockMovement(tx, {
  //                     product_id: product.id,
  //                     batch_id: null,
  //                     serial_id: existingSerial.id,
  //                     movement_type: 'VAN_UNLOAD',
  //                     reference_type: 'VAN_INVENTORY',
  //                     reference_id: inventory.id,
  //                     from_location_id: null,
  //                     to_location_id: null,
  //                     quantity: 1,
  //                     remarks: `Sold serial ${serialNumber}`,
  //                     van_inventory_id: inventory.id,
  //                     createdby: userId,
  //                   });

  //                   await tx.van_inventory_items.create({
  //                     data: {
  //                       parent_id: inventory.id,
  //                       product_id: product.id,
  //                       product_name: product.name,
  //                       unit:
  //                         product.product_unit_of_measurement?.name || 'pcs',
  //                       quantity: 1,
  //                       unit_price: Number(item.unit_price || 0),
  //                       discount_amount: Number(item.discount_amount || 0),
  //                       tax_amount: Number(item.tax_amount || 0),
  //                       total_amount: 1 * Number(item.unit_price || 0),
  //                       notes: item.notes || null,
  //                       serial_id: existingSerial.id,
  //                     },
  //                   });
  //                 }
  //               } else {
  //                 //   const vanItem = await tx.van_inventory_items.findFirst({
  //                 //     where: {
  //                 //       parent_id: inventory.id,
  //                 //       product_id: product.id,
  //                 //       batch_lot_id: null,
  //                 //       serial_id: null,
  //                 //     },
  //                 //   });

  //                 const vanItem = await tx.van_inventory_items.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     batch_lot_id: null,
  //                     serial_id: null,
  //                     van_inventory_items_inventory: {
  //                       user_id: Number(inventoryData.user_id),
  //                       is_active: 'Y',
  //                       loading_type: 'L',
  //                     },
  //                   },
  //                 });

  //                 if (!vanItem) throw new Error(`Product not found in van`);
  //                 if (vanItem.quantity < qty)
  //                   throw new Error(`Insufficient van quantity`);

  //                 // await tx.van_inventory_items.update({
  //                 //   where: { id: vanItem.id },
  //                 //   data: {
  //                 //     quantity: vanItem.quantity - qty,
  //                 //     total_amount:
  //                 //       (vanItem.quantity - qty) *
  //                 //       Number(vanItem.unit_price || 0),
  //                 //   },
  //                 // });

  //                 const inventoryStock = await tx.inventory_stock.findFirst({
  //                   where: {
  //                     product_id: product.id,
  //                     location_id: inventoryData.location_id || 1,
  //                     batch_id: null,
  //                     serial_number_id: null,
  //                   },
  //                 });

  //                 if (inventoryStock) {
  //                   await tx.inventory_stock.update({
  //                     where: { id: inventoryStock.id },
  //                     data: {
  //                       current_stock:
  //                         (inventoryStock.current_stock || 0) - qty,
  //                       available_stock:
  //                         (inventoryStock.available_stock || 0) - qty,
  //                       updatedate: new Date(),
  //                       updatedby: userId,
  //                     },
  //                   });
  //                 }

  //                 await updateSubUsersInventoryStock(
  //                   tx,
  //                   inventoryData,
  //                   product.id,
  //                   qty,
  //                   'U',
  //                   null,
  //                   null,
  //                   userId,
  //                   {
  //                     movement_type: 'VAN_UNLOAD',
  //                     van_inventory_id: inventory.id,
  //                     remarks: `Sold ${qty} units from van (Sub User)`,
  //                   }
  //                 );

  //                 await createStockMovement(tx, {
  //                   product_id: product.id,
  //                   batch_id: null,
  //                   serial_id: null,
  //                   movement_type: 'VAN_UNLOAD',
  //                   reference_type: 'VAN_INVENTORY',
  //                   reference_id: inventory.id,
  //                   from_location_id: null,
  //                   to_location_id: null,
  //                   quantity: qty,
  //                   remarks: `Sold ${qty} units from van`,
  //                   van_inventory_id: inventory.id,
  //                   createdby: userId,
  //                 });

  //                 await tx.van_inventory_items.create({
  //                   data: {
  //                     parent_id: inventory.id,
  //                     product_id: product.id,
  //                     product_name: product.name,
  //                     unit: product.product_unit_of_measurement?.name || 'pcs',
  //                     quantity: qty,
  //                     unit_price: Number(item.unit_price || 0),
  //                     discount_amount: Number(item.discount_amount || 0),
  //                     tax_amount: Number(item.tax_amount || 0),
  //                     total_amount: qty * Number(item.unit_price || 0),
  //                     notes: item.notes || null,
  //                     batch_lot_id: null,
  //                     serial_id: null,
  //                   },
  //                 });
  //               }
  //             }
  //           }
  //         }
  //         const finalInventory = await tx.van_inventory.findUnique({
  //           where: { id: inventory.id },
  //           include: {
  //             van_inventory_users: true,
  //             vehicle: true,
  //             van_inventory_depot: true,
  //             van_inventory_sub_users: {
  //               include: {
  //                 users: true,
  //               },
  //             },
  //             van_inventory_items_inventory: {
  //               include: {
  //                 van_inventory_items_products: {
  //                   include: {
  //                     product_unit_of_measurement: true,
  //                     product_tax_master: true,
  //                     product_product_batches: {
  //                       include: {
  //                         batch_lot_product_batches: true,
  //                       },
  //                     },
  //                     serial_numbers_products: {
  //                       include: {
  //                         serial_numbers_customers: true,
  //                       },
  //                     },
  //                   },
  //                 },
  //                 van_inventory_items_batch_lot: true,
  //               },
  //             },
  //             van_inventory_stock_movements: true,
  //           },
  //         });

  //         return { finalInventory, wasUpdate: isUpdate };
  //       },
  //       { maxWait: 60000, timeout: 1200000 }
  //     );

  //     const finalInventory = (result as any).finalInventory;
  //     const wasUpdate = (result as any).wasUpdate === true;

  //     res.status(wasUpdate ? 200 : 201).json({
  //       message: wasUpdate
  //         ? 'Van Inventory updated successfully'
  //         : 'Van Inventory created successfully',
  //       data: serializeVanInventory(finalInventory),
  //     });
  //   } catch (error: any) {
  //     console.error('Create/Update Van Inventory Error:', error);

  //     const badRequestKeywords = [
  //       'required',
  //       'not found',
  //       'Insufficient',
  //       'expired',
  //       'not active',
  //       'Invalid',
  //       'must be',
  //       'already exists',
  //     ];

  //     if (badRequestKeywords.some(kw => error.message?.includes(kw))) {
  //       return res.status(400).json({ message: error.message });
  //     }

  //     return res.status(500).json({
  //       message: 'Failed to process van inventory',
  //       error: error.message,
  //     });
  //   }
  // },

  async createOrUpdateVanInventory(req: Request, res: Response) {
    const data = req.body;
    console.log(
      ' createOrUpdateVanInventory INCOMING DATA ',
      JSON.stringify(data, null, 2)
    );
    const userId = (req as any).user?.id || 1;

    const { van_inventory_items, inventoryItems, ...inventoryData } = data;
    const items = van_inventory_items || inventoryItems || [];
    console.log(
      ' Extracted items for processing ',
      JSON.stringify(items, null, 2)
    );
    let inventoryId = inventoryData.id;

    try {
      const result = await prisma.$transaction(
        async tx => {
          let inventory: any;
          let isUpdate = false;
          let existingInventoryToCheck: any = null;

          if (inventoryId) {
            const existing = await tx.van_inventory.findUnique({
              where: { id: Number(inventoryId) },
            });
            if (existing) {
              isUpdate = true;
              existingInventoryToCheck = existing;
            }
          }

          const resolveRecordByIdOrSap = async (
            model: 'users' | 'vehicles' | 'depots',
            idValue: any,
            sapValue: any,
            entityLabel: string
          ) => {
            const normalizedId =
              idValue !== undefined && idValue !== null && idValue !== ''
                ? Number(idValue)
                : null;
            const normalizedSap =
              sapValue !== undefined && sapValue !== null && sapValue !== ''
                ? String(sapValue).trim()
                : null;

            if (normalizedId) {
              const record = await (tx as any)[model].findUnique({
                where: { id: normalizedId },
              });
              if (record) return record;
            }

            if (normalizedSap) {
              const record = await (tx as any)[model].findFirst({
                where: { sap_code: normalizedSap },
              });
              if (record) return record;
            }

            if (normalizedId || normalizedSap) {
              throw new Error(
                `${entityLabel} ${normalizedId ?? normalizedSap} not found`
              );
            }

            return null;
          };

          const userIdentifier =
            inventoryData.user_id ?? inventoryData.user_sap;
          if (!userIdentifier) {
            throw new Error('user_id or user_sap is required');
          }

          const spUser = await resolveRecordByIdOrSap(
            'users',
            inventoryData.user_id,
            inventoryData.user_sap,
            'User'
          );
          if (!spUser) {
            throw new Error(`User ${userIdentifier} not found`);
          }

          inventoryData.user_id = spUser.id;
          const spUserId = Number(spUser.id);

          const locationIdentifier =
            inventoryData.location_id ?? inventoryData.location_sap;
          if (
            locationIdentifier !== undefined &&
            locationIdentifier !== null &&
            locationIdentifier !== ''
          ) {
            const resolvedLocation = await resolveRecordByIdOrSap(
              'depots',
              inventoryData.location_id,
              inventoryData.location_sap,
              'Location'
            );
            inventoryData.location_id = resolvedLocation.id;
          } else {
            const depotName = `Van - ${spUser?.name || spUserId}`;
            let vanDepot = await tx.depots.findFirst({
              where: { name: depotName },
            });
            if (!vanDepot) {
              const parentDepot = await tx.depots.findFirst({
                orderBy: { id: 'asc' },
              });
              vanDepot = await tx.depots.create({
                data: {
                  parent_id: parentDepot ? parentDepot.parent_id : 1,
                  name: depotName,
                  code: `VAN-${spUserId}`,
                  is_active: 'Y',
                  createdby: userId || 1,
                },
              });
            }
            inventoryData.location_id = vanDepot.id;
          }

          let workflowExists = false;
          const requesterZoneId = spUser.zone_id;
          const requesterDepotId = await resolveRequesterDepotId(
            tx,
            spUser.id,
            'VAN_INVENTORY',
            JSON.stringify({ ...data, location_id: inventoryData.location_id })
          );

          if (requesterZoneId && requesterDepotId) {
            const zoneDepotWorkflow = await tx.approval_work_flow.findMany({
              where: {
                request_type: 'VAN_INVENTORY',
                zone_id: requesterZoneId,
                depot_id: requesterDepotId,
                is_active: 'Y',
              },
            });
            if (zoneDepotWorkflow.length > 0) workflowExists = true;
          }

          if (!workflowExists && requesterZoneId) {
            const zoneWorkflow = await tx.approval_work_flow.findMany({
              where: {
                request_type: 'VAN_INVENTORY',
                zone_id: requesterZoneId,
                depot_id: null,
                is_active: 'Y',
              },
            });
            if (zoneWorkflow.length > 0) workflowExists = true;
          }

          if (!workflowExists && requesterDepotId) {
            const depotWorkflow = await tx.approval_work_flow.findMany({
              where: {
                request_type: 'VAN_INVENTORY',
                zone_id: null,
                depot_id: requesterDepotId,
                is_active: 'Y',
              },
            });
            if (depotWorkflow.length > 0) workflowExists = true;
          }

          if (!workflowExists) {
            const globalWorkflow = await tx.approval_work_flow.findMany({
              where: {
                request_type: 'VAN_INVENTORY',
                zone_id: null,
                depot_id: null,
                is_active: 'Y',
              },
            });
            if (globalWorkflow.length > 0) workflowExists = true;
          }

          if (
            !workflowExists &&
            (!isUpdate || existingInventoryToCheck?.approval_status === 'P')
          ) {
            inventoryData.approval_status = 'A';
          }

          const vehicleIdentifier =
            inventoryData.vehicle_id ?? inventoryData.vehicle_sap;
          if (
            vehicleIdentifier !== undefined &&
            vehicleIdentifier !== null &&
            vehicleIdentifier !== ''
          ) {
            const vehicleExists = await resolveRecordByIdOrSap(
              'vehicles',
              inventoryData.vehicle_id,
              inventoryData.vehicle_sap,
              'Vehicle'
            );
            inventoryData.vehicle_id = vehicleExists.id;
          }

          const loadingType = inventoryData.loading_type || 'L';

          const payload = {
            user_id: Number(inventoryData.user_id),
            is_cancelled: inventoryData.is_cancelled || 'N',
            approval_status: inventoryData.approval_status || 'P',
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
            sale_type: inventoryData.sale_type || null,
            remarks: inventoryData.remarks || null,
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

            // Delete existing items and sub users when updating
            await tx.van_inventory_items.deleteMany({
              where: { parent_id: Number(inventoryId) },
            });
            await tx.van_inventory_sub_users.deleteMany({
              where: { parent_id: Number(inventoryId) },
            });

            if (
              inventoryData.sale_type === 'container' &&
              Array.isArray(inventoryData.sub_inventory_user_ids)
            ) {
              const subUsersData = inventoryData.sub_inventory_user_ids.map(
                (subUserId: number) => ({
                  parent_id: Number(inventoryId),
                  user_id: Number(subUserId),
                  createdby: userId,
                  log_inst: 1,
                })
              );
              await tx.van_inventory_sub_users.createMany({
                data: subUsersData,
              });
            }
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

            // Handle Sub Inventory Users for Create
            if (
              inventoryData.sale_type === 'container' &&
              Array.isArray(inventoryData.sub_inventory_user_ids)
            ) {
              const subUsersData = inventoryData.sub_inventory_user_ids.map(
                (subUserId: number) => ({
                  parent_id: inventory.id,
                  user_id: Number(subUserId),
                  createdby: userId,
                  log_inst: 1,
                })
              );
              await tx.van_inventory_sub_users.createMany({
                data: subUsersData,
              });
            }
          }

          const shouldPerformLoadingUnloading =
            payload.approval_status === 'A' && payload.is_cancelled === 'N';

          console.log(
            `Van inventory stock processing gate: approvalStatus=${payload.approval_status}, cancelled=${payload.is_cancelled}, shouldProcess=${shouldPerformLoadingUnloading}, inventoryId=${inventoryId}`
          );

          if (Array.isArray(items) && items.length > 0) {
            console.log(
              `Saving ${items.length} items to van_inventory_items for inventory ${inventory.id}`
            );
            for (const item of items) {
              const qty = parseInt(item.quantity, 10) || 0;
              if (qty <= 0) continue;
              if (!item.product_id) continue;

              const product = await tx.products.findUnique({
                where: { id: Number(item.product_id) },
                include: { product_unit_of_measurement: true },
              });
              if (!product) continue;

              const trackingType =
                product.tracking_type?.toUpperCase() || 'NONE';
              if (trackingType === 'BATCH') {
                const batchData = item.batches || item.product_batches;
                if (!Array.isArray(batchData) || batchData.length === 0)
                  continue;

                for (const batchInput of batchData) {
                  const batchQty = parseInt(batchInput.quantity, 10) || 0;
                  if (batchQty <= 0) continue;

                  // let batchLot = null;
                  // if (batchInput.batch_number) {
                  //   batchLot = await tx.batch_lots.findFirst({
                  //     where: {
                  //       batch_number: batchInput.batch_number,
                  //       is_active: 'Y',
                  //       ...(loadingType === 'L'
                  //         ? {
                  //           productsId: product.id,
                  //           createdby: Number(inventoryData.user_id),
                  //         }
                  //         : {}),
                  //     },
                  //   });
                  // }

                  let batchLot = null;

                  if (batchInput.batch_number) {
                    batchLot = await tx.batch_lots.findFirst({
                      where: {
                        batch_number: batchInput.batch_number,
                        productsId: product.id,
                        is_active: 'Y',
                        createdby: Number(inventoryData.user_id),
                      },
                    });

                    if (!batchLot) {
                      batchLot = await tx.batch_lots.create({
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
                          createdby: Number(inventoryData.user_id),
                          productsId: product.id,
                        },
                      });
                    }
                  }

                  // Always has a value if batch_number was provided
                  const batch_lot_id = batchLot?.id;

                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: batchQty,
                      source_system: 'sfa',
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: batchQty * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      batch_lot_id: batchLot?.id || null,
                    },
                  });
                  console.log(
                    `  Saved batch item: ${product.name} (batch: ${batchInput.batch_number}, qty: ${batchQty})`
                  );
                }
              } else if (trackingType === 'SERIAL') {
                const serialData = normalizeInventoryItemSerials(item);
                if (!Array.isArray(serialData) || serialData.length === 0)
                  continue;

                for (const serialInput of serialData) {
                  const serialNumber =
                    typeof serialInput === 'string'
                      ? serialInput
                      : serialInput?.serial_number;
                  if (!serialNumber) continue;

                  let existingSerial = null;
                  if (serialNumber) {
                    existingSerial = await tx.serial_numbers.findUnique({
                      where: { serial_number: serialNumber },
                    });
                  }

                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: 1,
                      source_system: 'sfa',
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: 1 * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      serial_id: existingSerial?.id || null,
                    },
                  });
                  console.log(
                    `  Saved serial item: ${product.name} (serial: ${serialNumber})`
                  );
                }
              } else {
                await tx.van_inventory_items.create({
                  data: {
                    parent_id: inventory.id,
                    product_id: product.id,
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name || 'pcs',
                    quantity: qty,
                    source_system: 'sfa',
                    unit_price: Number(item.unit_price || 0),
                    discount_amount: Number(item.discount_amount || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    total_amount: qty * Number(item.unit_price || 0),
                    notes: item.notes || null,
                    batch_lot_id: null,
                    serial_id: null,
                  },
                });
                console.log(
                  `  Saved plain item: ${product.name} (qty: ${qty})`
                );
              }
            }
            console.log(`=== Finished saving items to van_inventory_items`);
          }

          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              if (!shouldPerformLoadingUnloading) {
                continue;
              }
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
                  const batchData = item.batches || item.product_batches;

                  if (
                    !batchData ||
                    !Array.isArray(batchData) ||
                    batchData.length === 0
                  ) {
                    throw new Error(
                      `Batches are required for batch-tracked product ${product.name}`
                    );
                  }

                  for (const batchInput of batchData) {
                    const batchQty = parseInt(batchInput.quantity, 10) || 0;

                    if (batchQty <= 0) {
                      throw new Error('Batch quantity must be greater than 0');
                    }

                    let batchLot = await tx.batch_lots.findFirst({
                      where: {
                        batch_number: batchInput.batch_number,
                        productsId: product.id,
                        is_active: 'Y',
                        createdby: Number(inventoryData.user_id),
                      },
                    });

                    if (batchLot) {
                      await tx.batch_lots.update({
                        where: { id: batchLot.id },
                        data: {
                          quantity: batchLot.quantity + batchQty,
                          remaining_quantity:
                            batchLot.remaining_quantity + batchQty,
                          updatedate: new Date(),
                        },
                      });
                      console.log(
                        ` Updated batch_lots: ${batchLot.batch_number}`
                      );
                    } else {
                      batchLot = await tx.batch_lots.create({
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
                          createdby: Number(inventoryData.user_id),
                          log_inst: 1,
                          productsId: product.id,
                        },
                      });
                      console.log(
                        ` Created batch_lots: ${batchLot.batch_number}`
                      );
                    }

                    let productBatch = await tx.product_batches.findFirst({
                      where: {
                        product_id: product.id,
                        batch_lot_id: batchLot.id,
                        is_active: 'Y',
                      },
                    });

                    if (productBatch) {
                      await tx.product_batches.update({
                        where: { id: productBatch.id },
                        data: {
                          quantity: productBatch.quantity + batchQty,
                          updatedate: new Date(),
                        },
                      });
                      console.log(` Updated product_batches: +${batchQty}`);
                    } else {
                      await tx.product_batches.create({
                        data: {
                          product_id: product.id,
                          batch_lot_id: batchLot.id,
                          quantity: batchQty,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: userId,
                          log_inst: 1,
                        },
                      });
                      console.log(` Created product_batches`);
                    }

                    await updateInventoryStock(
                      tx,
                      product.id,
                      inventoryData.location_id || null,
                      batchQty,
                      'L',
                      batchLot.id,
                      null,
                      userId,
                      inventoryData.user_id
                    );

                    await updateSubUsersInventoryStock(
                      tx,
                      inventoryData,
                      product.id,
                      batchQty,
                      'L',
                      batchLot.id,
                      null,
                      userId,
                      {
                        movement_type: 'VAN_LOAD',
                        van_inventory_id: inventory.id,
                        remarks: `Loaded to van (Sub User) - Batch ${batchLot.batch_number}`,
                      }
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: batchLot.id,
                      serial_id: null,
                      movement_type: 'VAN_LOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: batchQty,
                      remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }
                } else if (trackingType === 'SERIAL') {
                  const serialData = item.serials || item.product_serials;

                  if (
                    !serialData ||
                    !Array.isArray(serialData) ||
                    serialData.length === 0
                  ) {
                    throw new Error(
                      `Serial numbers are required for serial-tracked product "${product.name}"`
                    );
                  }

                  console.log(` Product: ${product.name}, ID: ${product.id}`);

                  for (const serialInput of serialData) {
                    const serialNumber =
                      typeof serialInput === 'string'
                        ? serialInput
                        : serialInput.serial_number;

                    if (!serialNumber) {
                      throw new Error('Serial number is required');
                    }

                    let existingSerial = await tx.serial_numbers.findUnique({
                      where: { serial_number: serialNumber },
                    });

                    if (existingSerial) {
                      if (existingSerial.status === 'in_van') {
                        throw new Error(
                          `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
                        );
                      }

                      await tx.serial_numbers.update({
                        where: { id: existingSerial.id },
                        data: {
                          status: 'in_van',
                          location_id: null,
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                      console.log(
                        ` Updated serial ${serialNumber} status → in_van`
                      );
                    } else {
                      existingSerial = await tx.serial_numbers.create({
                        data: {
                          product_id: product.id,
                          serial_number: serialNumber,
                          batch_id: serialInput.batch_id || null,
                          status: 'in_van',
                          location_id: null,
                          warranty_expiry: serialInput.warranty_expiry
                            ? new Date(serialInput.warranty_expiry)
                            : null,
                          customer_id: serialInput.customer_id || null,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: userId,
                          log_inst: 1,
                        },
                      });
                      console.log(` Created new serial ${serialNumber}`);
                    }

                    await updateInventoryStock(
                      tx,
                      product.id,
                      inventoryData.location_id || null,
                      1,
                      'L',
                      null,
                      existingSerial.id,
                      userId,
                      inventoryData.user_id
                    );

                    await updateSubUsersInventoryStock(
                      tx,
                      inventoryData,
                      product.id,
                      1,
                      'L',
                      null,
                      existingSerial.id,
                      userId,
                      {
                        movement_type: 'VAN_LOAD',
                        van_inventory_id: inventory.id,
                        remarks: `Loaded serial ${serialNumber} to van (Sub User)`,
                      }
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: null,
                      serial_id: existingSerial.id,
                      movement_type: 'VAN_LOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: 1,
                      remarks: `Loaded serial ${serialNumber} to van`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                    console.log(
                      ` Created VAN_LOAD stock movement for ${serialNumber}`
                    );
                  }
                } else {
                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventoryData.location_id || null,
                    qty,
                    'L',
                    null,
                    null,
                    userId,
                    inventoryData.user_id
                  );

                  await updateSubUsersInventoryStock(
                    tx,
                    inventoryData,
                    product.id,
                    qty,
                    'L',
                    null,
                    null,
                    userId,
                    {
                      movement_type: 'VAN_LOAD',
                      van_inventory_id: inventory.id,
                      remarks: `Loaded ${qty} units to van (Sub User)`,
                    }
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: qty,
                    remarks: `Loaded ${qty} units to van`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });

                  console.log(
                    ` Loaded ${qty} units of NONE-tracked product ${product.name}\n`
                  );
                }
              } else if (loadingType === 'U') {
                if (trackingType === 'BATCH') {
                  const batchData = item.batches || item.product_batches;

                  for (const batchInput of batchData) {
                    const batchQty = parseInt(batchInput.quantity, 10) || 0;

                    const batchLot = await tx.batch_lots.findFirst({
                      where: {
                        batch_number: batchInput.batch_number,
                        productsId: product.id,
                        is_active: 'Y',
                        // createdby: Number(inventoryData.user_id),
                      },
                    });

                    if (!batchLot)
                      throw new Error(
                        `Batch ${batchInput.batch_number} not found`
                      );

                    const vanItem = await tx.van_inventory_items.findFirst({
                      where: {
                        product_id: product.id,
                        batch_lot_id: batchLot.id,
                        van_inventory_items_inventory: {
                          user_id: Number(inventoryData.user_id),
                          is_active: 'Y',
                        },
                      },
                    });
                    if (!vanItem) throw new Error(`Batch not found in van`);
                    if (vanItem.quantity < batchQty)
                      throw new Error(`Insufficient van quantity`);

                    // await tx.van_inventory_items.update({
                    //   where: { id: vanItem.id },
                    //   data: {
                    //     quantity: vanItem.quantity - batchQty,
                    //     total_amount:
                    //       (vanItem.quantity - batchQty) *
                    //       Number(vanItem.unit_price || 0),
                    //   },
                    // });

                    // await tx.batch_lots.update({
                    //   where: { id: batchLot.id },
                    //   data: {
                    //     remaining_quantity:
                    //       batchLot.remaining_quantity - batchQty,
                    //     updatedate: new Date(),
                    //   },
                    // });

                    // const productBatch = await tx.product_batches.findFirst({
                    //   where: {
                    //     product_id: product.id,
                    //     batch_lot_id: batchLot.id,
                    //     is_active: 'Y',
                    //   },
                    // });

                    // if (productBatch) {
                    //   await tx.product_batches.update({
                    //     where: { id: productBatch.id },
                    //     data: {
                    //       quantity: productBatch.quantity - batchQty,
                    //       updatedate: new Date(),
                    //     },
                    //   });
                    // }

                    const inventoryStock = await tx.inventory_stock.findFirst({
                      where: {
                        product_id: product.id,
                        location_id: inventoryData.location_id || 1,
                        batch_id: batchLot.id,
                      },
                    });

                    if (inventoryStock) {
                      await tx.inventory_stock.update({
                        where: { id: inventoryStock.id },
                        data: {
                          current_stock:
                            (inventoryStock.current_stock || 0) - batchQty,
                          available_stock:
                            (inventoryStock.available_stock || 0) - batchQty,
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                    }

                    await updateSubUsersInventoryStock(
                      tx,
                      inventoryData,
                      product.id,
                      batchQty,
                      'U',
                      batchLot.id,
                      null,
                      userId,
                      {
                        movement_type: 'VAN_UNLOAD',
                        van_inventory_id: inventory.id,
                        remarks: `Unloaded from van (Sub User) - Batch ${batchLot.batch_number}`,
                      }
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: batchLot.id,
                      serial_id: null,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: batchQty,
                      remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }
                } else if (trackingType === 'SERIAL') {
                  const serialData = item.serials || item.product_serials;

                  for (const serialInput of serialData) {
                    const serialNumber =
                      typeof serialInput === 'string'
                        ? serialInput
                        : serialInput.serial_number;

                    const existingSerial = await tx.serial_numbers.findUnique({
                      where: { serial_number: serialNumber },
                    });

                    if (!existingSerial)
                      throw new Error(`Serial ${serialNumber} not found`);

                    const vanItem = await tx.van_inventory_items.findFirst({
                      where: {
                        product_id: product.id,
                        serial_id: existingSerial.id,
                        quantity: { gt: 0 },
                        van_inventory_items_inventory: {
                          user_id: Number(inventoryData.user_id),
                          is_active: 'Y',
                        },
                      },
                    });

                    if (!vanItem) {
                      throw new Error(
                        `Serial ${serialNumber} not found in any van inventory`
                      );
                    }

                    console.log(
                      ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
                    );

                    const vanInventoryId = vanItem.parent_id;

                    // await tx.van_inventory_items.update({
                    //   where: { id: vanItem.id },
                    //   data: { quantity: 0 },
                    // });

                    // await tx.serial_numbers.update({
                    //   where: { id: existingSerial.id },
                    //   data: {
                    //     status: 'available',
                    //     location_id: inventoryData.location_id || null,
                    //     updatedate: new Date(),
                    //     updatedby: userId,
                    //   },
                    // });
                    // console.log(
                    //   ` Updated serial ${serialNumber} status → available`
                    // );

                    const inventoryStock = await tx.inventory_stock.findFirst({
                      where: {
                        product_id: product.id,
                        serial_number_id: existingSerial.id,
                      },
                    });

                    if (inventoryStock) {
                      await tx.inventory_stock.update({
                        where: { id: inventoryStock.id },
                        data: {
                          current_stock: Math.max(
                            0,
                            (inventoryStock.current_stock || 0) - 1
                          ),
                          available_stock: Math.max(
                            0,
                            (inventoryStock.available_stock || 0) - 1
                          ),
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                      console.log(
                        ` DECREASED inventory_stock for ${serialNumber}`
                      );
                    }

                    await updateSubUsersInventoryStock(
                      tx,
                      inventoryData,
                      product.id,
                      1,
                      'U',
                      null,
                      existingSerial.id,
                      userId,
                      {
                        movement_type: 'VAN_UNLOAD',
                        van_inventory_id: inventory.id,
                        remarks: `Sold serial ${serialNumber} (Sub User)`,
                      }
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: null,
                      serial_id: existingSerial.id,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: 1,
                      remarks: `Sold serial ${serialNumber}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }
                } else {
                  //   const vanItem = await tx.van_inventory_items.findFirst({
                  //     where: {
                  //       parent_id: inventory.id,
                  //       product_id: product.id,
                  //       batch_lot_id: null,
                  //       serial_id: null,
                  //     },
                  //   });

                  const vanItem = await tx.van_inventory_items.findFirst({
                    where: {
                      product_id: product.id,
                      batch_lot_id: null,
                      serial_id: null,
                      van_inventory_items_inventory: {
                        user_id: Number(inventoryData.user_id),
                        is_active: 'Y',
                        loading_type: 'L',
                      },
                    },
                  });

                  if (!vanItem) throw new Error(`Product not found in van`);
                  if (vanItem.quantity < qty)
                    throw new Error(`Insufficient van quantity`);

                  // await tx.van_inventory_items.update({
                  //   where: { id: vanItem.id },
                  //   data: {
                  //     quantity: vanItem.quantity - qty,
                  //     total_amount:
                  //       (vanItem.quantity - qty) *
                  //       Number(vanItem.unit_price || 0),
                  //   },
                  // });

                  const inventoryStock = await tx.inventory_stock.findFirst({
                    where: {
                      product_id: product.id,
                      location_id: inventoryData.location_id || 1,
                      batch_id: null,
                      serial_number_id: null,
                    },
                  });

                  if (inventoryStock) {
                    await tx.inventory_stock.update({
                      where: { id: inventoryStock.id },
                      data: {
                        current_stock:
                          (inventoryStock.current_stock || 0) - qty,
                        available_stock:
                          (inventoryStock.available_stock || 0) - qty,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });
                  }

                  await updateSubUsersInventoryStock(
                    tx,
                    inventoryData,
                    product.id,
                    qty,
                    'U',
                    null,
                    null,
                    userId,
                    {
                      movement_type: 'VAN_UNLOAD',
                      van_inventory_id: inventory.id,
                      remarks: `Sold ${qty} units from van (Sub User)`,
                    }
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: qty,
                    remarks: `Sold ${qty} units from van`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });
                }
              }
            }
          }
          const finalInventory = await tx.van_inventory.findUnique({
            where: { id: inventory.id },
            include: {
              van_inventory_users: true,
              vehicle: true,
              van_inventory_depot: true,
              van_inventory_sub_users: {
                include: {
                  users: true,
                },
              },
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: {
                    include: {
                      product_unit_of_measurement: true,
                      product_tax_master: true,
                      product_product_batches: {
                        include: {
                          batch_lot_product_batches: true,
                        },
                      },
                      serial_numbers_products: {
                        include: {
                          serial_numbers_customers: true,
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
        { maxWait: 60000, timeout: 1200000 }
      );

      const finalInventory = (result as any).finalInventory;
      const wasUpdate = (result as any).wasUpdate === true;

      if (finalInventory?.approval_status === 'P') {
        await createRequest({
          requester_id: Number(finalInventory.user_id),
          request_type: 'VAN_INVENTORY',
          reference_id: finalInventory.id,
          request_data: JSON.stringify({
            ...data,
            items,
          }),
          createdby: userId,
          log_inst: 1,
        });
      }

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
      const {
        page,
        limit,
        search,
        status,
        loading_type,
        user_id,
        approval_status,
        time_filter,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';
      const loadingType = loading_type
        ? (loading_type as string).toUpperCase()
        : '';

      const documentDateFilter = getTimeFilter(
        time_filter as string | undefined
      );

      const user = req.user;
      let depotIds: number[] = [];
      let isScopeRestricted = false;

      if (user && !isAdminRole(user.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma.user_depots.findMany({
          where: { user_id: user.id },
          select: { depot_id: true },
        });
        depotIds = userDepots
          .map((ud: any) => ud.depot_id)
          .filter((id: any) => id !== null) as number[];
      }

      let finalApprovalStatus: any = undefined;

      if (approval_status) {
        if ((approval_status as string).toUpperCase() === 'ALL') {
          finalApprovalStatus = undefined;
        } else {
          const statuses = (approval_status as string)
            .split(',')
            .map(s => s.trim().toUpperCase());
          finalApprovalStatus =
            statuses.length === 1 ? statuses[0] : { in: statuses };
        }
      } else if (statusLower) {
        if (statusLower === 'pending') finalApprovalStatus = 'P';
        else if (statusLower === 'approved') finalApprovalStatus = 'A';
        else if (statusLower === 'rejected') finalApprovalStatus = 'R';
        else if (statusLower === 'all') finalApprovalStatus = undefined;
      }

      const filters: any = {
        ...(search && {
          OR: [
            { van_inventory_users: { name: { contains: searchLower } } },
            { vehicle: { vehicle_number: { contains: searchLower } } },
          ],
        }),
        ...(finalApprovalStatus && { approval_status: finalApprovalStatus }),
        ...(loadingType === 'L' && { loading_type: 'L' }),
        ...(loadingType === 'U' && { loading_type: 'U' }),
        ...(user_id && { user_id: parseInt(user_id as string, 10) }),
        ...(documentDateFilter && { document_date: documentDateFilter }),
      };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          filters.van_inventory_users = {
            ...filters.van_inventory_users,
            users_depots_users: {
              some: {
                depot_id: { in: depotIds },
              },
            },
          };
        } else {
          filters.id = -1;
        }
      }

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
          van_inventory_sub_users: {
            include: {
              users: true,
            },
          },
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
                  product_tax_master: true,
                  serial_numbers_products: {
                    include: {
                      serial_numbers_customers: true,
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

      const [
        totalVanInventory,
        activeVanInventory,
        inactiveVanInventory,
        vanInventoryThisMonth,
      ] = await Promise.all([
        prisma.van_inventory.count({
          where: isScopeRestricted ? filters : undefined,
        }),
        prisma.van_inventory.count({ where: { ...filters, is_active: 'Y' } }),
        prisma.van_inventory.count({ where: { ...filters, is_active: 'N' } }),
        prisma.van_inventory.count({
          where: {
            ...filters,
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
      const user = (req as any).user;
      let depotIds: number[] = [];
      let isScopeRestricted = false;

      if (user && !isAdminRole(user.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma.user_depots.findMany({
          where: { user_id: user.id },
          select: { depot_id: true },
        });
        depotIds = userDepots
          .map((ud: any) => ud.depot_id)
          .filter((id: any) => id !== null) as number[];
      }

      const whereClause: any = { id: Number(id) };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          whereClause.van_inventory_users = {
            users_depots_users: {
              some: {
                depot_id: { in: depotIds },
              },
            },
          };
        } else {
          whereClause.id = -1;
        }
      }

      const record = await prisma.van_inventory.findUnique({
        where: whereClause,
        include: {
          van_inventory_users: true,
          van_inventory_depot: true,
          van_inventory_stock_movements: true,
          van_inventory_sub_users: {
            include: {
              users: true,
            },
          },
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
                  serial_numbers_products: {
                    include: {
                      serial_numbers_customers: true,
                    },
                  },
                  product_tax_master: true,
                },
              },
              van_inventory_serial: {
                include: {
                  serial_numbers_customers: true,
                },
              },
              van_inventory_items_batch_lot: true,
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

  // async getVanInventoryById(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;

  //     const record = await prisma.van_inventory.findUnique({
  //       where: {
  //         id: Number(id), // This line is correct
  //       },
  //       include: {
  //         van_inventory_users: true,
  //         van_inventory_depot: true,
  //         van_inventory_stock_movements: true,
  //         van_inventory_items_inventory: {
  //           include: {
  //             van_inventory_items_products: {
  //               include: {
  //                 product_unit_of_measurement: true,
  //                 product_product_batches: {
  //                   where: {
  //                     is_active: 'Y',
  //                   },
  //                   include: {
  //                     batch_lot_product_batches: true,
  //                   },
  //                 },
  //                 serial_numbers_products: {
  //                   include: {
  //                     serial_numbers_customers: true,
  //                   },
  //                 },
  //                 product_tax_master: true,
  //               },
  //             },
  //           },
  //         },
  //         vehicle: true,
  //       },
  //     });

  //     if (!record) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Van inventory not found',
  //       });
  //     }

  //     res.json({
  //       success: true,
  //       message: 'Van inventory retrieved successfully',
  //       data: record,
  //     });
  //   } catch (error: any) {
  //     console.error('Get Van Inventory By ID Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // },

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
      if (inventoryData.sale_type !== undefined) {
        payload.sale_type = inventoryData.sale_type;
      }

      const updated = await prisma.$transaction(async tx => {
        const inv = await tx.van_inventory.update({
          where: { id: Number(id) },
          data: payload,
        });

        if (
          inventoryData.sub_inventory_user_ids !== undefined ||
          inventoryData.sale_type !== undefined
        ) {
          await tx.van_inventory_sub_users.deleteMany({
            where: { parent_id: Number(id) },
          });

          const currentSaleType =
            inventoryData.sale_type !== undefined
              ? inventoryData.sale_type
              : inv.sale_type;
          const userIds = inventoryData.sub_inventory_user_ids || [];

          if (
            currentSaleType === 'container' &&
            Array.isArray(userIds) &&
            userIds.length > 0
          ) {
            const subUsersData = userIds.map((subUserId: number) => ({
              parent_id: Number(id),
              user_id: Number(subUserId),
              createdby: userId,
              log_inst: 1,
            }));
            await tx.van_inventory_sub_users.createMany({
              data: subUsersData,
            });
          }
        }

        return tx.van_inventory.findUnique({
          where: { id: Number(id) },
          include: {
            van_inventory_users: true,
            vehicle: true,
            van_inventory_depot: true,
            van_inventory_sub_users: {
              include: {
                users: true,
              },
            },
            van_inventory_items_inventory: true,
          },
        });
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
        include: {
          van_inventory_items_inventory: true,
          van_inventory_stock_movements: true,
        },
      });

      if (!existing)
        return res.status(404).json({ message: 'Van inventory not found' });

      await prisma.$transaction(async tx => {
        if (existing.van_inventory_stock_movements?.length > 0) {
          await tx.stock_movements.deleteMany({
            where: {
              van_inventory_id: Number(id),
            },
          });
        }

        if (existing.van_inventory_items_inventory?.length > 0) {
          await tx.van_inventory_items.deleteMany({
            where: {
              parent_id: Number(id),
            },
          });
        }

        await tx.van_inventory.delete({
          where: { id: Number(id) },
        });
      });
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
          source_system: 'sfa',
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
              product_tax_master: true,
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
            data.tax_amount && data.tax_amount !== undefined
              ? Number(data.tax_amount)
              : undefined,
          total_amount:
            data.quantity && data.unit_price
              ? Number(data.quantity) * Number(data.unit_price) -
              (Number(data.discount_amount) || 0) +
              (Number(data.tax_amount) || 0)
              : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: {
          van_inventory_items_products: {
            include: {
              product_tax_master: true,
            },
          },
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
                  source_system: 'sfa',
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
      const nowStr = new Date().toISOString().split('T')[0];
      const now = new Date(`${nowStr}T00:00:00.000Z`);

      const expiryStr = new Date(batchLot.expiry_date)
        .toISOString()
        .split('T')[0];
      const expiry = new Date(`${expiryStr}T00:00:00.000Z`);

      const isExpired = expiry.getTime() < now.getTime();
      const isExpiringSoon =
        !isExpired &&
        expiry.getTime() <= now.getTime() + 30 * 24 * 60 * 60 * 1000;

      const response = {
        batch_id: batchLot.id,
        batch_number: batchLot.batch_number,
        lot_number: batchLot.lot_number,
        manufacturing_date: batchLot.manufacturing_date,
        expiry_date: batchLot.expiry_date,
        days_until_expiry: Math.floor(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
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

  async getSalespersonInventory(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const {
        page,
        limit,
        product_id,
        document_date,
        loading_type,
        include_expired_batches = 'false',
        batch_status,
        serial_status,
        time_filter,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      const processVanInventoryItems = (
        vanInventories: any[],
        salesperson: any
      ) => {
        const products: Map<number, any> = new Map();
        let totalQuantity = 0;
        let totalRemainingQuantity = 0;

        for (const vanInventory of vanInventories) {
          for (const item of vanInventory.van_inventory_items_inventory) {
            if (
              product_id &&
              item.product_id !== parseInt(product_id as string, 10)
            ) {
              continue;
            }

            const product = item.van_inventory_items_products;
            const batch = item.van_inventory_items_batch_lot;

            let batchInfo: any = null;
            if (batch) {
              const nowStr = new Date().toISOString().split('T')[0];
              const now = new Date(`${nowStr}T00:00:00.000Z`);

              const expiryStr = new Date(batch.expiry_date)
                .toISOString()
                .split('T')[0];
              const expiry = new Date(`${expiryStr}T00:00:00.000Z`);

              const isExpired = expiry.getTime() < now.getTime();
              const daysUntilExpiry = Math.floor(
                (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

              if (batch_status) {
                if (batch_status === 'active' && (isExpired || isExpiringSoon))
                  continue;
                if (batch_status === 'expiring' && !isExpiringSoon) continue;
                if (batch_status === 'expired' && !isExpired) continue;
              }

              if (include_expired_batches !== 'true' && isExpired) continue;

              const batchStatusValue = isExpired
                ? 'expired'
                : isExpiringSoon
                  ? 'expiring_soon'
                  : 'active';

              batchInfo = {
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
                is_expiring_soon: isExpiringSoon,
                days_until_expiry: daysUntilExpiry,
                status: batchStatusValue,
              };

              totalRemainingQuantity += batch.remaining_quantity || 0;
            }

            const serials =
              product?.serial_numbers_products?.map((serial: any) => {
                const warrantyExpired =
                  serial.warranty_expiry &&
                  new Date(serial.warranty_expiry) <= new Date();

                return {
                  serial_id: serial.id,
                  serial_number: serial.serial_number,
                  status: serial.status,
                  warranty_expiry: serial.warranty_expiry,
                  warranty_expired: warrantyExpired,
                  warranty_days_remaining: serial.warranty_expiry
                    ? Math.floor(
                      (new Date(serial.warranty_expiry).getTime() -
                        Date.now()) /
                      (1000 * 60 * 60 * 24)
                    )
                    : null,
                  batch_id: serial.batch_id,
                  batch: serial.batch_lots,
                  customer_id: serial.customer_id,
                  customer: serial.serial_numbers_customers,
                  sold_date: serial.sold_date,
                };
              }) || [];

            const productId = item.product_id;

            if (!products.has(productId)) {
              products.set(productId, {
                product_id: productId,
                product_name: product?.name || null,
                product_code: product?.code || null,
                product_unit_of_measurement:
                  product?.product_unit_of_measurement,
                unit_price: item.unit_price ? Number(item.unit_price) : null,
                tracking_type: product?.tracking_type || 'none',
                total_quantity: 0,
                total_remaining_quantity: 0,
                batches: [],
                serials: [],
                van_inventories: [],
                tax_details: product?.product_tax_master
                  ? {
                    id: product.product_tax_master.id,
                    name: product.product_tax_master.name,
                    code: product.product_tax_master.code,
                    tax_rate: Number(product.product_tax_master.tax_rate),
                    description: product.product_tax_master.description,
                  }
                  : null,
              });
            }

            const productData = products.get(productId)!;
            productData.total_quantity += item.quantity || 0;
            totalQuantity += item.quantity || 0;

            if (batch?.remaining_quantity) {
              productData.total_remaining_quantity += batch.remaining_quantity;
            }

            const existingVanInventory = productData.van_inventories.find(
              (vi: any) => vi.van_inventory_id === vanInventory.id
            );

            if (!existingVanInventory) {
              productData.van_inventories.push({
                van_inventory_id: vanInventory.id,
                document_date: vanInventory.document_date,
                status: vanInventory.status,
                loading_type: vanInventory.loading_type,
                location_id: vanInventory.location_id,
                location_type: vanInventory.location_type,
                vehicle_id: vanInventory.vehicle_id,
                vehicle_number: vanInventory.vehicle?.vehicle_number || null,
              });
            }

            if (batchInfo && batchInfo.remaining_quantity > 0) {
              const existingBatch = productData.batches.find(
                (b: any) => b.batch_lot_id === batchInfo!.batch_lot_id
              );
              if (!existingBatch) {
                productData.batches.push(batchInfo);
              }
            }

            for (const serial of serials) {
              const existingSerial = productData.serials.find(
                (s: any) => s.serial_id === serial.serial_id
              );
              if (!existingSerial) {
                productData.serials.push(serial);
              }
            }
          }
        }

        return {
          products: Array.from(products.values()),
          totalQuantity,
          totalRemainingQuantity,
        };
      };

      let dateFilter = {};
      if (time_filter && time_filter !== 'all') {
        const tf = getTimeFilter(time_filter as string);
        if (tf) {
          dateFilter = { document_date: tf };
        }
      } else if (document_date) {
        const date = new Date(document_date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid document_date format. Use YYYY-MM-DD',
          });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        dateFilter = {
          document_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }

      if (
        !salesperson_id ||
        salesperson_id === '' ||
        salesperson_id === 'all'
      ) {
        const allSalespersons = await prisma.users.findMany({
          where: {},
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            profile_image: true,
            user_role: {
              select: {
                name: true,
              },
            },
          },
        });

        const consolidatedSalespersons: any[] = [];
        let overallTotalQuantity = 0;
        let overallTotalRemainingQuantity = 0;
        let overallTotalProducts = new Set<number>();
        let overallTotalVanInventories = new Set<number>();
        let overallTotalBatches = 0;
        let overallTotalSerials = 0;

        for (const salesperson of allSalespersons) {
          const vanInventories = await prisma.van_inventory.findMany({
            where: {
              user_id: salesperson.id,
              is_active: 'Y',
              status: 'A',
              ...dateFilter,
            },
            select: {
              id: true,
              status: true,
              loading_type: true,
              document_date: true,
              location_id: true,
              location_type: true,
              vehicle_id: true,
              vehicle: {
                select: {
                  id: true,
                  vehicle_number: true,
                },
              },
              van_inventory_items_inventory: {
                select: {
                  id: true,
                  product_id: true,
                  quantity: true,
                  batch_lot_id: true,
                  unit_price: true,
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
                  van_inventory_items_products: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      tracking_type: true,
                      tax_id: true,

                      product_tax_master: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                          tax_rate: true,
                          description: true,
                        },
                      },
                      serial_numbers_products: {
                        where: {
                          is_active: 'Y',
                          ...(serial_status && {
                            status: serial_status as string,
                          }),
                        },
                        select: {
                          id: true,
                          serial_number: true,
                          status: true,
                          warranty_expiry: true,
                          batch_id: true,
                          customer_id: true,
                          sold_date: true,
                          batch_lots: {
                            select: {
                              id: true,
                              batch_number: true,
                              lot_number: true,
                              expiry_date: true,
                            },
                          },
                          serial_numbers_customers: {
                            select: {
                              id: true,
                              name: true,
                              code: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { document_date: 'desc' },
          });

          if (vanInventories.length === 0) continue;

          const { products, totalQuantity, totalRemainingQuantity } =
            processVanInventoryItems(vanInventories, salesperson);

          if (products.length === 0) continue;

          let totalBatches = 0;
          let totalSerials = 0;

          products.forEach((product: any) => {
            overallTotalProducts.add(product.product_id);
            totalBatches += product.batches.length;
            totalSerials += product.serials.length;
          });

          vanInventories.forEach(vi => {
            overallTotalVanInventories.add(vi.id);
          });

          overallTotalQuantity += totalQuantity;
          overallTotalRemainingQuantity += totalRemainingQuantity;
          overallTotalBatches += totalBatches;
          overallTotalSerials += totalSerials;

          consolidatedSalespersons.push({
            salesperson_id: salesperson.id,
            salesperson_name: salesperson.name,
            salesperson_email: salesperson.email,
            salesperson_phone: salesperson.phone_number,
            salesperson_profile_image: salesperson.profile_image,
            salesperson_role: salesperson.user_role.name,
            total_van_inventories: vanInventories.length,
            total_products: products.length,
            total_quantity: totalQuantity,
            total_remaining_quantity: totalRemainingQuantity,
            total_batches: totalBatches,
            total_serials: totalSerials,
          });
        }

        const startIndex = (pageNum - 1) * limitNum;
        const paginatedData = consolidatedSalespersons.slice(
          startIndex,
          startIndex + limitNum
        );

        const pagination = {
          current_page: pageNum,
          per_page: limitNum,
          total_pages: Math.ceil(consolidatedSalespersons.length / limitNum),
          total_count: consolidatedSalespersons.length,
          has_next:
            pageNum < Math.ceil(consolidatedSalespersons.length / limitNum),
          has_prev: pageNum > 1,
        };

        return res.json({
          success: true,
          message: 'All salesperson inventory data retrieved successfully',
          data: paginatedData,
          filters: {
            document_date: document_date || null,
            product_id: product_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
          statistics: {
            total_salespersons: consolidatedSalespersons.length,
            total_van_inventories: overallTotalVanInventories.size,
            total_unique_products: overallTotalProducts.size,
            total_quantity: overallTotalQuantity,
            total_remaining_quantity: overallTotalRemainingQuantity,
            total_batches: overallTotalBatches,
            total_serials: overallTotalSerials,
          },
          pagination,
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
          user_role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!salesperson) {
        return res.status(404).json({
          success: false,
          message: 'Salesperson not found',
        });
      }

      const targetSalespersonIds = await getContainerOwnerAndSelf(
        prisma,
        salespersonIdNum
      );

      const vanInventories = await prisma.van_inventory.findMany({
        where: {
          user_id: { in: targetSalespersonIds },
          is_active: 'Y',
          status: 'A',
          ...(loading_type && {
            loading_type: (loading_type as string).toUpperCase(),
          }),
          ...dateFilter,
        },
        select: {
          id: true,
          status: true,
          loading_type: true,
          document_date: true,
          location_id: true,
          location_type: true,
          vehicle_id: true,
          vehicle: {
            select: {
              id: true,
              vehicle_number: true,
            },
          },
          van_inventory_items_inventory: {
            select: {
              id: true,
              product_id: true,
              quantity: true,
              batch_lot_id: true,
              unit_price: true,
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
              van_inventory_items_products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  tracking_type: true,
                  tax_id: true,
                  product_unit_of_measurement: {
                    select: {
                      id: true,
                      name: true,
                      conversion_rate: true,
                    },
                  },
                  product_tax_master: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      tax_rate: true,
                      description: true,
                    },
                  },

                  serial_numbers_products: {
                    where: {
                      is_active: 'Y',
                      ...(serial_status && { status: serial_status as string }),
                    },
                    select: {
                      id: true,
                      serial_number: true,
                      status: true,
                      warranty_expiry: true,
                      batch_id: true,
                      customer_id: true,
                      sold_date: true,
                      batch_lots: {
                        select: {
                          id: true,
                          batch_number: true,
                          lot_number: true,
                          expiry_date: true,
                        },
                      },
                      serial_numbers_customers: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                        },
                      },
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
          message: 'No inventory found for this salesperson',
          data: {
            salesperson_id: salesperson.id,
            salesperson_name: salesperson.name,
            salesperson_email: salesperson.email,
            salesperson_phone: salesperson.phone_number,
            salesperson_profile_image: salesperson.profile_image,
            total_van_inventories: 0,
            total_products: 0,
            total_quantity: 0,
            total_remaining_quantity: 0,
            total_batches: 0,
            total_serials: 0,
            products: [],
          },
          filters: {
            document_date: document_date || null,
            product_id: product_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
        });
      }

      const { products, totalQuantity, totalRemainingQuantity } =
        processVanInventoryItems(vanInventories, salesperson);

      let totalBatches = 0;
      let totalSerials = 0;

      products.forEach((product: any) => {
        totalBatches += product.batches.length;
        totalSerials += product.serials.length;
      });

      const startIndex = (pageNum - 1) * limitNum;
      const paginatedProducts = products.slice(
        startIndex,
        startIndex + limitNum
      );

      const pagination = {
        current_page: pageNum,
        per_page: limitNum,
        total_pages: Math.ceil(products.length / limitNum),
        total_count: products.length,
        has_next: pageNum < Math.ceil(products.length / limitNum),
        has_prev: pageNum > 1,
      };

      res.json({
        success: true,
        message: 'Salesperson inventory retrieved successfully',
        data: {
          salesperson_id: salesperson.id,
          salesperson_name: salesperson.name,
          salesperson_email: salesperson.email,
          salesperson_phone: salesperson.phone_number,
          salesperson_profile_image: salesperson.profile_image,
          total_van_inventories: vanInventories.length,
          total_products: products.length,
          total_quantity: totalQuantity,
          total_remaining_quantity: totalRemainingQuantity,
          total_batches: totalBatches,
          total_serials: totalSerials,
          products: paginatedProducts,
        },
        filters: {
          document_date: document_date || null,
          product_id: product_id || null,
          loading_type: loading_type || null,
          batch_status: batch_status || null,
          serial_status: serial_status || null,
        },
        pagination,
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

  async getinventoryItemSalesperson(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const {
        page,
        limit,
        product_id,
        document_date,
        include_expired_batches = 'false',
        batch_status,
        serial_status,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      const stagedStocks = await prisma.inventory_stock.findMany({
        where: {
          is_unloadAll: 'Y',
          is_active: 'Y',
        },
        select: {
          salesperson_id: true,
          product_id: true,
          batch_id: true,
          serial_number_id: true,
        },
      });

      const stagedStocksBySalesperson = new Map<
        number,
        {
          stagedBatches: Set<number>;
          stagedSerials: Set<number>;
          stagedProductIds: Set<number>;
        }
      >();

      for (const stock of stagedStocks) {
        if (!stock.salesperson_id) continue;
        let entry = stagedStocksBySalesperson.get(stock.salesperson_id);
        if (!entry) {
          entry = {
            stagedBatches: new Set(),
            stagedSerials: new Set(),
            stagedProductIds: new Set(),
          };
          stagedStocksBySalesperson.set(stock.salesperson_id, entry);
        }
        if (stock.serial_number_id) {
          entry.stagedSerials.add(stock.serial_number_id);
        } else if (stock.batch_id) {
          entry.stagedBatches.add(stock.batch_id);
        } else {
          entry.stagedProductIds.add(stock.product_id);
        }
      }

      const processVanInventoryItems = (
        vanInventories: any[],
        currentSalespersonId: number
      ) => {
        let totalQuantity = 0;
        let totalRemainingQuantity = 0;
        const allProducts = new Set<number>();
        let totalBatches = 0;
        let totalSerials = 0;

        const processedVanInventories = vanInventories
          .map(vanInventory => {
            const products: Map<number, any> = new Map();

            // Filter items under reconciliation
            const stagedEntry =
              stagedStocksBySalesperson.get(currentSalespersonId);
            const items = vanInventory.van_inventory_items_inventory.filter(
              (it: any) => {
                if (stagedEntry) {
                  if (
                    it.serial_id &&
                    stagedEntry.stagedSerials.has(it.serial_id)
                  )
                    return false;
                  if (
                    it.batch_lot_id &&
                    stagedEntry.stagedBatches.has(it.batch_lot_id)
                  )
                    return false;
                  if (
                    !it.serial_id &&
                    !it.batch_lot_id &&
                    stagedEntry.stagedProductIds.has(it.product_id)
                  )
                    return false;
                }
                return true;
              }
            );

            for (const item of items) {
              if (
                product_id &&
                item.product_id !== parseInt(product_id as string, 10)
              ) {
                continue;
              }

              const product = item.van_inventory_items_products;
              const batch = item.van_inventory_items_batch_lot;

              const trackingType = (
                product?.tracking_type || 'none'
              ).toLowerCase();

              let shouldSkipItem = false;

              let allProductBatches: any[] = [];

              if (batch && trackingType === 'batch') {
                allProductBatches.push({
                  id: batch.id,
                  batch_lot_id: batch.id,
                  batch_number: batch.batch_number,
                  lot_number: batch.lot_number,
                  manufacturing_date: batch.manufacturing_date,
                  expiry_date: batch.expiry_date,
                  supplier_name: batch.supplier_name,
                  quality_grade: batch.quality_grade,
                  quantity: batch.quantity,
                  remaining_quantity: batch.remaining_quantity,
                  loaded_quantity: item.quantity || 0,
                });
              }

              if (shouldSkipItem) {
                continue;
              }

              // Process serials using normalized trackingType
              let serials: any[] = [];
              if (trackingType === 'serial') {
                // Only use serial directly linked to this van inventory item
                const linkedSerial = item.van_inventory_serial;

                if (linkedSerial && linkedSerial.status === 'in_van') {
                  const warrantyExpired =
                    linkedSerial.warranty_expiry &&
                    new Date(linkedSerial.warranty_expiry) <= new Date();

                  serials = [
                    {
                      serial_id: linkedSerial.id,
                      serial_number: linkedSerial.serial_number,
                      status: linkedSerial.status,
                      warranty_expiry: linkedSerial.warranty_expiry,
                      warranty_expired: warrantyExpired,
                      warranty_days_remaining: linkedSerial.warranty_expiry
                        ? Math.floor(
                          (new Date(linkedSerial.warranty_expiry).getTime() -
                            Date.now()) /
                          (1000 * 60 * 60 * 24)
                        )
                        : null,
                      customer_id: linkedSerial.customer_id,
                      customer: linkedSerial.serial_numbers_customers,
                      sold_date: linkedSerial.sold_date,
                    },
                  ];
                }
              }

              const productId = item.product_id;

              if (trackingType === 'serial' && serials.length === 0) {
                continue;
              }

              let itemQuantity = 0;
              if (trackingType === 'serial') {
                itemQuantity = item.quantity || serials.length;
              } else if (
                trackingType === 'batch' &&
                allProductBatches.length > 0
              ) {
                itemQuantity = item.quantity || 0;
              } else {
                itemQuantity = item.quantity || 0;
              }

              if (!products.has(productId)) {
                products.set(productId, {
                  product_id: productId,
                  product_name: product?.name || null,
                  product_code: product?.code || null,
                  unit_of_measurment: product.product_unit_of_measurement,
                  unit_price: product?.base_price
                    ? Number(product.base_price)
                    : null,
                  tracking_type: product?.tracking_type || 'none',
                  quantity: 0,
                  batches: [],
                  serials: [],
                  tax_details: product?.product_tax_master
                    ? {
                      id: product.product_tax_master.id,
                      name: product.product_tax_master.name,
                      code: product.product_tax_master.code,
                      tax_rate: Number(product.product_tax_master.tax_rate),
                      description: product.product_tax_master.description,
                    }
                    : null,
                });
              }

              const productData = products.get(productId)!;

              productData.quantity += itemQuantity;
              totalQuantity += itemQuantity;
              allProducts.add(productId);

              allProductBatches.forEach(batchInfo => {
                const existingBatch = productData.batches.find(
                  (b: any) => b.batch_lot_id === batchInfo.batch_lot_id
                );
                if (!existingBatch) {
                  productData.batches.push(batchInfo);
                  totalRemainingQuantity += batchInfo.remaining_quantity || 0;
                  totalBatches++;
                } else {
                  existingBatch.loaded_quantity =
                    (existingBatch.loaded_quantity || 0) +
                    (batchInfo.loaded_quantity || 0);
                }
              });

              if (serials.length > 0) {
                serials.forEach((serial: any) => {
                  if (
                    !productData.serials.find(
                      (existing: any) => existing.serial_id === serial.serial_id
                    )
                  ) {
                    productData.serials.push(serial);
                    totalSerials++;
                  }
                });
              }
            }

            // if (products.size === 0) {
            //   return null;
            // }

            // return {
            //   van_inventory_id: vanInventory.id,
            //   document_date: vanInventory.document_date,
            //   status: vanInventory.status,
            //   loading_type: vanInventory.loading_type,
            //   location_id: vanInventory.location_id,
            //   location_type: vanInventory.location_type,
            //   vehicle_id: vanInventory.vehicle_id,
            //   vehicle: vanInventory.vehicle
            //     ? {
            //         vehicle_id: vanInventory.vehicle.id,
            //         vehicle_number: vanInventory.vehicle.vehicle_number,
            //       }
            //     : null,
            //   products: Array.from(products.values()),
            // };
            return {
              van_inventory_id: vanInventory.id,
              document_date: vanInventory.document_date,
              status: vanInventory.status,
              loading_type: vanInventory.loading_type,
              location_id: vanInventory.location_id,
              location_type: vanInventory.location_type,
              vehicle_id: vanInventory.vehicle_id,
              vehicle: vanInventory.vehicle
                ? {
                  vehicle_id: vanInventory.vehicle.id,
                  vehicle_number: vanInventory.vehicle.vehicle_number,
                }
                : null,
              products: Array.from(products.values()),
            };
          })
          .filter(vanInventory => vanInventory !== null);

        return {
          vanInventories: processedVanInventories,
          totalProducts: allProducts.size,
          totalQuantity,
          totalRemainingQuantity,
          totalBatches,
          totalSerials,
        };
      };

      let dateFilter = {};
      if (document_date) {
        const date = new Date(document_date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid document_date format. Use YYYY-MM-DD',
          });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        dateFilter = {
          document_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }

      if (
        !salesperson_id ||
        salesperson_id === '' ||
        salesperson_id === 'all'
      ) {
        const allSalespersons = await prisma.users.findMany({
          where: {},
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            profile_image: true,
            user_role: {
              select: {
                name: true,
              },
            },
          },
        });

        const consolidatedSalespersons: any[] = [];

        for (const salesperson of allSalespersons) {
          const vanInventories = await prisma.van_inventory.findMany({
            where: {
              user_id: salesperson.id,
              is_active: 'Y',
              status: 'A',
              ...dateFilter,
            },
            select: {
              id: true,
              status: true,
              loading_type: true,
              document_date: true,
              location_id: true,
              location_type: true,
              vehicle_id: true,
              vehicle: {
                select: {
                  id: true,
                  vehicle_number: true,
                },
              },
              van_inventory_items_inventory: {
                select: {
                  id: true,
                  product_id: true,
                  quantity: true,
                  batch_lot_id: true,
                  serial_id: true,
                  unit_price: true,
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
                      batch_lots: {
                        select: {
                          id: true,
                          batch_number: true,
                          lot_number: true,
                          expiry_date: true,
                        },
                      },
                      serial_numbers_customers: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                        },
                      },
                    },
                  },
                  van_inventory_items_products: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      base_price: true,
                      product_unit_of_measurement: true,
                      tracking_type: true,
                      tax_id: true,
                      product_tax_master: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                          tax_rate: true,
                          description: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { document_date: 'desc' },
          });

          if (vanInventories.length === 0) continue;

          const {
            vanInventories: processedVanInventories,
            totalProducts,
            totalQuantity,
            totalRemainingQuantity,
            totalBatches,
            totalSerials,
          } = processVanInventoryItems(vanInventories, salesperson.id);

          if (processedVanInventories.length === 0) continue;

          consolidatedSalespersons.push({
            salesperson_id: salesperson.id,
            salesperson_name: salesperson.name,
            salesperson_email: salesperson.email,
            salesperson_phone: salesperson.phone_number,
            salesperson_profile_image: salesperson.profile_image,
            salesperson_role: salesperson.user_role.name,
            total_van_inventories: processedVanInventories.length,
            total_products: totalProducts,
            total_quantity: totalQuantity,
            total_remaining_quantity: totalRemainingQuantity,
            total_batches: totalBatches,
            total_serials: totalSerials,
            van_inventories: processedVanInventories,
          });
        }

        const startIndex = (pageNum - 1) * limitNum;
        const paginatedData = consolidatedSalespersons.slice(
          startIndex,
          startIndex + limitNum
        );

        const pagination = {
          current_page: pageNum,
          per_page: limitNum,
          total_pages: Math.ceil(consolidatedSalespersons.length / limitNum),
          total_count: consolidatedSalespersons.length,
          has_next:
            pageNum < Math.ceil(consolidatedSalespersons.length / limitNum),
          has_prev: pageNum > 1,
        };

        return res.json({
          success: true,
          message: 'All salesperson inventory data retrieved successfully',
          data: paginatedData,
          filters: {
            document_date: document_date || null,
            product_id: product_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
          pagination,
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
          user_role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!salesperson) {
        return res.status(404).json({
          success: false,
          message: 'Salesperson not found',
        });
      }

      const vanInventories = await prisma.van_inventory.findMany({
        where: {
          user_id: salespersonIdNum,
          is_active: 'Y',
          status: 'A',

          ...dateFilter,
        },
        select: {
          id: true,
          status: true,
          loading_type: true,
          document_date: true,
          location_id: true,
          location_type: true,
          vehicle_id: true,
          vehicle: {
            select: {
              id: true,
              vehicle_number: true,
            },
          },
          van_inventory_items_inventory: {
            select: {
              id: true,
              product_id: true,
              quantity: true,
              batch_lot_id: true,
              serial_id: true,
              unit_price: true,
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
                  batch_lots: {
                    select: {
                      id: true,
                      batch_number: true,
                      lot_number: true,
                      expiry_date: true,
                    },
                  },
                  serial_numbers_customers: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
              van_inventory_items_products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  base_price: true,
                  product_unit_of_measurement: true,
                  tracking_type: true,
                  tax_id: true,
                  product_tax_master: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      tax_rate: true,
                      description: true,
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
          message: 'No inventory found for this salesperson',
          data: {
            salesperson_id: salesperson.id,
            salesperson_name: salesperson.name,
            salesperson_email: salesperson.email,
            salesperson_phone: salesperson.phone_number,
            salesperson_role: salesperson.user_role.name,
            salesperson_profile_image: salesperson.profile_image,
            total_van_inventories: 0,
            total_products: 0,
            total_quantity: 0,
            total_remaining_quantity: 0,
            total_batches: 0,
            total_serials: 0,
            van_inventories: [],
          },
          filters: {
            document_date: document_date || null,
            product_id: product_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
        });
      }

      const {
        vanInventories: processedVanInventories,
        totalProducts,
        totalQuantity,
        totalRemainingQuantity,
        totalBatches,
        totalSerials,
      } = processVanInventoryItems(vanInventories, salespersonIdNum);

      const startIndex = (pageNum - 1) * limitNum;
      const paginatedVanInventories = processedVanInventories.slice(
        startIndex,
        startIndex + limitNum
      );

      const pagination = {
        current_page: pageNum,
        per_page: limitNum,
        total_pages: Math.ceil(processedVanInventories.length / limitNum),
        total_count: processedVanInventories.length,
        has_next:
          pageNum < Math.ceil(processedVanInventories.length / limitNum),
        has_prev: pageNum > 1,
      };

      res.json({
        success: true,
        message: 'Salesperson inventory retrieved successfully',
        data: {
          salesperson_id: salesperson.id,
          salesperson_name: salesperson.name,
          salesperson_email: salesperson.email,
          salesperson_phone: salesperson.phone_number,
          salesperson_profile_image: salesperson.profile_image,
          total_van_inventories: processedVanInventories.length,
          total_products: totalProducts,
          total_quantity: totalQuantity,
          total_remaining_quantity: totalRemainingQuantity,
          total_batches: totalBatches,
          total_serials: totalSerials,
          van_inventories: paginatedVanInventories,
        },
        filters: {
          document_date: document_date || null,
          product_id: product_id || null,
          batch_status: batch_status || null,
          serial_status: serial_status || null,
        },
        pagination,
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
  async createVanInventoryFromReconciliation(
    reconciliationId: number,
    approvedByUserId: number
  ): Promise<number | null> {
    return prisma.$transaction(
      async tx => {
        const reconciliation = await tx.reconciliation.findUnique({
          where: { id: reconciliationId },
          include: { reconciliation_items: { where: { is_active: 'Y' } } },
        });

        if (!reconciliation) {
          throw new Error(`Reconciliation ${reconciliationId} not found`);
        }
        if (reconciliation.reconciliation_items.length === 0) {
          return null;
        }

        const userIdNum = reconciliation.salesman_id;

        const vanLoc = await tx.van_inventory.findFirst({
          where: {
            user_id: userIdNum,
            is_active: 'Y',
            location_id: reconciliation.depot_id ?? undefined,
          },
          select: { location_id: true, vehicle_id: true },
        });

        const locationId = vanLoc?.location_id ?? reconciliation.depot_id;
        const vehicleId = vanLoc?.vehicle_id ?? null;

        if (!locationId) {
          throw new Error(
            `Unable to resolve location for reconciliation ${reconciliationId}`
          );
        }

        const newVanInventory = await tx.van_inventory.create({
          data: {
            user_id: userIdNum,
            location_id: locationId,
            vehicle_id: vehicleId,
            loading_type: 'U',
            approval_status: 'A',
            is_active: 'Y',
            document_date: new Date(),
            createdate: new Date(),
            createdby: approvedByUserId,
            updatedate: new Date(),
            updatedby: approvedByUserId,
            log_inst: 1,
          },
        });

        const productIds = Array.from(
          new Set(
            reconciliation.reconciliation_items
              .map(item => item.product_id)
              .filter((id): id is number => id !== null)
          )
        );

        const batchNumbers = Array.from(
          new Set(
            reconciliation.reconciliation_items
              .map(item => item.batch_number)
              .filter((bn): bn is string => bn !== null && bn !== '')
          )
        );

        const products = await tx.products.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, base_price: true },
        });
        const productMap = new Map(products.map(p => [p.id, p]));

        const batchLotsMap = new Map<string, number>();
        if (batchNumbers.length > 0) {
          const batchLots = await tx.batch_lots.findMany({
            where: {
              batch_number: { in: batchNumbers },
              productsId: { in: productIds },
            },
            select: { id: true, batch_number: true, productsId: true },
          });
          for (const b of batchLots) {
            if (b.batch_number && b.productsId) {
              batchLotsMap.set(`${b.productsId}_${b.batch_number}`, b.id);
            }
          }
        }

        // Query loaded van inventory items to get the specific batch_lot_id actually loaded in this salesperson's van
        const loadedVanItems = await tx.van_inventory_items.findMany({
          where: {
            product_id: { in: productIds },
            van_inventory_items_batch_lot: {
              batch_number: { in: batchNumbers },
            },
            van_inventory_items_inventory: {
              user_id: userIdNum,
              is_active: 'Y',
              loading_type: 'L',
            },
          },
          select: {
            product_id: true,
            batch_lot_id: true,
            van_inventory_items_batch_lot: {
              select: { batch_number: true },
            },
          },
        });

        const salespersonLoadedBatchMap = new Map<string, number>();
        for (const item of loadedVanItems) {
          const bn = item.van_inventory_items_batch_lot?.batch_number;
          if (item.product_id && bn && item.batch_lot_id) {
            salespersonLoadedBatchMap.set(
              `${item.product_id}_${bn}`,
              item.batch_lot_id
            );
          }
        }

        const itemsData: any[] = [];

        for (const item of reconciliation.reconciliation_items) {
          if (item.product_id === null) continue;

          const qty = Number(item.expected_qty) || 0;
          const baseQty = Number((item as any).expected_base_qty) || 0;
          if (qty <= 0 && baseQty <= 0) continue;

          const product = productMap.get(item.product_id);
          let batchLotId: number | null = null;
          if (item.batch_number) {
            batchLotId =
              salespersonLoadedBatchMap.get(
                `${item.product_id}_${item.batch_number}`
              ) ?? null;

            if (!batchLotId) {
              batchLotId =
                batchLotsMap.get(`${item.product_id}_${item.batch_number}`) ??
                null;
            }
          }

          itemsData.push({
            parent_id: newVanInventory.id,
            product_id: item.product_id,
            batch_lot_id: batchLotId,
            serial_id: null,
            quantity: qty,
            source_system: 'sfa',
            base_quantity: baseQty,
            product_name: product?.name ?? null,
            unit: null,
            unit_price: product?.base_price || 0,
            discount_amount: 0,
            tax_amount: 0,
            total_amount: qty * Number(product?.base_price || 0),
            notes: `Unloaded via reconciliation #${reconciliationId} approval`,
          });
        }

        if (itemsData.length > 0) {
          await tx.van_inventory_items.createMany({ data: itemsData });
        }

        return newVanInventory.id;
      },
      {
        maxWait: 30000,
        timeout: 90000,
      }
    );
  },

  async unloadVanInventory(req: Request, res: Response) {
    try {
      const loggedInUserId = (req as any).user?.id;
      const targetUserId = req.body.user_id || loggedInUserId;

      if (!targetUserId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated or token invalid',
        });
      }

      const userIdNum = parseInt(targetUserId.toString(), 10);

      const vanLocations = await prisma.van_inventory.findMany({
        where: { user_id: userIdNum, is_active: 'Y' },
        select: { location_id: true, vehicle_id: true },
        distinct: ['location_id'],
      });

      if (vanLocations.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No active van inventory found for authenticated user',
        });
      }

      let totalItemsRequested = 0;
      const reconciliationIds: number[] = [];
      const errors: string[] = [];

      for (const vanLoc of vanLocations) {
        const locationId = vanLoc.location_id;
        if (!locationId) continue;

        try {
          const reconciliationId = await prisma.$transaction(async tx => {
            const stockToUnload = await tx.inventory_stock.findMany({
              where: {
                location_id: locationId,
                salesperson_id: userIdNum,
                is_active: 'Y',
                AND: [
                  {
                    // Include null records (legacy) so they are captured and zeroed out
                    OR: [{ is_unloadAll: 'N' }, { is_unloadAll: null }],
                  },
                  {
                    OR: [
                      { current_stock: { gt: 0 } },
                      { base_quantity: { gt: 0 } },
                    ],
                  },
                ],
              },
              include: {
                inventory_stock_products: {
                  include: {
                    product_tax_master: { select: { tax_rate: true } },
                    product_unit_of_measurement: {
                      select: { conversion_rate: true },
                    },
                  },
                },
                inventory_stock_batch: true,
              },
            });

            if (stockToUnload.length === 0) return null;

            const user = await tx.users.findUnique({
              where: { id: userIdNum },
              select: {
                id: true,
                name: true,
                employee_id: true,
                depot_id: true,
                sap_code: true,
              },
            });
            if (!user) return null;

            const now = new Date();
            const today = new Date(
              Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
            );

            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Find the last reconciliation to avoid duplicate records if multiple unloads happen in a day
            const lastReconciliation = await tx.reconciliation.findFirst({
              where: {
                salesman_id: userIdNum,
                // Only look for previous reconciliations
                createdate: { lt: todayEnd },
              },
              orderBy: { createdate: 'desc' },
            });

            let sessionStart = todayStart;
            if (
              lastReconciliation &&
              lastReconciliation.createdate &&
              lastReconciliation.createdate > todayStart
            ) {
              sessionStart = lastReconciliation.createdate;
            }
            const sessionEnd = todayEnd;

            const productMap = new Map<
              string,
              {
                product_id: number;
                product_code: string;
                total_qty: number;
                total_base_qty: number;
                batch_number: string | null;
                price: number;
                taxRate: number;
                convRate: number;
              }
            >();

            for (const stock of stockToUnload) {
              if (stock.product_id === null) continue;
              const qty = Number(stock.current_stock) || 0;
              const baseQty = Number(stock.base_quantity) || 0;
              if (qty <= 0 && baseQty <= 0) continue;

              const batchNum =
                stock.inventory_stock_batch?.batch_number ?? null;
              const productCode =
                stock.inventory_stock_products?.code ||
                String(stock.product_id);
              const key = `${stock.product_id}-${batchNum}`;

              const price =
                Number(stock.inventory_stock_products?.base_price) || 0;
              const taxRate =
                Number(
                  (stock.inventory_stock_products as any)?.product_tax_master
                    ?.tax_rate
                ) || 0;
              const convRate =
                Number(
                  (stock.inventory_stock_products as any)
                    ?.product_unit_of_measurement?.conversion_rate
                ) || 1;

              const existing = productMap.get(key);
              if (existing) {
                existing.total_qty += qty;
                existing.total_base_qty += baseQty;
              } else {
                productMap.set(key, {
                  product_id: stock.product_id,
                  product_code: productCode,
                  total_qty: qty,
                  total_base_qty: baseQty,
                  batch_number: batchNum,
                  price,
                  taxRate,
                  convRate,
                });
              }
              totalItemsRequested++;
            }

            if (productMap.size === 0) return null;

            const loadQtyRecords = await tx.van_inventory_items.findMany({
              where: {
                van_inventory_items_inventory: {
                  user_id: userIdNum,
                  loading_type: 'L',
                  status: 'A',
                  createdate: { gte: todayStart, lt: todayEnd },
                },
              },
              include: {
                van_inventory_items_batch_lot: {
                  select: { batch_number: true },
                },
              },
            });

            const loadQtyMap = new Map<
              string,
              { qty: number; baseQty: number }
            >();
            for (const record of loadQtyRecords) {
              const batchNum =
                record.van_inventory_items_batch_lot?.batch_number || '';
              const key = `${record.product_id}-${batchNum}`;
              const current = loadQtyMap.get(key) || { qty: 0, baseQty: 0 };
              loadQtyMap.set(key, {
                qty: current.qty + (record.quantity || 0),
                baseQty: current.baseQty + (record.base_quantity || 0),
              });
            }

            const saleQtyRecords = await tx.stock_movements.findMany({
              where: {
                OR: [
                  { createdby: userIdNum },
                  { from_location_id: locationId },
                ],
                movement_type: 'SALE',
                movement_date: { gte: todayStart, lte: todayEnd },
                is_active: 'Y',
                product_id: {
                  in: Array.from(productMap.values()).map(p => p.product_id),
                },
              },
              include: {
                batch_lots: { select: { batch_number: true } },
              },
            });

            const saleQtyMap = new Map<
              string,
              { qty: number; baseQty: number }
            >();
            for (const record of saleQtyRecords) {
              const batchNum = record.batch_lots?.batch_number || '';
              const key = `${record.product_id}-${batchNum}`;
              const current = saleQtyMap.get(key) || { qty: 0, baseQty: 0 };
              saleQtyMap.set(key, {
                qty: current.qty + (record.quantity || 0),
                baseQty: current.baseQty + ((record as any).base_quantity || 0),
              });
            }

            const recon = await tx.reconciliation.create({
              data: {
                salesman_id: userIdNum,
                depot_id: user.depot_id ?? locationId,
                status: 'P',
                reconciliation_date: today,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userIdNum,
              },
            });

            const toCreate: any[] = [];
            for (const p of productMap.values()) {
              // expected_qty is the real current stock on hand (from inventory_stock).
              // Using load - sale here inflates the value when multiple loads occur in a day.
              const expectedQty = p.total_qty;
              const expectedBaseQty = p.total_base_qty;

              // Keep load_qty and sale_qty for audit/reference only
              const loadQty =
                loadQtyMap.get(`${p.product_id}-${p.batch_number || ''}`)
                  ?.qty || 0;
              const loadBaseQty =
                loadQtyMap.get(`${p.product_id}-${p.batch_number || ''}`)
                  ?.baseQty || 0;

              const saleQty =
                saleQtyMap.get(`${p.product_id}-${p.batch_number || ''}`)
                  ?.qty || 0;
              const saleBaseQty =
                saleQtyMap.get(`${p.product_id}-${p.batch_number || ''}`)
                  ?.baseQty || 0;

              const convRate = p.convRate > 0 ? p.convRate : 1;
              const unitPricePerPc = p.convRate > 0 ? p.price / p.convRate : 0;
              const saleVal = saleQty * p.price + saleBaseQty * unitPricePerPc;
              const taxAmount = (saleVal * p.taxRate) / 100;

              toCreate.push({
                reconciliation_id: recon.id,
                product_id: p.product_id,
                batch_number: p.batch_number,
                expected_qty: expectedQty,
                expected_base_qty: expectedBaseQty,
                actual_qty: null,
                actual_base_qty: 0,
                load_qty: loadQty,
                load_base_qty: loadBaseQty,
                sale_qty: saleQty,
                sale_base_qty: saleBaseQty,
                variance: null,
                variance_base_qty: 0,
                tax_amount: taxAmount,
                resolution_action: 'Awaiting Verification',
                default_outlet_posting_qty: 0,
                unload_adjustment_qty: 0,
                stock_key: `${user.sap_code ?? user.id} | ${p.product_code} | ${p.batch_number}`,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userIdNum,
              });
            }

            if (toCreate.length > 0) {
              await tx.reconciliation_items.createMany({ data: toCreate });
            }

            await tx.inventory_stock.updateMany({
              where: {
                location_id: locationId,
                salesperson_id: userIdNum,
                is_active: 'Y',
                OR: [{ is_unloadAll: 'N' }, { is_unloadAll: null }],
              },
              data: {
                is_unloadAll: 'Y',
                // Zero stock immediately so stale records never inflate future reconciliation totals.
                // Multiple inventory_stock rows for the same product+batch get summed in productMap,
                // so any non-zero 'Y' row would be incorrectly added to the next session's expected qty.
                current_stock: 0,
                available_stock: 0,
                base_quantity: 0,
              },
            });

            return recon.id;
          });

          if (reconciliationId) reconciliationIds.push(reconciliationId);
        } catch (vanLocError: any) {
          console.error(
            `Failed to process location ${locationId}:`,
            vanLocError
          );
          errors.push(`Location ${locationId}: ${vanLocError.message}`);
        }
      }

      return res.json({
        success: true,
        message:
          'Stock staged for reconciliation. Save the reconciliation to submit for unload approval.',
        data: {
          user_id: userIdNum,
          reconciliation_ids: reconciliationIds,
          total_items_requested: totalItemsRequested,
          request_date: new Date(),
          errors: errors.length ? errors : undefined,
        },
      });
    } catch (error: any) {
      console.error('Unload Van Inventory Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to stage unload reconciliation',
        error: error.message,
      });
    }
  },
  async getProducts(req: Request, res: Response) {
    try {
      const { salesperson_id, customer_id, depot_id, route_id } = req.query;

      if (!salesperson_id) {
        return res.status(400).json({
          success: false,
          message: 'salesperson_id is required',
        });
      }

      let context = {};
      let source = 'DEFAULT';

      if (customer_id) {
        const customer = await prisma.customers.findUnique({
          where: { id: Number(customer_id) },
          select: {
            id: true,
            name: true,
            code: true,
            depot_id: true,
            route_id: true,
          },
        });

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: 'Customer not found',
          });
        }

        context = {
          type: 'CUSTOMER',
          customer: customer,
        };
        source = 'CUSTOMER';
      } else if (depot_id) {
        const depot = await prisma.depots.findUnique({
          where: { id: Number(depot_id) },
          select: { id: true, name: true, code: true },
        });

        if (!depot) {
          return res.status(404).json({
            success: false,
            message: 'Depot not found',
          });
        }

        context = {
          type: 'DEPOT',
          depot: depot,
        };
        source = 'DEPOT';
      } else if (route_id) {
        const route = await prisma.routes.findUnique({
          where: { id: Number(route_id) },
          select: { id: true, name: true },
        });

        if (!route) {
          return res.status(404).json({
            success: false,
            message: 'Route not found',
          });
        }

        const customers = await prisma.customers.findMany({
          where: { route_id: Number(route_id) },
          select: { id: true, name: true, code: true, depot_id: true },
        });

        context = {
          type: 'ROUTE',
          route: route,
          customers: customers,
        };
        source = 'ROUTE';
      } else {
        context = {
          type: 'DEFAULT',
          message: 'Showing all available products for salesperson',
        };
        source = 'DEFAULT';
      }

      let vanInventory;

      if (depot_id) {
        vanInventory = await prisma.van_inventory.findFirst({
          where: {
            user_id: Number(salesperson_id),
            location_id: Number(depot_id),
            status: 'A',
          },
          orderBy: { document_date: 'desc' },
          include: {
            van_inventory_items_inventory: {
              include: {
                van_inventory_items_products: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    category_id: true,
                    unit_of_measurement: true,
                    tracking_type: true,
                  },
                },
              },
            },
            van_inventory_depot: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        });
      } else {
        vanInventory = await prisma.van_inventory.findFirst({
          where: {
            user_id: Number(salesperson_id),
            status: 'A',
          },
          orderBy: { document_date: 'desc' },
          include: {
            van_inventory_items_inventory: {
              include: {
                van_inventory_items_products: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    category_id: true,
                    unit_of_measurement: true,
                    tracking_type: true,
                  },
                },
              },
            },
            van_inventory_depot: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        });
      }

      if (!vanInventory) {
        return res.status(404).json({
          success: false,
          message: 'Van inventory not found for salesperson',
        });
      }

      const availableProducts =
        vanInventory.van_inventory_items_inventory.filter(item => {
          return item.quantity > 0;
        });

      res.json({
        success: true,
        message: `${source} products retrieved successfully`,
        data: {
          context: context,
          van_inventory: {
            id: vanInventory.id,
            depot: vanInventory.van_inventory_depot,
            document_date: vanInventory.document_date,
          },
          products: availableProducts.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product: item.van_inventory_items_products,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit: item.unit,
            source: source,
          })),
        },
      });
    } catch (error: any) {
      console.error('Get Products Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
