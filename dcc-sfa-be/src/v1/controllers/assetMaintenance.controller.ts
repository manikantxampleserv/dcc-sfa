import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { logAssetActivity } from '../../utils/assetActivity.util';

/**
 * @interface AssetMaintenanceSerialized
 * Defines the comprehensive shape of an asset maintenance ticket for web and mobile.
 */
interface AssetMaintenanceSerialized {
  id: number;
  job_number: string;
  asset_id: number;
  technician_id?: number | null;
  maintenance_date: Date;
  status: string;
  priority: string;
  due_date: Date | null;
  repair_location: string;
  issue_reported?: string | null;
  action_taken?: string | null;
  cost?: number | null;
  labour_cost?: number | null;
  status_after_repair?: string | null;
  source_type?: string | null;
  source_id?: number | null;
  source_code?: string | null;
  secondary_source_code?: string | null;
  repaired_date?: Date | null;
  closed_date?: Date | null;
  escalated_to?: string | null;
  warranty_claim: boolean;
  remarks?: string | null;
  is_active: string;
  is_overdue: boolean;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer?: {
    id: number;
    name: string;
    code: string;
  } | null;
  asset_maintenance_master?: {
    id: number;
    name: string;
    code: string;
    serial_number: string;
    barcode?: string | null;
    current_location?: string | null;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
    asset_master_outlet?: {
      id: number;
      name: string;
      code: string;
    } | null;
    asset_master_depot?: {
      id: number;
      name: string;
    } | null;
    cooler_asset_master?: Array<{
      coolers_customers?: {
        id: number;
        name: string;
        code: string;
      } | null;
    }>;
  } | null;
  asset_maintenance_technician?: {
    id: number;
    name: string;
    email: string;
    employee_id?: string | null;
    sap_code?: string | null;
    profile_image: string | null;
  } | null;
  spares?: Array<{
    id: number;
    name: string;
    quantity: number;
    unit_cost: number;
    cost: number;
  }>;
  replace_review?: {
    shouldReview: boolean;
    repairCount: number;
    message: string | null;
  };
}

/**
 * Generates the next sequential maintenance ticket code (e.g. MT-00418).
 *
 * @returns {Promise<string>} Next formatted job number.
 */
async function generateJobNumber(): Promise<string> {
  const count = await prisma.asset_maintenance.count();
  const nextNum = count + 1;
  return `MT-${String(nextNum).padStart(5, '0')}`;
}

/**
 * Calculates due date based on SLA priority.
 * High: 2 days, Medium: 5 days, Low: 10 days.
 *
 * @param {string} priority - Ticket priority level.
 * @returns {Date} Calculated due date.
 */
function calculateDueDate(priority: string = 'medium'): Date {
  const d = new Date();
  const days =
    priority.toLowerCase() === 'high'
      ? 2
      : priority.toLowerCase() === 'low'
        ? 10
        : 5;
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Checks if an asset has 2 or more repairs in the past 90 days.
 *
 * @param {number} assetId - The asset ID.
 * @returns {Promise<{ shouldReview: boolean; repairCount: number; message: string | null }>}
 */
async function checkReplaceReview(assetId: number) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const repairCount = await prisma.asset_maintenance.count({
    where: {
      asset_id: assetId,
      createdate: { gte: ninetyDaysAgo },
      is_active: 'Y',
    },
  });

  if (repairCount >= 2) {
    return {
      shouldReview: true,
      repairCount,
      message: `Replace-or-repair review: ${repairCount} repair jobs in 90 days. Consider replacing instead of repairing again.`,
    };
  }

  return { shouldReview: false, repairCount, message: null };
}

/**
 * Serializes raw Prisma asset maintenance model into standard client payload.
 *
 * @param {any} m - Raw database record.
 * @param {any} replaceReview - Optional replace review object.
 * @returns {AssetMaintenanceSerialized} Serialized maintenance ticket.
 */
const serializeAssetMaintenance = (
  m: any,
  replaceReview?: any,
  resolvedCustomer?: any
): AssetMaintenanceSerialized => {
  const isOverdue =
    m.status !== 'closed' &&
    Boolean(m.due_date && new Date() > new Date(m.due_date));

  const customerObj =
    resolvedCustomer ||
    m.customer ||
    m.asset_maintenance_master?.asset_master_outlet ||
    m.asset_maintenance_master?.cooler_asset_master?.[0]?.coolers_customers ||
    null;

  return {
    id: m.id,
    job_number: m.job_number || `MT-${String(m.id).padStart(5, '0')}`,
    asset_id: m.asset_id,
    technician_id: m.technician_id ? Number(m.technician_id) : null,
    maintenance_date: m.maintenance_date,
    status: (m.status || 'open').toLowerCase(),
    priority: (m.priority || 'medium').toLowerCase(),
    due_date: m.due_date,
    repair_location: m.repair_location || 'onsite',
    issue_reported: m.issue_reported,
    action_taken: m.action_taken,
    cost: m.cost ? Number(m.cost) : 0,
    labour_cost: m.labour_cost ? Number(m.labour_cost) : 0,
    status_after_repair: m.status_after_repair,
    source_type: m.source_type,
    source_id: m.source_id,
    source_code: m.source_code,
    secondary_source_code: m.secondary_source_code,
    repaired_date: m.repaired_date,
    closed_date: m.closed_date,
    escalated_to: m.escalated_to,
    warranty_claim: Boolean(m.warranty_claim),
    remarks: m.remarks,
    is_active: m.is_active,
    is_overdue: isOverdue,
    createdate: m.createdate,
    createdby: m.createdby,
    updatedate: m.updatedate,
    updatedby: m.updatedby,
    log_inst: m.log_inst,
    customer: customerObj
      ? {
          id: customerObj.id,
          name: customerObj.name,
          code: customerObj.code,
        }
      : null,
    spares: Array.isArray(m.spares)
      ? m.spares.map((s: any) => ({
          id: s.id,
          name: s.name,
          quantity: Number(s.quantity) || 1,
          unit_cost: Number(s.unit_cost) || 0,
          cost: Number(s.cost) || 0,
        }))
      : [],
    asset_maintenance_master: m.asset_maintenance_master
      ? {
          id: m.asset_maintenance_master.id,
          name: m.asset_maintenance_master.name,
          code: m.asset_maintenance_master.code,
          serial_number: m.asset_maintenance_master.serial_number,
          barcode: m.asset_maintenance_master.barcode,
          current_location: m.asset_maintenance_master.current_location,
          asset_master_asset_types: m.asset_maintenance_master
            .asset_master_asset_types
            ? {
                id: m.asset_maintenance_master.asset_master_asset_types.id,
                name: m.asset_maintenance_master.asset_master_asset_types.name,
              }
            : null,
          asset_master_outlet: customerObj
            ? {
                id: customerObj.id,
                name: customerObj.name,
                code: customerObj.code,
              }
            : null,
          asset_master_depot: m.asset_maintenance_master.asset_master_depot
            ? {
                id: m.asset_maintenance_master.asset_master_depot.id,
                name: m.asset_maintenance_master.asset_master_depot.name,
              }
            : null,
        }
      : null,
    asset_maintenance_technician: m.asset_maintenance_technician
      ? {
          id: m.asset_maintenance_technician.id,
          name: m.asset_maintenance_technician.name,
          email: m.asset_maintenance_technician.email,
          employee_id: m.asset_maintenance_technician.employee_id,
          sap_code: m.asset_maintenance_technician.sap_code,
          profile_image: m.asset_maintenance_technician.profile_image,
        }
      : null,
    replace_review: replaceReview || undefined,
  };
};

export const assetMaintenanceController = {
  /**
   * Creates a new maintenance ticket and logs the event to asset_activities.
   */
  async createAssetMaintenance(req: any, res: Response) {
    try {
      const { spares, labour_cost, ...maintenanceData } = req.body;

      if (!maintenanceData.asset_id || !maintenanceData.maintenance_date) {
        return res.status(400).json({
          message: 'asset_id and maintenance_date are required',
        });
      }

      const asset = await prisma.asset_master.findUnique({
        where: { id: Number(maintenanceData.asset_id) },
        include: {
          asset_master_outlet: true,
          asset_master_depot: true,
        },
      });

      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      const jobNumber =
        maintenanceData.job_number || (await generateJobNumber());
      const priority = (maintenanceData.priority || 'medium').toLowerCase();
      const dueDate = maintenanceData.due_date
        ? new Date(maintenanceData.due_date)
        : calculateDueDate(priority);

      const parsedLabour = Math.max(0, Number(labour_cost) || 0);

      const sparesToCreate =
        Array.isArray(spares) && spares.length > 0
          ? spares
              .filter(
                (s: any) => s && typeof s.name === 'string' && s.name.trim()
              )
              .map((s: any) => {
                const qty = Math.max(1, Number(s.quantity) || 1);
                const unitCost = Math.max(
                  0,
                  Number(s.unit_cost) || Number(s.cost) || 0
                );
                return {
                  name: s.name.trim(),
                  quantity: qty,
                  unit_cost: unitCost,
                  cost: qty * unitCost,
                  createdby: req.user?.id || 1,
                };
              })
          : [];

      const partsTotal = sparesToCreate.reduce(
        (sum: number, p: any) => sum + Number(p.cost),
        0
      );
      const totalCost = partsTotal + parsedLabour;

      const initialStatus =
        maintenanceData.status ||
        (maintenanceData.technician_id ? 'assigned' : 'open');

      const record = await prisma.asset_maintenance.create({
        data: {
          asset_id: Number(maintenanceData.asset_id),
          technician_id: maintenanceData.technician_id
            ? Number(maintenanceData.technician_id)
            : null,
          maintenance_date: new Date(maintenanceData.maintenance_date),
          job_number: jobNumber,
          status: initialStatus,
          priority,
          due_date: dueDate,
          repair_location: maintenanceData.repair_location || 'onsite',
          issue_reported: maintenanceData.issue_reported || null,
          action_taken: maintenanceData.action_taken || null,
          source_type: maintenanceData.source_type || 'manual',
          source_id: maintenanceData.source_id
            ? Number(maintenanceData.source_id)
            : null,
          source_code: maintenanceData.source_code || null,
          secondary_source_code: maintenanceData.secondary_source_code || null,
          labour_cost: parsedLabour,
          cost: totalCost,
          remarks: maintenanceData.remarks || null,
          warranty_claim: Boolean(maintenanceData.warranty_claim),
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: maintenanceData.log_inst || 1,
          ...(sparesToCreate.length > 0
            ? {
                spares: {
                  create: sparesToCreate,
                },
              }
            : {}),
        },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
              asset_master_outlet: {
                select: { id: true, name: true, code: true },
              },
              asset_master_depot: {
                select: { id: true, name: true },
              },
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      /** Log event to asset_activities timeline for Cooler 360 */
      await logAssetActivity({
        assetId: record.asset_id,
        eventType: 'maintenance',
        title: `Ticket ${record.job_number} opened`,
        description: `${record.repair_location === 'onsite' ? 'On site' : 'Workshop'} · ${record.issue_reported || 'Maintenance request'}`,
        status: record.status,
        locationName:
          asset.asset_master_outlet?.name || asset.current_location || 'Depot',
        customerId: asset.outlet_id || null,
        depotId: asset.depot_id || null,
        performedBy: req.user?.id || 1,
        sourceTable: 'asset_maintenance',
        sourceId: record.id,
        meta: {
          job_number: record.job_number,
          priority: record.priority,
          due_date: record.due_date,
        },
      });

      const replaceReview = await checkReplaceReview(record.asset_id);

      res.status(201).json({
        message: 'Asset maintenance record created successfully',
        data: serializeAssetMaintenance(record, replaceReview),
      });
    } catch (error: any) {
      console.error('Create Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Retrieves paginated maintenance tickets with dashboard summary counts.
   */
  async getAllAssetMaintenance(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        status,
        priority,
        asset_id,
        overdue,
        technician_id,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        is_active: 'Y',
        ...(asset_id && { asset_id: Number(asset_id) }),
        ...(technician_id &&
          technician_id !== 'all' && { technician_id: Number(technician_id) }),
        ...(priority && { priority: (priority as string).toLowerCase() }),
        ...(statusLower && statusLower !== 'all' && { status: statusLower }),
        ...(overdue === 'true' && {
          status: { not: 'closed' },
          due_date: { lt: new Date() },
        }),
        ...(search && {
          OR: [
            { job_number: { contains: searchLower } },
            { issue_reported: { contains: searchLower } },
            { action_taken: { contains: searchLower } },
            { source_code: { contains: searchLower } },
            {
              asset_maintenance_technician: {
                name: { contains: searchLower },
              },
            },
            {
              asset_maintenance_master: {
                OR: [
                  { name: { contains: searchLower } },
                  { serial_number: { contains: searchLower } },
                  { code: { contains: searchLower } },
                  { barcode: { contains: searchLower } },
                ],
              },
            },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_maintenance,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
              asset_master_outlet: {
                select: { id: true, name: true, code: true },
              },
              asset_master_depot: {
                select: { id: true, name: true },
              },
              cooler_asset_master: {
                select: {
                  coolers_customers: {
                    select: { id: true, name: true, code: true },
                  },
                },
              },
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      /** Batch-lookup customer_assets for any assets without a direct outlet or cooler linkage */
      const missingOutletSerials = data
        .filter((m: any) => {
          const master = m.asset_maintenance_master;
          return (
            master &&
            !master.asset_master_outlet &&
            !master.cooler_asset_master?.[0]?.coolers_customers &&
            master.serial_number
          );
        })
        .map((m: any) => m.asset_maintenance_master.serial_number);

      const customerAssetsMap = new Map<string, any>();
      if (missingOutletSerials.length > 0) {
        const foundAssets = await prisma.customer_assets.findMany({
          where: {
            serial_number: { in: missingOutletSerials },
          },
          include: {
            customer_assets_customers: {
              select: { id: true, name: true, code: true },
            },
          },
        });
        foundAssets.forEach((ca: any) => {
          if (ca.serial_number && ca.customer_assets_customers) {
            customerAssetsMap.set(
              ca.serial_number,
              ca.customer_assets_customers
            );
          }
        });
      }

      const now = new Date();

      /** Compute summary counts for the top dashboard cards */
      const [totalRecords, openJobs, overdueJobs, closedJobs, newComplaints] =
        await Promise.all([
          prisma.asset_maintenance.count({ where: { is_active: 'Y' } }),
          prisma.asset_maintenance.count({
            where: { is_active: 'Y', status: { in: ['open', 'assigned'] } },
          }),
          prisma.asset_maintenance.count({
            where: {
              is_active: 'Y',
              status: { not: 'closed' },
              due_date: { lt: now },
            },
          }),
          prisma.asset_maintenance.count({
            where: { is_active: 'Y', status: 'closed' },
          }),
          prisma.customer_complaints.count({
            where: { status: 'P' },
          }),
        ]);

      const serializedData = data.map((m: any) => {
        const master = m.asset_maintenance_master;
        const fallbackCustomer = master?.serial_number
          ? customerAssetsMap.get(master.serial_number)
          : null;
        return serializeAssetMaintenance(m, undefined, fallbackCustomer);
      });

      res.success(
        'Asset maintenance records retrieved successfully',
        serializedData,
        200,
        pagination,
        {
          total_records: totalRecords,
          open_jobs: openJobs,
          overdue_jobs: overdueJobs,
          closed_jobs: closedJobs,
          new_complaints: newComplaints,
        }
      );
    } catch (error: any) {
      console.error('Get Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Retrieves single maintenance ticket by ID with replace review check.
   */
  async getAssetMaintenanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
              asset_master_outlet: {
                select: { id: true, name: true, code: true },
              },
              asset_master_depot: {
                select: { id: true, name: true },
              },
              cooler_asset_master: {
                select: {
                  coolers_customers: {
                    select: { id: true, name: true, code: true },
                  },
                },
              },
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      if (!record) {
        return res.status(404).json({ message: 'Asset maintenance not found' });
      }

      let fallbackCustomer: any = null;
      const master = record.asset_maintenance_master;
      if (
        master &&
        !master.asset_master_outlet &&
        !master.cooler_asset_master?.[0]?.coolers_customers &&
        master.serial_number
      ) {
        const found = await prisma.customer_assets.findFirst({
          where: { serial_number: master.serial_number },
          include: {
            customer_assets_customers: {
              select: { id: true, name: true, code: true },
            },
          },
        });
        if (found?.customer_assets_customers) {
          fallbackCustomer = found.customer_assets_customers;
        }
      }

      const replaceReview = await checkReplaceReview(record.asset_id);

      res.json({
        message: 'Asset maintenance fetched successfully',
        data: serializeAssetMaintenance(
          record,
          replaceReview,
          fallbackCustomer
        ),
      });
    } catch (error: any) {
      console.error('Get Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Updates an existing maintenance record.
   */
  async updateAssetMaintenance(req: any, res: any) {
    try {
      const { id } = req.params;
      const maintenanceId = Number(id);

      const existing = await prisma.asset_maintenance.findUnique({
        where: { id: maintenanceId },
        include: { spares: true },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Asset maintenance not found' });
      }

      const { spares, labour_cost, ...updateData } = req.body;

      const updated = await prisma.$transaction(async (tx: any) => {
        let partsTotal = 0;

        if (spares !== undefined) {
          await tx.asset_maintenance_spares.deleteMany({
            where: { asset_maintenance_id: maintenanceId },
          });

          if (Array.isArray(spares) && spares.length > 0) {
            const sparesToCreate = spares
              .filter(
                (s: any) => s && typeof s.name === 'string' && s.name.trim()
              )
              .map((s: any) => {
                const qty = Math.max(1, Number(s.quantity) || 1);
                const unitCost = Math.max(
                  0,
                  Number(s.unit_cost) || Number(s.cost) || 0
                );
                return {
                  asset_maintenance_id: maintenanceId,
                  name: s.name.trim(),
                  quantity: qty,
                  unit_cost: unitCost,
                  cost: qty * unitCost,
                  createdby: req.user?.id || 1,
                };
              });

            if (sparesToCreate.length > 0) {
              await tx.asset_maintenance_spares.createMany({
                data: sparesToCreate,
              });
              partsTotal = sparesToCreate.reduce(
                (sum: number, p: any) => sum + Number(p.cost),
                0
              );
            }
          }
        } else {
          partsTotal = (existing.spares || []).reduce(
            (sum: number, p: any) => sum + Number(p.cost),
            0
          );
        }

        const effectiveLabour =
          labour_cost !== undefined
            ? Math.max(0, Number(labour_cost) || 0)
            : Number(existing.labour_cost || 0);

        const newTotalCost = partsTotal + effectiveLabour;

        return tx.asset_maintenance.update({
          where: { id: maintenanceId },
          data: {
            ...updateData,
            ...(updateData.technician_id !== undefined
              ? {
                  technician_id: updateData.technician_id
                    ? Number(updateData.technician_id)
                    : null,
                }
              : {}),
            labour_cost: effectiveLabour,
            cost: newTotalCost,
            ...(updateData.priority && !updateData.due_date
              ? { due_date: calculateDueDate(updateData.priority) }
              : {}),
            ...(updateData.due_date
              ? { due_date: new Date(updateData.due_date) }
              : {}),
            ...(updateData.maintenance_date
              ? { maintenance_date: new Date(updateData.maintenance_date) }
              : {}),
            ...((updateData.status && String(updateData.status).toLowerCase() === 'repaired')
              ? {
                  status: 'repaired',
                  repaired_date: updateData.repaired_date
                    ? new Date(updateData.repaired_date)
                    : new Date(),
                  status_after_repair:
                    updateData.status_after_repair ||
                    existing.status_after_repair ||
                    'working',
                }
              : {}),
            ...((updateData.status && String(updateData.status).toLowerCase() === 'closed')
              ? {
                  status: 'closed',
                  closed_date: updateData.closed_date
                    ? new Date(updateData.closed_date)
                    : new Date(),
                }
              : {}),
            ...(updateData.repair_photos && typeof updateData.repair_photos !== 'string'
              ? { repair_photos: JSON.stringify(updateData.repair_photos) }
              : {}),
            updatedby: req.user?.id || 1,
            updatedate: new Date(),
          },
          include: {
            asset_maintenance_master: {
              include: {
                asset_master_asset_types: {
                  select: { id: true, name: true },
                },
                asset_master_outlet: {
                  select: { id: true, name: true, code: true },
                },
                asset_master_depot: {
                  select: { id: true, name: true },
                },
                cooler_asset_master: {
                  select: { id: true },
                },
              },
            },
            asset_maintenance_technician: true,
            spares: true,
          },
        });
      });

      /** Detect status transition and log corresponding timeline activity */
      const prevStatus = (existing.status || 'open').toLowerCase();
      const newStatus = (updated.status || 'open').toLowerCase();
      const statusChanged = prevStatus !== newStatus;

      if (newStatus === 'repaired' && (statusChanged || updateData.status)) {
        const statusAfterRepair =
          updated.status_after_repair ||
          updateData.status_after_repair ||
          'working';

        /** When repaired and in working condition, synchronize asset and cooler status */
        if (statusAfterRepair === 'working') {
          await prisma.asset_master.update({
            where: { id: updated.asset_id },
            data: { current_status: 'working' },
          });

          await prisma.coolers.updateMany({
            where: { asset_master_id: updated.asset_id },
            data: { status: 'working' },
          });
        }

        const actionTaken =
          updated.action_taken ||
          updateData.action_taken ||
          updateData.notes ||
          'Maintenance repair completed';

        /** Log repair event in Cooler 360 timeline */
        await logAssetActivity({
          assetId: updated.asset_id,
          coolerId:
            (updated.asset_maintenance_master as any)?.cooler_asset_master?.[0]
              ?.id || null,
          eventType: 'maintenance',
          title: `Ticket ${updated.job_number || `MT-${updated.id}`} repaired`,
          description: `Action taken: ${actionTaken} · Status: ${statusAfterRepair}`,
          status: 'repaired',
          locationName:
            updated.asset_maintenance_master?.asset_master_outlet?.name ||
            updated.asset_maintenance_master?.asset_master_depot?.name ||
            null,
          customerId: updated.asset_maintenance_master?.outlet_id || null,
          depotId: updated.asset_maintenance_master?.depot_id || null,
          performedBy: req.user?.id || updated.technician_id || 1,
          cost: updated.cost ? Number(updated.cost) : undefined,
          sourceTable: 'asset_maintenance',
          sourceId: updated.id,
          meta: {
            action_taken: actionTaken,
            status_after_repair: statusAfterRepair,
            parts: updated.spares?.map((s: any) => ({
              name: s.name,
              qty: s.quantity,
              cost: Number(s.cost),
            })),
            log: `Status updated from ${prevStatus} to repaired`,
          },
        });
      } else if (newStatus === 'closed' && statusChanged) {
        await logAssetActivity({
          assetId: updated.asset_id,
          coolerId:
            (updated.asset_maintenance_master as any)?.cooler_asset_master?.[0]
              ?.id || null,
          eventType: 'maintenance',
          title: `Ticket ${updated.job_number || `MT-${updated.id}`} closed`,
          description: `Closed with total cost TZS ${(updated.cost || 0).toLocaleString()}`,
          status: 'closed',
          cost: Number(updated.cost) || 0,
          locationName:
            updated.asset_maintenance_master?.asset_master_outlet?.name ||
            updated.asset_maintenance_master?.asset_master_depot?.name ||
            null,
          customerId: updated.asset_maintenance_master?.outlet_id || null,
          depotId: updated.asset_maintenance_master?.depot_id || null,
          performedBy: req.user?.id || 1,
          sourceTable: 'asset_maintenance',
          sourceId: updated.id,
        });
      } else if (newStatus === 'assigned' && statusChanged) {
        await logAssetActivity({
          assetId: updated.asset_id,
          coolerId:
            (updated.asset_maintenance_master as any)?.cooler_asset_master?.[0]
              ?.id || null,
          eventType: 'maintenance',
          title: `Ticket ${updated.job_number || `MT-${updated.id}`} assigned`,
          description: `Assigned to ${updated.asset_maintenance_technician?.name || 'Technician'} · Priority: ${updated.priority}`,
          status: 'assigned',
          locationName:
            updated.asset_maintenance_master?.asset_master_outlet?.name ||
            updated.asset_maintenance_master?.asset_master_depot?.name ||
            null,
          customerId: updated.asset_maintenance_master?.outlet_id || null,
          depotId: updated.asset_maintenance_master?.depot_id || null,
          performedBy: req.user?.id || 1,
          sourceTable: 'asset_maintenance',
          sourceId: updated.id,
        });
      } else if (statusChanged) {
        await logAssetActivity({
          assetId: updated.asset_id,
          coolerId:
            (updated.asset_maintenance_master as any)?.cooler_asset_master?.[0]
              ?.id || null,
          eventType: 'maintenance',
          title: `Ticket ${updated.job_number || `MT-${updated.id}`} updated`,
          description: `Status changed from ${prevStatus} to ${newStatus}`,
          status: newStatus,
          locationName:
            updated.asset_maintenance_master?.asset_master_outlet?.name ||
            updated.asset_maintenance_master?.asset_master_depot?.name ||
            null,
          customerId: updated.asset_maintenance_master?.outlet_id || null,
          depotId: updated.asset_maintenance_master?.depot_id || null,
          performedBy: req.user?.id || 1,
          sourceTable: 'asset_maintenance',
          sourceId: updated.id,
        });
      }

      const replaceReview = await checkReplaceReview(updated.asset_id);

      res.json({
        message: 'Asset maintenance updated successfully',
        data: serializeAssetMaintenance(updated, replaceReview),
      });
    } catch (error: any) {
      console.error('Update Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Assigns technician, sets priority, and auto-calculates SLA due date.
   */
  async assignTechnician(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { technician_id, priority, due_date } = req.body;

      if (!technician_id) {
        return res.status(400).json({ message: 'technician_id is required' });
      }

      const ticket = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
        include: { asset_maintenance_master: true },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ message: 'Maintenance ticket not found' });
      }

      const selectedPriority = (
        priority ||
        ticket.priority ||
        'medium'
      ).toLowerCase();
      const calculatedDueDate = due_date
        ? new Date(due_date)
        : calculateDueDate(selectedPriority);

      const technician = await prisma.users.findUnique({
        where: { id: Number(technician_id) },
        select: { name: true },
      });

      const updated = await prisma.asset_maintenance.update({
        where: { id: Number(id) },
        data: {
          technician_id: Number(technician_id),
          priority: selectedPriority,
          due_date: calculatedDueDate,
          status: ticket.status === 'open' ? 'assigned' : ticket.status,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: true,
              asset_master_outlet: true,
              asset_master_depot: true,
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      /** Log assignment in Cooler 360 timeline */
      await logAssetActivity({
        assetId: updated.asset_id,
        eventType: 'maintenance',
        title: `Ticket ${updated.job_number} assigned`,
        description: `Assigned to ${technician?.name || 'Technician'} · Priority: ${updated.priority}`,
        status: updated.status,
        performedBy: req.user?.id || 1,
        sourceTable: 'asset_maintenance',
        sourceId: updated.id,
      });

      res.json({
        message: 'Technician assigned successfully',
        data: serializeAssetMaintenance(updated),
      });
    } catch (error: any) {
      console.error('Assign Technician Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Submits mobile repair result from Flutter app (Baraka).
   */
  async submitMobileRepairResult(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { action_taken, status_after_repair, repair_photos } = req.body;

      if (!action_taken) {
        return res.status(400).json({ message: 'action_taken is required' });
      }

      const ticket = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
        include: { asset_maintenance_master: true },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ message: 'Maintenance ticket not found' });
      }

      const updated = await prisma.asset_maintenance.update({
        where: { id: Number(id) },
        data: {
          action_taken,
          status_after_repair: status_after_repair || 'working',
          status: 'repaired',
          repaired_date: new Date(),
          repair_photos: repair_photos
            ? JSON.stringify(repair_photos)
            : ticket.repair_photos,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: true,
              asset_master_outlet: true,
              asset_master_depot: true,
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      /** Log repair completion in Cooler 360 timeline */
      await logAssetActivity({
        assetId: updated.asset_id,
        eventType: 'maintenance',
        title: `Ticket ${updated.job_number} repaired`,
        description: `Action taken: ${action_taken} · Status: ${updated.status_after_repair}`,
        status: 'repaired',
        performedBy: req.user?.id || ticket.technician_id,
        sourceTable: 'asset_maintenance',
        sourceId: updated.id,
      });

      res.json({
        message: 'Repair result recorded successfully',
        data: serializeAssetMaintenance(updated),
      });
    } catch (error: any) {
      console.error('Submit Mobile Repair Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Finalizes and closes a maintenance ticket with verified parts and labour.
   */
  async closeMaintenanceJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { labour_cost, spares, warranty_claim } = req.body;

      const ticket = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
        include: { spares: true, asset_maintenance_master: true },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ message: 'Maintenance ticket not found' });
      }

      const updated = await prisma.$transaction(async (tx: any) => {
        let partsTotal = 0;

        if (spares !== undefined && Array.isArray(spares)) {
          await tx.asset_maintenance_spares.deleteMany({
            where: { asset_maintenance_id: Number(id) },
          });

          const sparesToCreate = spares
            .filter((s: any) => s && s.name && s.name.trim())
            .map((s: any) => {
              const qty = Math.max(1, Number(s.quantity) || 1);
              const unitCost = Math.max(
                0,
                Number(s.unit_cost) || Number(s.cost) || 0
              );
              return {
                asset_maintenance_id: Number(id),
                name: s.name.trim(),
                quantity: qty,
                unit_cost: unitCost,
                cost: qty * unitCost,
                createdby: req.user?.id || 1,
              };
            });

          if (sparesToCreate.length > 0) {
            await tx.asset_maintenance_spares.createMany({
              data: sparesToCreate,
            });
            partsTotal = sparesToCreate.reduce(
              (sum: number, p: any) => sum + Number(p.cost),
              0
            );
          }
        } else {
          partsTotal = (ticket.spares || []).reduce(
            (sum: number, p: any) => sum + Number(p.cost),
            0
          );
        }

        const effectiveLabour =
          labour_cost !== undefined
            ? Math.max(0, Number(labour_cost) || 0)
            : Number(ticket.labour_cost || 0);

        const totalCost = partsTotal + effectiveLabour;

        return tx.asset_maintenance.update({
          where: { id: Number(id) },
          data: {
            status: 'closed',
            closed_date: new Date(),
            labour_cost: effectiveLabour,
            cost: totalCost,
            warranty_claim:
              warranty_claim !== undefined
                ? Boolean(warranty_claim)
                : ticket.warranty_claim,
            updatedate: new Date(),
            updatedby: req.user?.id || 1,
          },
          include: {
            asset_maintenance_master: {
              include: {
                asset_master_asset_types: true,
                asset_master_outlet: true,
                asset_master_depot: true,
              },
            },
            asset_maintenance_technician: true,
            spares: true,
          },
        });
      });

      /** Log closure in Cooler 360 timeline */
      await logAssetActivity({
        assetId: updated.asset_id,
        eventType: 'maintenance',
        title: `Ticket ${updated.job_number} closed`,
        description: `Closed with total cost TZS ${(updated.cost || 0).toLocaleString()}`,
        status: 'closed',
        cost: Number(updated.cost) || 0,
        performedBy: req.user?.id || 1,
        sourceTable: 'asset_maintenance',
        sourceId: updated.id,
        meta: {
          parts: updated.spares?.map((s: any) => ({
            name: s.name,
            qty: s.quantity,
            cost: s.cost,
          })),
          labour: Number(updated.labour_cost) || 0,
        },
      });

      res.json({
        message: 'Maintenance job closed successfully',
        data: serializeAssetMaintenance(updated),
      });
    } catch (error: any) {
      console.error('Close Maintenance Job Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Retrieves quick summary stats for top KPI cards.
   */
  async getMaintenanceDashboardStats(_req: Request, res: Response) {
    try {
      const now = new Date();
      const [openJobs, overdueJobs, newComplaints, closedJobs] =
        await Promise.all([
          prisma.asset_maintenance.count({
            where: { is_active: 'Y', status: { in: ['open', 'assigned'] } },
          }),
          prisma.asset_maintenance.count({
            where: {
              is_active: 'Y',
              status: { not: 'closed' },
              due_date: { lt: now },
            },
          }),
          prisma.customer_complaints.count({
            where: { status: 'P' },
          }),
          prisma.asset_maintenance.count({
            where: { is_active: 'Y', status: 'closed' },
          }),
        ]);

      res.json({
        success: true,
        data: {
          open_jobs: openJobs,
          overdue_jobs: overdueJobs,
          new_complaints: newComplaints,
          closed_jobs: closedJobs,
        },
      });
    } catch (error: any) {
      console.error('Get Maintenance Stats Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Soft deletes a maintenance record.
   */
  async deleteAssetMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Asset maintenance not found' });
      }

      await prisma.asset_maintenance.update({
        where: { id: Number(id) },
        data: { is_active: 'N', updatedate: new Date() },
      });

      res.json({ message: 'Asset maintenance deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
