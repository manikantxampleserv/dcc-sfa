import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

/**
 * Salesperson Stock Controller
 *
 * This controller replaces the old getSalespersonInventory method in
 * vanInventory.controller.ts with one that reads from inventory_stock —
 * the single source of truth for current hand stock quantities.
 *
 * Flow:
 *  1. Find the salesperson's van location_id(s) from van_inventory (is_active='Y')
 *  2. Query inventory_stock for those location IDs
 *  3. Group by product_id, sum current_stock
 *  4. Attach batch & serial info
 *  5. Return response matching SingleSalespersonResponse / AllSalespersonsResponse shape
 */

export const salespersonStockController = {
  /** GET /inventory-item-salesperson/:salesperson_id */
  async getSalespersonInventory(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const { page, limit, product_id, batch_status, serial_status } =
        req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      // ── Handle "all salespersons" case ────────────────────────────────────
      if (
        !salesperson_id ||
        salesperson_id === '' ||
        salesperson_id === 'all'
      ) {
        return await handleAllSalespersons(req, res, pageNum, limitNum);
      }

      const salespersonIdNum = parseInt(salesperson_id as string, 10);
      if (isNaN(salespersonIdNum)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid salesperson_id' });
      }

      // ── Fetch salesperson user record ─────────────────────────────────────
      const salesperson = await prisma.users.findUnique({
        where: { id: salespersonIdNum },
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          profile_image: true,
          user_role: { select: { name: true } },
        },
      });

      if (!salesperson) {
        return res
          .status(404)
          .json({ success: false, message: 'Salesperson not found' });
      }

      // ── Fetch the van location IDs for this salesperson ───────────────────
      const vanLocations = await prisma.van_inventory.findMany({
        where: { user_id: salespersonIdNum, is_active: 'Y' },
        select: { location_id: true },
        distinct: ['location_id'],
      });

      const locationIds = vanLocations
        .map(v => v.location_id)
        .filter((id): id is number => id !== null && id !== undefined);

      if (locationIds.length === 0) {
        return res.json({
          success: true,
          message: 'No inventory found for this salesperson',
          data: buildEmptyResponse(salesperson),
          filters: {
            product_id: product_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
          pagination: buildPagination(pageNum, limitNum, 0),
        });
      }

      // ── Query inventory_stock for those locations ──────────────────────────
      const stockWhere: any = {
        location_id: { in: locationIds },
        is_active: 'Y',
      };
      if (product_id) {
        stockWhere.product_id = parseInt(product_id as string, 10);
      }

      const stockRecords = await prisma.inventory_stock.findMany({
        where: stockWhere,
        include: {
          inventory_stock_products: {
            select: {
              id: true,
              name: true,
              code: true,
              tracking_type: true,
              product_unit_of_measurement: {
                select: { id: true, name: true, conversion_rate: true },
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
                  ...(serial_status ? { status: serial_status as string } : {}),
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
                    select: { id: true, name: true, code: true },
                  },
                },
              },
            },
          },
          inventory_stock_batch: {
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
          inventory_stock_serial: {
            select: {
              id: true,
              serial_number: true,
              status: true,
              warranty_expiry: true,
              batch_id: true,
              customer_id: true,
              sold_date: true,
              serial_numbers_customers: {
                select: { id: true, name: true, code: true },
              },
              batch_lots: {
                select: {
                  id: true,
                  batch_number: true,
                  lot_number: true,
                  expiry_date: true,
                },
              },
            },
          },
        },
      });

      // ── Aggregate by product_id ───────────────────────────────────────────
      const productsMap = new Map<number, any>();

      for (const stock of stockRecords) {
        const productId = stock.product_id;
        const product = stock.inventory_stock_products;
        const batch = stock.inventory_stock_batch;
        const serial = stock.inventory_stock_serial;

        if (!productsMap.has(productId)) {
          productsMap.set(productId, {
            product_id: productId,
            product_name: product?.name || null,
            product_code: product?.code || null,
            tracking_type: product?.tracking_type || 'none',
            unit_price: null,
            product_unit_of_measurement:
              product?.product_unit_of_measurement || null,
            tax_details: product?.product_tax_master
              ? {
                  id: product.product_tax_master.id,
                  name: product.product_tax_master.name,
                  code: product.product_tax_master.code,
                  tax_rate: Number(product.product_tax_master.tax_rate),
                  description: product.product_tax_master.description,
                }
              : null,
            total_quantity: 0,
            total_remaining_quantity: 0,
            batches: [],
            serials: [],
            van_inventories: [],
          });
        }

        const productData = productsMap.get(productId)!;

        // Sum current_stock as the hand stock quantity
        const qty = Number(stock.current_stock) || 0;
        productData.total_quantity += qty;
        productData.total_remaining_quantity += qty;

        // Attach batch info if present
        if (batch) {
          const batchStatusValue = getBatchStatus(batch.expiry_date);

          // Apply batch_status filter if provided
          if (batch_status) {
            if (batch_status === 'active' && batchStatusValue !== 'active') {
              // Skip – but still count the stock quantity above
            } else if (
              batch_status === 'expiring_soon' &&
              batchStatusValue !== 'expiring_soon'
            ) {
              // Skip
            } else if (
              batch_status === 'expired' &&
              batchStatusValue !== 'expired'
            ) {
              // Skip
            } else {
              upsertBatch(productData.batches, {
                batch_lot_id: batch.id,
                batch_number: batch.batch_number,
                lot_number: batch.lot_number,
                manufacturing_date: batch.manufacturing_date,
                expiry_date: batch.expiry_date,
                supplier_name: batch.supplier_name,
                quality_grade: batch.quality_grade,
                total_quantity: Number(batch.quantity) || 0,
                remaining_quantity: qty, // use inventory_stock's current_stock
                base_quantity: stock.base_quantity, // use inventory_stock's current_stock
                is_expired: batchStatusValue === 'expired',
                is_expiring_soon: batchStatusValue === 'expiring_soon',
                days_until_expiry: daysUntilExpiry(batch.expiry_date),
                status: batchStatusValue,
              });
            }
          } else {
            upsertBatch(productData.batches, {
              batch_lot_id: batch.id,
              batch_number: batch.batch_number,
              lot_number: batch.lot_number,
              manufacturing_date: batch.manufacturing_date,
              expiry_date: batch.expiry_date,
              supplier_name: batch.supplier_name,
              quality_grade: batch.quality_grade,
              total_quantity: Number(batch.quantity) || 0,
              remaining_quantity: qty,
              base_quantity: stock.base_quantity || 0,
              is_expired: batchStatusValue === 'expired',
              is_expiring_soon: batchStatusValue === 'expiring_soon',
              days_until_expiry: daysUntilExpiry(batch.expiry_date),
              status: batchStatusValue,
            });
          }
        }

        // Attach serial info if present (from inventory_stock_serial relation)
        if (serial) {
          upsertSerial(productData.serials, {
            serial_id: serial.id,
            serial_number: serial.serial_number,
            status: serial.status,
            warranty_expiry: serial.warranty_expiry,
            warranty_expired: serial.warranty_expiry
              ? new Date(serial.warranty_expiry) <= new Date()
              : false,
            warranty_days_remaining: serial.warranty_expiry
              ? Math.floor(
                  (new Date(serial.warranty_expiry).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null,
            batch_id: serial.batch_id,
            batch: serial.batch_lots,
            customer_id: serial.customer_id,
            customer: serial.serial_numbers_customers,
            sold_date: serial.sold_date,
          });
        }

        // Also include serials attached to the product itself (via serial_numbers_products)
        if (product?.serial_numbers_products?.length) {
          for (const sn of product.serial_numbers_products) {
            upsertSerial(productData.serials, {
              serial_id: sn.id,
              serial_number: sn.serial_number,
              status: sn.status,
              warranty_expiry: sn.warranty_expiry,
              warranty_expired: sn.warranty_expiry
                ? new Date(sn.warranty_expiry) <= new Date()
                : false,
              warranty_days_remaining: sn.warranty_expiry
                ? Math.floor(
                    (new Date(sn.warranty_expiry).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null,
              batch_id: sn.batch_id,
              batch: sn.batch_lots,
              customer_id: sn.customer_id,
              customer: sn.serial_numbers_customers,
              sold_date: sn.sold_date,
            });
          }
        }
      }

      const products = Array.from(productsMap.values());

      let totalBatches = 0;
      let totalSerials = 0;
      let totalRemainingQty = 0;

      products.forEach(p => {
        totalBatches += p.batches.length;
        totalSerials += p.serials.length;
        totalRemainingQty += p.total_remaining_quantity;
      });

      // Paginate products
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedProducts = products.slice(
        startIndex,
        startIndex + limitNum
      );

      return res.json({
        success: true,
        message: 'Salesperson inventory retrieved successfully',
        data: {
          salesperson_id: salesperson.id,
          salesperson_name: salesperson.name,
          salesperson_email: salesperson.email,
          salesperson_phone: salesperson.phone_number,
          salesperson_profile_image: salesperson.profile_image,
          total_van_inventories: locationIds.length,
          total_products: products.length,
          total_quantity: totalRemainingQty,
          total_remaining_quantity: totalRemainingQty,
          total_batches: totalBatches,
          total_serials: totalSerials,
          products: paginatedProducts,
        },
        filters: {
          product_id: product_id || null,
          batch_status: batch_status || null,
          serial_status: serial_status || null,
        },
        pagination: buildPagination(pageNum, limitNum, products.length),
      });
    } catch (error: any) {
      console.error(
        'salespersonStockController.getSalespersonInventory error:',
        error
      );
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve salesperson inventory',
        error: error.message,
      });
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleAllSalespersons(
  req: Request,
  res: Response,
  pageNum: number,
  limitNum: number
) {
  const { product_id, batch_status, serial_status } = req.query;

  const allSalespersons = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      profile_image: true,
      user_role: { select: { name: true } },
    },
  });

  const consolidated: any[] = [];
  let overallTotalQty = 0;
  let overallProducts = new Set<number>();
  let overallVanInventories = 0;
  let overallBatches = 0;
  let overallSerials = 0;

  for (const sp of allSalespersons) {
    const vanLocations = await prisma.van_inventory.findMany({
      where: { user_id: sp.id, is_active: 'Y' },
      select: { location_id: true },
      distinct: ['location_id'],
    });

    const locationIds = vanLocations
      .map(v => v.location_id)
      .filter((id): id is number => id !== null && id !== undefined);

    if (locationIds.length === 0) continue;

    const stockWhere: any = {
      location_id: { in: locationIds },
      is_active: 'Y',
    };
    if (product_id) stockWhere.product_id = parseInt(product_id as string, 10);

    const stockRecords = await prisma.inventory_stock.findMany({
      where: stockWhere,
      select: {
        product_id: true,
        current_stock: true,
        batch_id: true,
        serial_number_id: true,
      },
    });

    if (stockRecords.length === 0) continue;

    // Aggregate per product
    const productStockMap = new Map<number, number>();
    const batchIds = new Set<number>();
    const serialIds = new Set<number>();

    for (const s of stockRecords) {
      const qty = Number(s.current_stock) || 0;
      productStockMap.set(
        s.product_id,
        (productStockMap.get(s.product_id) || 0) + qty
      );
      if (s.batch_id) batchIds.add(s.batch_id);
      if (s.serial_number_id) serialIds.add(s.serial_number_id);
    }

    const totalQty = Array.from(productStockMap.values()).reduce(
      (a, b) => a + b,
      0
    );

    productStockMap.forEach((_, pid) => overallProducts.add(pid));
    overallTotalQty += totalQty;
    overallVanInventories += locationIds.length;
    overallBatches += batchIds.size;
    overallSerials += serialIds.size;

    consolidated.push({
      salesperson_id: sp.id,
      salesperson_name: sp.name,
      salesperson_email: sp.email,
      salesperson_phone: sp.phone_number,
      salesperson_profile_image: sp.profile_image,
      total_van_inventories: locationIds.length,
      total_products: productStockMap.size,
      total_quantity: totalQty,
      total_remaining_quantity: totalQty,
      total_batches: batchIds.size,
      total_serials: serialIds.size,
    });
  }

  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = consolidated.slice(startIndex, startIndex + limitNum);

  return res.json({
    success: true,
    message: 'All salesperson inventory data retrieved successfully',
    data: paginatedData,
    filters: {
      product_id: product_id || null,
      batch_status: batch_status || null,
      serial_status: serial_status || null,
    },
    statistics: {
      total_salespersons: consolidated.length,
      total_van_inventories: overallVanInventories,
      total_unique_products: overallProducts.size,
      total_quantity: overallTotalQty,
      total_remaining_quantity: overallTotalQty,
      total_batches: overallBatches,
      total_serials: overallSerials,
    },
    pagination: buildPagination(pageNum, limitNum, consolidated.length),
  });
}

function buildEmptyResponse(salesperson: any) {
  return {
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
  };
}

function buildPagination(page: number, limit: number, total: number) {
  return {
    current_page: page,
    per_page: limit,
    total_pages: Math.ceil(total / limit) || 0,
    total_count: total,
    has_next: page < Math.ceil(total / limit),
    has_prev: page > 1,
  };
}

function getBatchStatus(expiryDate: Date | null | undefined): string {
  if (!expiryDate) return 'active';
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (expiry <= now) return 'expired';
  const days = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 30) return 'expiring_soon';
  return 'active';
}

function daysUntilExpiry(expiryDate: Date | null | undefined): number {
  if (!expiryDate) return 0;
  return Math.floor(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function upsertBatch(batches: any[], batchInfo: any) {
  const existing = batches.find(b => b.batch_lot_id === batchInfo.batch_lot_id);
  if (existing) {
    // Accumulate remaining_quantity across multiple stock records for the same batch
    existing.remaining_quantity += batchInfo.remaining_quantity;
  } else {
    batches.push(batchInfo);
  }
}

function upsertSerial(serials: any[], serialInfo: any) {
  if (!serials.find(s => s.serial_id === serialInfo.serial_id)) {
    serials.push(serialInfo);
  }
}
