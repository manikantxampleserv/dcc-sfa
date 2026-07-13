import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { getContainerOwnerAndSelf } from '../utils/inventory.utils';
import { isAdminRole } from '../../configs/permissions.config';

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
  async getSalespersonInventory(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const { page, limit, product_id, batch_status, serial_status, depot_id } =
        req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

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

      const user = (req as any).user;
      let isScopeRestricted = false;
      let depotIds: number[] = [];

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

      const spWhere: any = { id: salespersonIdNum };
      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          spWhere.users_depots_users = {
            some: {
              depot_id: { in: depotIds },
            },
          };
        } else {
          spWhere.id = -1;
        }
      }

      const salesperson = await prisma.users.findFirst({
        where: spWhere,
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          profile_image: true,
          address: true,
          user_role: { select: { name: true } },
        },
      });

      if (!salesperson) {
        return res
          .status(404)
          .json({ success: false, message: 'Salesperson not found' });
      }

      const targetSalespersonIds = await getContainerOwnerAndSelf(
        prisma,
        salespersonIdNum
      );

      const totalVanInventories = await prisma.van_inventory.count({
        where: {
          user_id: { in: targetSalespersonIds },
          is_active: 'Y',
        },
      });

      let parsedDepotId: number | null = null;
      if (depot_id) {
        parsedDepotId = parseInt(depot_id as string, 10);
      }

      const stockWhere: any = {
        OR: [
          { salesperson_id: { in: targetSalespersonIds } },
          { createdby: salespersonIdNum },
        ],
        is_active: 'Y',
      };
      if (parsedDepotId) {
        stockWhere.location_id = parsedDepotId;
      }
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
            total_base_quantity: 0,
            total_remaining_base_quantity: 0,
            batches: [],
            serials: [],
            van_inventories: [],
          });
        }

        const productData = productsMap.get(productId)!;

        const qty = Number(stock.current_stock) || 0;
        const baseQty = Number(stock.base_quantity) || 0;
        productData.total_quantity += qty;
        productData.total_remaining_quantity += qty;
        productData.total_base_quantity += baseQty;
        productData.total_remaining_base_quantity += baseQty;

        if (batch) {
          const batchStatusValue = getBatchStatus(batch.expiry_date);

          if (batch_status) {
            if (batch_status === 'active' && batchStatusValue !== 'active') {
            } else if (
              batch_status === 'expiring_soon' &&
              batchStatusValue !== 'expiring_soon'
            ) {
            } else if (
              batch_status === 'expired' &&
              batchStatusValue !== 'expired'
            ) {
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
                base_quantity: stock.base_quantity,
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

      const products = Array.from(productsMap.values())
        .map(p => {
          p.batches = p.batches.filter(
            (b: any) =>
              (Number(b.remaining_quantity) || 0) > 0 ||
              (Number(b.base_quantity) || 0) > 0
          );
          return p;
        })
        .filter(
          p =>
            (Number(p.total_remaining_quantity) || 0) > 0 ||
            (Number(p.total_remaining_base_quantity) || 0) > 0
        );

      let totalBatches = 0;
      let totalSerials = 0;
      let totalRemainingQty = 0;
      let totalRemainingBaseQty = 0;

      products.forEach(p => {
        totalBatches += p.batches.length;
        totalSerials += p.serials.length;
        totalRemainingQty += p.total_remaining_quantity;
        totalRemainingBaseQty += p.total_remaining_base_quantity;
      });

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
          salesperson_role: salesperson.user_role?.name || 'Unknown',
          salesperson_email: salesperson.email,
          salesperson_phone: salesperson.phone_number,
          salesperson_profile_image: salesperson.profile_image,
          salesperson_address: salesperson.address,
          combined_salesperson_ids: targetSalespersonIds,
          total_van_inventories: totalVanInventories,
          total_products: products.length,
          total_quantity: totalRemainingQty,
          total_remaining_quantity: totalRemainingQty,
          total_base_quantity: totalRemainingBaseQty,
          total_remaining_base_quantity: totalRemainingBaseQty,
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

async function handleAllSalespersons(
  req: Request,
  res: Response,
  pageNum: number,
  limitNum: number
) {
  const { product_id, batch_status, serial_status, depot_id, supervisor_id } =
    req.query;

  const usersWhere: any = {
    user_role: {
      OR: [
        { name: { contains: 'Salesman' } },
        { name: { contains: 'salesman' } },
        { name: { contains: 'Sales Person' } },
        { name: { contains: 'sales person' } },
        { name: { contains: 'Sales Man' } },
        { name: { contains: 'sales man' } },
      ],
    },
  };
  if (supervisor_id) {
    usersWhere.reporting_to = parseInt(supervisor_id as string, 10);
  }

  const user = (req as any).user;
  let isScopeRestricted = false;
  let depotIds: number[] = [];

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

  if (isScopeRestricted) {
    if (depotIds.length > 0) {
      usersWhere.users_depots_users = {
        some: {
          depot_id: { in: depotIds },
        },
      };
    } else {
      usersWhere.id = -1;
    }
  }

  const allSalespersons = await prisma.users.findMany({
    where: usersWhere,
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      profile_image: true,
      address: true,
      user_role: { select: { name: true } },
    },
  });

  const consolidated: any[] = [];
  let overallTotalQty = 0;
  let overallProducts = new Set<number>();
  let overallVanInventories = 0;
  let overallBatches = 0;
  let overallSerials = 0;

  let parsedDepotId: number | null = null;
  if (depot_id) {
    parsedDepotId = parseInt(depot_id as string, 10);
  }
  for (const sp of allSalespersons) {
    const targetSalespersonIds = await getContainerOwnerAndSelf(prisma, sp.id);

    const stockWhere: any = {
      OR: [
        { salesperson_id: { in: targetSalespersonIds } },
        { createdby: sp.id },
      ],
      is_active: 'Y',
    };
    if (parsedDepotId) {
      stockWhere.location_id = parsedDepotId;
    }
    if (product_id) stockWhere.product_id = parseInt(product_id as string, 10);

    const vanInventoriesCount = await prisma.van_inventory.count({
      where: { user_id: { in: targetSalespersonIds }, is_active: 'Y' },
    });

    const stockRecords = await prisma.inventory_stock.findMany({
      where: stockWhere,
      select: {
        product_id: true,
        current_stock: true,
        base_quantity: true,
        batch_id: true,
        serial_number_id: true,
      },
    });

    if (stockRecords.length === 0) continue;

    const productStockMap = new Map<number, number>();
    const productBaseStockMap = new Map<number, number>();
    const batchIds = new Set<number>();
    const serialIds = new Set<number>();

    for (const s of stockRecords) {
      const qty = Number(s.current_stock) || 0;
      const baseQty = Number(s.base_quantity) || 0;
      if (qty <= 0 && baseQty <= 0) continue;
      productStockMap.set(
        s.product_id,
        (productStockMap.get(s.product_id) || 0) + qty
      );
      productBaseStockMap.set(
        s.product_id,
        (productBaseStockMap.get(s.product_id) || 0) + baseQty
      );
      if (s.batch_id) batchIds.add(s.batch_id);
      if (s.serial_number_id) serialIds.add(s.serial_number_id);
    }

    const totalQty = Array.from(productStockMap.values()).reduce(
      (a, b) => a + b,
      0
    );
    const totalBaseQty = Array.from(productBaseStockMap.values()).reduce(
      (a, b) => a + b,
      0
    );

    productStockMap.forEach((_, pid) => overallProducts.add(pid));
    overallTotalQty += totalQty;
    overallVanInventories += vanInventoriesCount;
    overallBatches += batchIds.size;
    overallSerials += serialIds.size;

    consolidated.push({
      salesperson_id: sp.id,
      salesperson_name: sp.name,
      salesperson_email: sp.email,
      salesperson_phone: sp.phone_number,
      salesperson_profile_image: sp.profile_image,
      salesperson_address: sp.address,
      total_van_inventories: vanInventoriesCount,
      total_products: productStockMap.size,
      total_quantity: totalQty,
      total_base_quantity: totalBaseQty,
      total_remaining_quantity: totalQty,
      total_batches: batchIds.size,
      total_serials: serialIds.size,
    });
  }

  consolidated.sort((a, b) => b.total_quantity - a.total_quantity);

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

interface SalespersonData {
  id: number;
  name: string;
  email: string | null;
  phone_number: string | null;
  profile_image: string | null;
  address: string | null;
  user_role: {
    name: string;
  } | null;
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

  const nowStr = new Date().toISOString().split('T')[0];
  const now = new Date(`${nowStr}T00:00:00.000Z`);

  const expiryStr = new Date(expiryDate).toISOString().split('T')[0];
  const expiry = new Date(`${expiryStr}T00:00:00.000Z`);

  if (expiry.getTime() < now.getTime()) return 'expired';

  const days = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 30) return 'expiring_soon';
  return 'active';
}

function daysUntilExpiry(expiryDate: Date | null | undefined): number {
  if (!expiryDate) return 0;

  const nowStr = new Date().toISOString().split('T')[0];
  const now = new Date(`${nowStr}T00:00:00.000Z`);

  const expiryStr = new Date(expiryDate).toISOString().split('T')[0];
  const expiry = new Date(`${expiryStr}T00:00:00.000Z`);

  return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function upsertBatch(batches: any[], batchInfo: any) {
  const existing = batches.find(b => b.batch_lot_id === batchInfo.batch_lot_id);
  if (existing) {
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
