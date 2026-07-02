import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';
import logger from '../../configs/logger';
import { createRequest } from './requests.controller';
import { isAdminRole } from '../../configs/permissions.config';

const resolveStatusFilter = (status: string) => {
  if (status === 'Pending')
    return { in: ['Awaiting Verification', 'Awaiting Force-Push'] };
  if (status === 'Matched' || status === 'CLEAN') return 'CLEAN';
  if (status === 'Short' || status === 'Post to Default Outlet')
    return 'Post to Default Outlet';
  if (status === 'Excess' || status === 'Adjust Unload Upward')
    return 'Adjust Unload Upward';
  if (status === 'Blocked' || status === 'Blocked - Force-Push Required')
    return 'Awaiting Force-Push';
  return undefined;
};

export const reconciliationController = {
  /**
   * List all reconciliations — one row per salesman load.
   * Returns reconciliation header data only (no item details).
   */
  getAllReconciliations: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search ? String(req.query.search).trim() : '';
      const salesmanId = req.query.salesman_id
        ? Number(req.query.salesman_id)
        : null;
      const depotId = req.query.depot_id ? Number(req.query.depot_id) : null;
      const date = req.query.date ? String(req.query.date).trim() : '';
      const status = req.query.status ? String(req.query.status).trim() : '';

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

      const reconcFilters: any = { is_active: 'Y' };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          reconcFilters.salesman = {
            ...reconcFilters.salesman,
            users_depots_users: {
              some: {
                depot_id: { in: depotIds },
              },
            },
          };
        } else {
          reconcFilters.id = -1;
        }
      }
      if (salesmanId) reconcFilters.salesman_id = salesmanId;
      if (depotId) reconcFilters.depot_id = depotId;
      if (date) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) reconcFilters.reconciliation_date = d;
      }
      if (search) {
        reconcFilters.salesman = { name: { contains: search } };
      }
      if (status && status !== 'all') {
        reconcFilters.reconciliation_items = {
          some: {
            resolution_action: resolveStatusFilter(status),

            is_active: 'Y',
          },
        };
      }

      const matchingReconcIds = await prisma.reconciliation.findMany({
        where: reconcFilters,
        select: { id: true },
      });
      const ids = matchingReconcIds.map((r: { id: number }) => r.id);

      const itemStatsFilter: any = {
        reconciliation_id: { in: ids },
        is_active: 'Y',
      };
      if (status && status !== 'all') {
        itemStatsFilter.resolution_action = resolveStatusFilter(status);
      }

      const allStatsItems = await prisma.reconciliation_items.findMany({
        where: itemStatsFilter,
        select: {
          expected_qty: true,
          actual_qty: true,
          default_outlet_posting_qty: true,
          unload_adjustment_qty: true,
          resolution_action: true,
        },
      });

      let totalExpected = 0,
        totalActual = 0,
        totalDefaultOutlet = 0,
        totalUnloadAdjustment = 0,
        totalPending = 0;
      for (const item of allStatsItems) {
        totalExpected += Number(item.expected_qty) || 0;
        totalActual += Number(item.actual_qty) || 0;
        totalDefaultOutlet += Number(item.default_outlet_posting_qty) || 0;
        totalUnloadAdjustment += Number(item.unload_adjustment_qty) || 0;
        if (
          item.resolution_action === 'Awaiting Verification' ||
          item.resolution_action === 'Awaiting Force-Push'
        ) {
          totalPending++;
        }
      }

      const { data, pagination } = await paginate<any>({
        model: prisma.reconciliation,
        filters: reconcFilters,
        page,
        limit,
        include: {
          salesman: {
            select: {
              id: true,
              name: true,
              employee_id: true,
              email: true,
              sap_code: true,
            },
          },
          depot: { select: { id: true, name: true, code: true } },
          reconciliation_items: {
            where: { is_active: 'Y' },
            select: { id: true, resolution_action: true, actual_qty: true },
          },
        },
        orderBy: { id: 'asc' },
      });

      const serializedData = data.map((rec: any) => {
        const items: any[] = rec.reconciliation_items ?? [];
        const totalItems = items.length;
        const pendingItems = items.filter(
          (i: any) => i.resolution_action !== 'CLEAN'
        ).length;
        const matchedItems = items.filter(
          (i: any) => i.resolution_action === 'CLEAN'
        ).length;
        const varianceItems = totalItems - matchedItems;

        let overallStatus = 'Pending';
        if (totalItems > 0 && matchedItems === totalItems) {
          overallStatus = 'Matched';
        } else if (totalItems > 0 && pendingItems === 0) {
          overallStatus = 'Variance';
        }

        return {
          id: rec.id,
          salesman_id: rec.salesman?.id,
          salesmanName: rec.salesman?.name || 'UNMAPPED',
          salesmanSapCode: rec.salesman?.sap_code || 'UNMAPPED',
          salesmanEmail: rec.salesman?.email || '',
          depot: rec.depot?.code || 'UNMAPPED',
          depot_id: rec.depot?.id || null,
          depotName: rec.depot?.name || 'UNMAPPED',
          reconciliation_date: rec.reconciliation_date,
          status: rec.status || 'P',
          totalItems,
          pendingItems,
          matchedItems,
          varianceItems,
          overallStatus: rec.status,
          createdate: rec.createdate,
        };
      });

      res.json({
        success: true,
        message: 'Reconciliations retrieved successfully',
        data: serializedData,
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats: {
          expected: totalExpected,
          actual: totalActual,
          default_outlet: totalDefaultOutlet,
          unload_adjustment: totalUnloadAdjustment,
          pending: totalPending,
        },
      });
    } catch (error: any) {
      logger.error('Get Reconciliations Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve reconciliations',
      });
    }
  },

  /**
   * Get loaded products (items) for a specific reconciliation by ID.
   */
  getReconciliationById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid reconciliation ID' });
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

      const whereClause: any = { id };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          whereClause.salesman = {
            ...whereClause.salesman,
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

      const reconciliation = await prisma.reconciliation.findFirst({
        where: whereClause,
        include: {
          salesman: {
            select: {
              id: true,
              name: true,
              employee_id: true,
              email: true,
              sap_code: true,
            },
          },
          depot: { select: { id: true, name: true, code: true } },
          reconciliation_items: {
            where: { is_active: 'Y' },
            include: {
              product: {
                select: { id: true, name: true, code: true, base_price: true },
              },
            },
            orderBy: { id: 'asc' },
          },
        },
      });

      if (!reconciliation) {
        return res.status(200).json({
          success: true,
          message: 'Reconciliation fetched successfully',
          data: [],
          meta: {},
        });
      }

      const items = (reconciliation.reconciliation_items ?? []).map(
        (item: any) => ({
          id: item.id,
          reconciliation_id: reconciliation.id,
          salesman_id: reconciliation.salesman?.id,
          salesmanName: reconciliation.salesman?.name || 'UNMAPPED',
          salesmanSapCode: reconciliation.salesman?.employee_id || 'UNMAPPED',
          depot: reconciliation.depot?.code || 'UNMAPPED',
          depot_id: reconciliation.depot?.id || null,
          product_id: item.product_id,
          skuCode: item.product?.code || 'UNKNOWN',
          skuName: item.product?.name || 'UNKNOWN',
          batchNumber: item.batch_number || '-',
          expectedRop: Number(item.expected_qty) || 0,
          actualRop:
            item.actual_qty !== null ? Number(item.actual_qty).toString() : '',
          variance: item.variance !== null ? Number(item.variance) : null,
          resolutionAction: item.resolution_action || 'Awaiting Verification',
          defaultOutletPostingQty: Number(item.default_outlet_posting_qty) || 0,
          unloadAdjustmentQty: Number(item.unload_adjustment_qty) || 0,
          stockKey: item.stock_key || '',
          status:
            item.resolution_action === 'Awaiting Force-Push'
              ? 'Blocked - Force-Push Required'
              : item.actual_qty === null
                ? 'Pending Verification'
                : Number(item.variance) === 0
                  ? 'Matched'
                  : Number(item.variance) > 0
                    ? 'Short'
                    : 'Excess',
          createdate: item.createdate,
        })
      );

      res.json({
        success: true,
        message: 'Reconciliation items retrieved successfully',
        data: items,
        meta: {
          reconciliation_id: reconciliation.id,
          salesman: reconciliation.salesman
            ? {
                ...reconciliation.salesman,
                sap_code: reconciliation.salesman.sap_code,
              }
            : null,
          depot: reconciliation.depot,
          reconciliation_date: reconciliation.reconciliation_date,
          total_items: items.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Get Reconciliation By ID Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve reconciliation',
      });
    }
  },

  /**
   * Save and reconcile updated actual quantity values
   */
  saveReconciliations: async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      const userId = (req as any).user?.id || 1;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required and must not be empty.',
        });
      }

      logger.info(
        `Starting saveReconciliations transaction for ${items.length} items...`
      );

      const results = await prisma.$transaction(async tx => {
        const updatedItems = [];
        const reconciliationIds = new Set<number>();

        for (const itemPayload of items) {
          const { id, actual_qty } = itemPayload;
          const parsedActual =
            actual_qty !== null && actual_qty !== ''
              ? Number(actual_qty)
              : null;

          const record = await tx.reconciliation_items.findUnique({
            where: { id },
            include: {
              reconciliation: { include: { salesman: true, depot: true } },
            },
          });

          if (!record) {
            throw new Error(`Reconciliation item with ID ${id} not found.`);
          }

          if (record.reconciliation?.salesman?.employee_id === 'MOS100801') {
            logger.warn(`Skipping blocked salesman update for item ID ${id}`);
            continue;
          }

          let variance: number | null = null;
          let resAction = 'Awaiting Verification';
          const expectedQty = Number(record.expected_qty) || 0;

          if (parsedActual !== null) {
            variance = expectedQty - parsedActual;
            if (Math.abs(variance) < 0.0001) {
              variance = 0;
              resAction = 'CLEAN';
            } else if (variance > 0) {
              resAction = 'Post to Default Outlet';
            } else {
              resAction = 'Adjust Unload Upward';
            }
          }

          const defaultOutletPostingQty =
            resAction === 'Post to Default Outlet' && variance !== null
              ? variance
              : 0;
          const unloadAdjustmentQty =
            resAction === 'Adjust Unload Upward' && variance !== null
              ? -variance
              : 0;

          const updatedItem = await tx.reconciliation_items.update({
            where: { id },
            data: {
              actual_qty: parsedActual,
              variance,
              resolution_action: resAction,
              default_outlet_posting_qty: defaultOutletPostingQty,
              unload_adjustment_qty: unloadAdjustmentQty,
              updatedate: new Date(),
              updatedby: userId,
            },
          });

          const reconciliationId = record.reconciliation?.id;
          if (reconciliationId) {
            reconciliationIds.add(reconciliationId);
          }

          updatedItems.push({
            ...updatedItem,
            reconciliation_id: reconciliationId,
          });
        }

        if (reconciliationIds.size > 0) {
          await Promise.all(
            Array.from(reconciliationIds).map(reconciliationId =>
              tx.reconciliation.update({
                where: { id: reconciliationId },
                data: {
                  status: 'P',
                  updatedate: new Date(),
                  updatedby: userId,
                },
              })
            )
          );
        }

        return updatedItems;
      });

      const reconciliationIds = Array.from(
        new Set(results.map((item: any) => item.reconciliation_id))
      );

      const requestResults = [];

      for (const reconciliationId of reconciliationIds) {
        const existingRequest = await prisma.sfa_d_requests.findFirst({
          where: {
            request_type: 'RECONCILIATION_APPROVAL',
            reference_id: reconciliationId,
            status: 'P',
          },
        });

        if (existingRequest) {
          requestResults.push({
            request_id: existingRequest.id,
            status: existingRequest.status,
            request_type: existingRequest.request_type,
            reference_id: existingRequest.reference_id,
          });
          continue;
        }

        const reconciliationItems = results
          .filter((item: any) => item.reconciliation_id === reconciliationId)
          .map((item: any) => ({
            id: item.id,
            actual_qty: item.actual_qty,
          }));

        const createdRequest = await createRequest({
          requester_id: userId,
          request_type: 'RECONCILIATION_APPROVAL',
          reference_id: reconciliationId,
          request_data: JSON.stringify({
            reconciliation_items: reconciliationItems,
          }),
          createdby: userId,
          log_inst: 1,
        });

        requestResults.push({
          request_id: createdRequest.id,
          status: createdRequest.status,
          request_type: createdRequest.request_type,
          reference_id: createdRequest.reference_id,
        });
      }

      res.json({
        success: true,
        message: 'Reconciliation data saved successfully',
        data: results,
        approval_requests: requestResults,
      });
    } catch (error: any) {
      logger.error('Save Reconciliations Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save reconciliation data',
      });
    }
  },
};
