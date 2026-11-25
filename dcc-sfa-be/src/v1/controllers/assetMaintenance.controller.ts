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
  asset_maintenance_master?: {
    id: number;
    name: string;
    code: string;
    serial_number: string;
    barcode?: string | null;
    brand?: string | null;
    current_location?: string | null;
    current_status?: string | null;
    warranty_expiry?: Date | null;
    outlet_id?: number | null;
    depot_id?: number | null;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
    asset_master_asset_sub_types?: {
      id: number;
      name: string;
    } | null;
    asset_master_brands?: {
      id: number;
      name: string;
    } | null;
    asset_master_outlet?: {
      id: number;
      name: string;
      code: string;
      depot_id?: number | null;
      customer_depot?: {
        id: number;
        name: string;
      } | null;
    } | null;
    asset_master_depot?: {
      id: number;
      name: string;
    } | null;
    cooler_asset_master?: Array<{
      id?: number;
      status?: string | null;
      coolers_customers?: {
        id: number;
        name: string;
        code: string;
        depot_id?: number | null;
        customer_depot?: {
          id: number;
          name: string;
        } | null;
      } | null;
    }>;
  } | null;
  customer?: {
    id: number;
    name: string;
    code: string;
    depot_id?: number | null;
    customer_depot?: {
      id: number;
      name: string;
    } | null;
  } | null;
  activities?: Array<{
    id: number;
    event_type: string;
    title: string;
    description?: string | null;
    status?: string | null;
    metadata?: any;
    created_at: Date;
    asset_activities_user?: {
      id: number;
      name: string;
      email?: string | null;
    } | null;
  }>;
  workshop_return?: {
    return_movement_id: number;
    return_movement_code: string;
    depot_id?: number | null;
    depot_name?: string | null;
    from_customer_id?: number | null;
    from_customer_name?: string | null;
    standby_asset_id?: number | null;
    standby_serial?: string | null;
    standby_movement_id?: number | null;
    standby_movement_code?: string | null;
  } | null;
  replace_review_needed?: boolean;
  repairs_last_90_days?: number;
  outlet_has_cooler?: boolean;
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
 * Synchronizes asset_master and active coolers status when a repair finishes.
 * Workshop units remaining at a depot stay 'Under repair' until job closure.
 *
 * @param {object} ticket - Updated maintenance ticket with asset_maintenance_master.
 * @param {string} statusAfterRepair - Post-repair working state.
 */
async function syncAssetStatusOnRepair(
  ticket: {
    asset_id: number;
    repair_location?: string | null;
    asset_maintenance_master?: { outlet_id?: number | null } | null;
  },
  statusAfterRepair: string
) {
  if (statusAfterRepair !== 'working') return;
  const isWorkshopAtDepot =
    (ticket.repair_location || '').toLowerCase() === 'workshop' &&
    !ticket.asset_maintenance_master?.outlet_id;
  if (isWorkshopAtDepot) return;

  const targetStatus = ticket.asset_maintenance_master?.outlet_id
    ? 'Installed'
    : 'Available';

  await prisma.asset_master.update({
    where: { id: ticket.asset_id },
    data: { current_status: targetStatus },
  });

  await prisma.coolers.updateMany({
    where: {
      asset_master_id: ticket.asset_id,
      OR: [{ status: null }, { status: { not: 'Removed' } }],
    },
    data: { status: targetStatus },
  });
}

/**
 * Installs a standby cooler from a depot at a customer outlet inside a transaction.
 *
 * @param {any} tx - Prisma transaction client.
 * @param {object} params - Standby movement configuration.
 * @returns {Promise<any>} Created asset movement record.
 */
async function deployStandbyCoolerTx(
  tx: any,
  params: {
    standbyAsset: {
      id: number;
      code?: string | null;
      serial_number: string;
    };
    fromCustomerId: number;
    fromCustomerName: string;
    depotId: number;
    moveDate: Date;
    userId: number;
    jobNumber: string;
  }
): Promise<any> {
  const {
    standbyAsset,
    fromCustomerId,
    fromCustomerName,
    depotId,
    moveDate,
    userId,
    jobNumber,
  } = params;

  const standbyMovement = await tx.asset_movements.create({
    data: {
      from_direction: 'depot',
      from_depot_id: depotId,
      to_direction: 'outlet',
      to_customer_id: fromCustomerId,
      movement_type: 'installation',
      movement_date: moveDate,
      performed_by: userId,
      notes: `Standby cooler installation for job ${jobNumber} at ${fromCustomerName}`,
      status: 'A',
      approval_status: 'A',
      approved_by: userId,
      approved_at: new Date(),
      is_active: 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
      asset_movement_assets: {
        create: [
          {
            asset_id: standbyAsset.id,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
          },
        ],
      },
    },
  });

  await tx.asset_master.update({
    where: { id: standbyAsset.id },
    data: {
      outlet_id: fromCustomerId,
      depot_id: null,
      current_location: fromCustomerName,
      current_status: 'Installed',
      installation_date: moveDate,
      updatedate: new Date(),
      updatedby: userId,
    },
  });

  const existingStandbyCooler = await tx.coolers.findFirst({
    where: { asset_master_id: standbyAsset.id },
  });

  if (existingStandbyCooler) {
    await tx.coolers.update({
      where: { id: existingStandbyCooler.id },
      data: {
        customer_id: fromCustomerId,
        asset_movement_id: standbyMovement.id,
        status: 'Installed',
        approval_status: 'A',
        install_date: moveDate,
        is_active: 'Y',
        updatedate: new Date(),
        updatedby: userId,
      },
    });
  } else {
    await tx.coolers.create({
      data: {
        customer_id: fromCustomerId,
        code:
          standbyAsset.code || `COOL-${standbyAsset.id}-${standbyMovement.id}`,
        asset_master_id: standbyAsset.id,
        asset_movement_id: standbyMovement.id,
        serial_number: standbyAsset.serial_number,
        install_date: moveDate,
        status: 'Installed',
        approval_status: 'A',
        is_active: 'Y',
        createdby: userId,
        createdate: new Date(),
        log_inst: 1,
      },
    });
  }

  return standbyMovement;
}

const ASSET_MAINTENANCE_MASTER_INCLUDE = {
  include: {
    asset_master_asset_types: {
      select: { id: true, name: true },
    },
    asset_master_asset_sub_types: {
      select: { id: true, name: true },
    },
    asset_master_brands: {
      select: { id: true, name: true },
    },
    asset_master_outlet: {
      select: {
        id: true,
        name: true,
        code: true,
        depot_id: true,
        customer_depot: {
          select: { id: true, name: true },
        },
      },
    },
    asset_master_depot: {
      select: { id: true, name: true },
    },
    cooler_asset_master: {
      select: {
        id: true,
        status: true,
        coolers_customers: {
          select: {
            id: true,
            name: true,
            code: true,
            depot_id: true,
            customer_depot: {
              select: { id: true, name: true },
            },
          },
        },
      },
    },
  },
};

/**
 * Serializes raw Prisma asset maintenance model into standard client payload.
 *
 * @param {any} m - Raw database record.
 * @param {any} replaceReview - Optional replace review object.
 * @param {any} resolvedCustomer - Fallback customer from customer_assets.
 * @param {any[]} activities - Ticket lifecycle activity logs.
 * @returns {AssetMaintenanceSerialized} Serialized maintenance ticket.
 */
const serializeAssetMaintenance = (
  m: any,
  replaceReview?: any,
  resolvedCustomer?: any,
  activities?: any[],
  outletHasCooler?: boolean
): AssetMaintenanceSerialized => {
  const isOverdue =
    m.status !== 'closed' &&
    Boolean(m.due_date && new Date() > new Date(m.due_date));

  const statusLower = (m.status || 'open').toLowerCase();
  const repairLocationLower = (m.repair_location || 'onsite').toLowerCase();

  const workshopActivity = Array.isArray(activities)
    ? [...activities]
        .reverse()
        .find((a: any) => a.metadata && a.metadata.return_movement_code)
    : null;

  const standbyActivity = Array.isArray(activities)
    ? [...activities]
        .reverse()
        .find((a: any) => a.metadata && a.metadata.standby_movement_code)
    : null;

  const standbyReturnedActivity = Array.isArray(activities)
    ? [...activities]
        .reverse()
        .find(
          (a: any) => a.metadata && a.metadata.standby_returned_movement_code
        )
    : null;

  const workshopReturnMeta = workshopActivity?.metadata
    ? {
        ...workshopActivity.metadata,
        ...(standbyActivity?.metadata
          ? {
              standby_asset_id: standbyActivity.metadata.standby_asset_id,
              standby_serial: standbyActivity.metadata.standby_serial,
              standby_movement_id: standbyActivity.metadata.standby_movement_id,
              standby_movement_code:
                standbyActivity.metadata.standby_movement_code,
            }
          : {}),
        ...(standbyReturnedActivity?.metadata
          ? {
              standby_returned: true,
              standby_returned_movement_id:
                standbyReturnedActivity.metadata.standby_returned_movement_id,
              standby_returned_movement_code:
                standbyReturnedActivity.metadata.standby_returned_movement_code,
            }
          : {}),
      }
    : null;

  const assetUnderRepairAtDepot = Boolean(
    m.asset_maintenance_master &&
    m.asset_maintenance_master.outlet_id === null &&
    m.asset_maintenance_master.depot_id !== null &&
    m.asset_maintenance_master.current_status?.toLowerCase() === 'under repair'
  );

  const effectiveStatus =
    repairLocationLower === 'workshop' &&
    (statusLower === 'open' || statusLower === 'assigned')
      ? workshopActivity || assetUnderRepairAtDepot
        ? 'at_workshop'
        : 'awaiting_return'
      : statusLower;

  const assetIsAtDepot =
    m.asset_maintenance_master &&
    m.asset_maintenance_master.outlet_id === null &&
    m.asset_maintenance_master.depot_id !== null &&
    (effectiveStatus === 'at_workshop' ||
      effectiveStatus === 'closed' ||
      m.asset_maintenance_master.current_status?.toLowerCase() ===
        'under repair');

  const activeCoolerCustomer =
    m.asset_maintenance_master?.cooler_asset_master?.find(
      (c: any) => c.status !== 'Removed' && c.coolers_customers
    )?.coolers_customers || null;

  const customerObj = assetIsAtDepot
    ? null
    : resolvedCustomer ||
      m.customer ||
      m.asset_maintenance_master?.asset_master_outlet ||
      activeCoolerCustomer ||
      null;

  return {
    id: m.id,
    job_number: m.job_number || `MT-${String(m.id).padStart(5, '0')}`,
    asset_id: m.asset_id,
    technician_id: m.technician_id ? Number(m.technician_id) : null,
    maintenance_date: m.maintenance_date,
    status: effectiveStatus,
    priority: (m.priority || 'medium').toLowerCase(),
    due_date: m.due_date,
    repair_location: repairLocationLower,
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
          depot_id: customerObj.depot_id ?? null,
          customer_depot: customerObj.customer_depot
            ? {
                id: customerObj.customer_depot.id,
                name: customerObj.customer_depot.name,
              }
            : null,
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
          brand: m.asset_maintenance_master.brand || null,
          current_location: m.asset_maintenance_master.current_location,
          current_status: m.asset_maintenance_master.current_status || null,
          warranty_expiry: m.asset_maintenance_master.warranty_expiry || null,
          outlet_id: m.asset_maintenance_master.outlet_id ?? null,
          depot_id: m.asset_maintenance_master.depot_id ?? null,
          asset_master_asset_types: m.asset_maintenance_master
            .asset_master_asset_types
            ? {
                id: m.asset_maintenance_master.asset_master_asset_types.id,
                name: m.asset_maintenance_master.asset_master_asset_types.name,
              }
            : null,
          asset_master_asset_sub_types: m.asset_maintenance_master
            .asset_master_asset_sub_types
            ? {
                id: m.asset_maintenance_master.asset_master_asset_sub_types.id,
                name: m.asset_maintenance_master.asset_master_asset_sub_types
                  .name,
              }
            : null,
          asset_master_brands: m.asset_maintenance_master.asset_master_brands
            ? {
                id: m.asset_maintenance_master.asset_master_brands.id,
                name: m.asset_maintenance_master.asset_master_brands.name,
              }
            : null,
          asset_master_outlet: customerObj
            ? {
                id: customerObj.id,
                name: customerObj.name,
                code: customerObj.code,
                depot_id: customerObj.depot_id ?? null,
                customer_depot: customerObj.customer_depot
                  ? {
                      id: customerObj.customer_depot.id,
                      name: customerObj.customer_depot.name,
                    }
                  : null,
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
    activities: activities || undefined,
    workshop_return: workshopReturnMeta,
    outlet_has_cooler: outletHasCooler,
    replace_review: replaceReview || undefined,
    replace_review_needed: replaceReview?.shouldReview || false,
    repairs_last_90_days: replaceReview?.repairCount || 0,
  };
};

/**
 * Fetches timeline activity entries linked directly to a maintenance ticket.
 *
 * @param {number} maintenanceId - Maintenance ticket ID.
 * @returns {Promise<any[]>} Serialized ticket activities ordered chronologically.
 */
async function fetchTicketActivities(maintenanceId: number) {
  const rows = await prisma.asset_activities.findMany({
    where: {
      source_table: 'asset_maintenance',
      source_id: maintenanceId,
      is_active: 'Y',
    },
    orderBy: { event_date: 'asc' },
    include: {
      activity_user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return rows.map((a: any) => {
    let metadata: any = null;
    if (a.meta_json) {
      try {
        metadata = JSON.parse(a.meta_json);
      } catch (_err) {
        metadata = null;
      }
    }
    return {
      id: a.id,
      event_type: a.event_type,
      title: a.title,
      description: a.description,
      status: a.status,
      metadata,
      created_at: a.event_date || a.createdate,
      asset_activities_user: a.activity_user
        ? {
            id: a.activity_user.id,
            name: a.activity_user.name,
            email: a.activity_user.email,
          }
        : null,
    };
  });
}

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

      let resolvedRemarks = maintenanceData.remarks || '';
      const extraTags: string[] = [];
      if (maintenanceData.repair_location) {
        extraTags.push(`Location: ${maintenanceData.repair_location}`);
      }
      if (maintenanceData.status) {
        extraTags.push(`Status: ${maintenanceData.status}`);
      }
      if (extraTags.length > 0) {
        resolvedRemarks = resolvedRemarks
          ? `${resolvedRemarks} (${extraTags.join(', ')})`
          : extraTags.join(', ');
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

      const repairLocation = (
        maintenanceData.repair_location || 'onsite'
      ).toLowerCase();
      const requestedStatus = maintenanceData.status
        ? String(maintenanceData.status).toLowerCase()
        : '';
      const validWorkshopStatuses = [
        'awaiting_return',
        'at_workshop',
        'repaired',
        'closed',
      ];
      const rawTechId = maintenanceData.technician_id;
      const parsedTechId =
        rawTechId !== undefined &&
        rawTechId !== null &&
        rawTechId !== '' &&
        rawTechId !== 'null' &&
        rawTechId !== 'undefined' &&
        !isNaN(Number(rawTechId)) &&
        Number(rawTechId) > 0
          ? Number(rawTechId)
          : null;

      const initialStatus =
        repairLocation === 'workshop'
          ? validWorkshopStatuses.includes(requestedStatus)
            ? requestedStatus
            : 'awaiting_return'
          : requestedStatus || (parsedTechId ? 'assigned' : 'open');

      const record = await prisma.asset_maintenance.create({
        data: {
          asset_id: Number(maintenanceData.asset_id),
          technician_id: parsedTechId,
          maintenance_date: new Date(maintenanceData.maintenance_date),
          job_number: jobNumber,
          status: initialStatus,
          priority,
          due_date: dueDate,
          repair_location: repairLocation,
          issue_reported: maintenanceData.issue_reported || null,
          action_taken: maintenanceData.action_taken || null,
          source_type: maintenanceData.source_type || 'manual',
          source_id: maintenanceData.source_id
            ? Number(maintenanceData.source_id)
            : null,
          source_code: maintenanceData.source_code || null,
          secondary_source_code: maintenanceData.secondary_source_code || null,
          labour_cost: parsedLabour,
          cost:
            totalCost > 0
              ? totalCost
              : maintenanceData.cost !== undefined &&
                  maintenanceData.cost !== null &&
                  maintenanceData.cost !== ''
                ? Number(maintenanceData.cost)
                : null,
          remarks: resolvedRemarks || maintenanceData.remarks || null,
          is_active: maintenanceData.is_active || 'Y',
          warranty_claim: Boolean(maintenanceData.warranty_claim),
          createdby: maintenanceData.created_by || req.user?.id || 1,
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
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
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

      const technicianIdParam = technician_id
        ? String(technician_id).trim()
        : '';
      const hasTechFilter = Boolean(
        technicianIdParam && technicianIdParam !== 'all'
      );
      const isUnassigned =
        hasTechFilter &&
        (technicianIdParam === 'unassigned' ||
          technicianIdParam === 'null' ||
          technicianIdParam === '0');
      const techIdNum =
        hasTechFilter && !isUnassigned && !isNaN(Number(technicianIdParam))
          ? Number(technicianIdParam)
          : undefined;

      const techFilterClause: any = hasTechFilter
        ? isUnassigned
          ? { technician_id: null }
          : techIdNum !== undefined
            ? { technician_id: techIdNum }
            : {}
        : {};

      const statusFilterClause =
        statusLower && statusLower !== 'all'
          ? statusLower === 'awaiting_return'
            ? {
                OR: [
                  { status: 'awaiting_return' },
                  {
                    repair_location: 'workshop',
                    status: { in: ['open', 'assigned'] },
                  },
                ],
              }
            : statusLower === 'open'
              ? {
                  status: 'open',
                  repair_location: { not: 'workshop' },
                }
              : { status: statusLower }
          : {};

      const filters: any = {
        is_active: 'Y',
        ...(asset_id && { asset_id: Number(asset_id) }),
        ...techFilterClause,
        ...(priority && { priority: (priority as string).toLowerCase() }),
        ...statusFilterClause,
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
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      /** Batch-lookup customer_assets for any assets without a direct outlet or cooler linkage */
      const missingOutletSerials = data
        .filter((m: any) => {
          const master = m.asset_maintenance_master;
          const activeCooler = master?.cooler_asset_master?.find(
            (c: any) => c.status !== 'Removed' && c.coolers_customers
          );
          return (
            master &&
            !master.asset_master_outlet &&
            !activeCooler &&
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
              select: {
                id: true,
                name: true,
                code: true,
                depot_id: true,
                customer_depot: { select: { id: true, name: true } },
              },
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

      /** Compute summary counts for the top dashboard cards filtered by technician if provided */
      const baseStatsWhere: any = {
        is_active: 'Y',
        ...techFilterClause,
      };

      const [totalRecords, openJobs, overdueJobs, closedJobs, newComplaints] =
        await Promise.all([
          prisma.asset_maintenance.count({ where: baseStatsWhere }),
          prisma.asset_maintenance.count({
            where: {
              ...baseStatsWhere,
              status: {
                not: 'closed',
              },
            },
          }),
          prisma.asset_maintenance.count({
            where: {
              ...baseStatsWhere,
              status: { not: 'closed' },
              due_date: { lt: now },
            },
          }),
          prisma.asset_maintenance.count({
            where: { ...baseStatsWhere, status: 'closed' },
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
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      if (!record) {
        return res.status(404).json({ message: 'Asset maintenance not found' });
      }

      let fallbackCustomer: any = null;
      const master = record.asset_maintenance_master;
      const activeCoolerCustomer = master?.cooler_asset_master?.find(
        (c: any) => c.status !== 'Removed' && c.coolers_customers
      );
      if (
        master &&
        !master.asset_master_outlet &&
        !activeCoolerCustomer &&
        master.serial_number
      ) {
        const found = await prisma.customer_assets.findFirst({
          where: { serial_number: master.serial_number },
          include: {
            customer_assets_customers: {
              select: {
                id: true,
                name: true,
                code: true,
                depot_id: true,
                customer_depot: { select: { id: true, name: true } },
              },
            },
          },
        });
        if (found?.customer_assets_customers) {
          fallbackCustomer = found.customer_assets_customers;
        }
      }

      const [replaceReview, activities] = await Promise.all([
        checkReplaceReview(record.asset_id),
        fetchTicketActivities(record.id),
      ]);

      const returnAct = [...activities]
        .reverse()
        .find((a: any) => a.metadata && a.metadata.return_movement_code);
      const fromCustomerId =
        returnAct?.metadata?.from_customer_id ||
        fallbackCustomer?.id ||
        master?.outlet_id ||
        null;
      const outletHasCooler = fromCustomerId
        ? (await prisma.asset_master.count({
            where: { outlet_id: Number(fromCustomerId), is_active: 'Y' },
          })) > 0
        : undefined;

      res.json({
        message: 'Asset maintenance fetched successfully',
        data: serializeAssetMaintenance(
          record,
          replaceReview,
          fallbackCustomer,
          activities,
          outletHasCooler
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

        const updatePayload: any = {
          cost: newTotalCost,
          labour_cost: effectiveLabour,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        };

        if (updateData.maintenance_date) {
          updatePayload.maintenance_date = new Date(updateData.maintenance_date);
        }
        if (updateData.issue_reported !== undefined) {
          updatePayload.issue_reported = updateData.issue_reported || null;
        }
        if (updateData.action_taken !== undefined) {
          updatePayload.action_taken = updateData.action_taken || null;
        }
        if (updateData.remarks !== undefined) {
          updatePayload.remarks = updateData.remarks || null;
        }
        if (updateData.repair_location !== undefined) {
          updatePayload.repair_location = String(updateData.repair_location).toLowerCase();
        }
        if (updateData.source_type !== undefined) {
          updatePayload.source_type = updateData.source_type || null;
        }
        if (updateData.source_id !== undefined) {
          updatePayload.source_id =
            updateData.source_id && Number(updateData.source_id) > 0
              ? Number(updateData.source_id)
              : null;
        }
        if (updateData.source_code !== undefined) {
          updatePayload.source_code = updateData.source_code || null;
        }
        if (updateData.secondary_source_code !== undefined) {
          updatePayload.secondary_source_code = updateData.secondary_source_code || null;
        }
        if (updateData.priority) {
          const prio = String(updateData.priority).toLowerCase();
          updatePayload.priority = prio;
          if (!updateData.due_date) {
            updatePayload.due_date = calculateDueDate(prio);
          }
        }
        if (updateData.due_date) {
          updatePayload.due_date = new Date(updateData.due_date);
        }
        if (updateData.status) {
          const statusLower = String(updateData.status).toLowerCase();
          updatePayload.status = statusLower;
          if (statusLower === 'repaired') {
            updatePayload.repaired_date = updateData.repaired_date
              ? new Date(updateData.repaired_date)
              : new Date();
            updatePayload.status_after_repair =
              updateData.status_after_repair ||
              existing.status_after_repair ||
              'working';
          } else if (statusLower === 'closed') {
            updatePayload.closed_date = updateData.closed_date
              ? new Date(updateData.closed_date)
              : new Date();
          }
        }
        if (updateData.status_after_repair !== undefined) {
          updatePayload.status_after_repair = updateData.status_after_repair || null;
        }
        if (updateData.escalated_to !== undefined) {
          updatePayload.escalated_to = updateData.escalated_to || null;
        }
        if (updateData.warranty_claim !== undefined) {
          updatePayload.warranty_claim = Boolean(updateData.warranty_claim);
        }
        if (updateData.repair_photos !== undefined) {
          updatePayload.repair_photos =
            typeof updateData.repair_photos === 'string'
              ? updateData.repair_photos
              : JSON.stringify(updateData.repair_photos);
        }
        if (updateData.is_active !== undefined) {
          updatePayload.is_active = updateData.is_active;
        }
        if (updateData.log_inst !== undefined) {
          updatePayload.log_inst = Number(updateData.log_inst) || 1;
        }

        if (updateData.technician_id !== undefined) {
          const rawTechId = updateData.technician_id;
          const validTechId =
            rawTechId !== null &&
            rawTechId !== '' &&
            rawTechId !== 'null' &&
            rawTechId !== 'undefined' &&
            !isNaN(Number(rawTechId)) &&
            Number(rawTechId) > 0
              ? Number(rawTechId)
              : null;

          if (validTechId) {
            updatePayload.asset_maintenance_technician = {
              connect: { id: validTechId },
            };
          } else {
            updatePayload.asset_maintenance_technician = {
              disconnect: true,
            };
          }
        }

        if (
          updateData.asset_id &&
          Number(updateData.asset_id) > 0 &&
          Number(updateData.asset_id) !== existing.asset_id
        ) {
          updatePayload.asset_maintenance_master = {
            connect: { id: Number(updateData.asset_id) },
          };
        }

        return tx.asset_maintenance.update({
          where: { id: maintenanceId },
          data: updatePayload,
          include: {
            asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
            asset_maintenance_technician: true,
            spares: true,
          },
        });
      });

      if (
        updateData.warranty_claim !== undefined &&
        Boolean(updateData.warranty_claim) !== Boolean(existing.warranty_claim)
      ) {
        const raised = Boolean(updateData.warranty_claim);
        const ticketCode = updated.job_number || `MT-${updated.id}`;
        if (raised) {
          const existingClaim = await prisma.asset_warranty_claims.findFirst({
            where: {
              asset_id: updated.asset_id,
              notes: { contains: ticketCode },
            },
          });
          if (!existingClaim) {
            await prisma.asset_warranty_claims.create({
              data: {
                asset_id: updated.asset_id,
                claim_date: new Date(),
                issue_description:
                  updated.issue_reported || 'Parts warranty claim from repair',
                claim_status: 'P',
                notes: `Raised from maintenance ticket ${ticketCode}`,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
        await logAssetActivity({
          assetId: updated.asset_id,
          eventType: 'maintenance',
          title: raised
            ? `Warranty claim raised for ${ticketCode}`
            : `Warranty claim cleared for ${ticketCode}`,
          description: raised
            ? 'Supplier parts warranty claim flagged'
            : 'Warranty claim flag removed',
          status: updated.status,
          performedBy: req.user?.id || 1,
          sourceTable: 'asset_maintenance',
          sourceId: updated.id,
        });
      }

      /** Detect status transition and log corresponding timeline activity */
      const prevStatus = (existing.status || 'open').toLowerCase();
      const newStatus = (updated.status || 'open').toLowerCase();
      const statusChanged = prevStatus !== newStatus;

      if (newStatus === 'repaired' && (statusChanged || updateData.status)) {
        const statusAfterRepair =
          updated.status_after_repair ||
          updateData.status_after_repair ||
          'working';

        await syncAssetStatusOnRepair(updated, statusAfterRepair);

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
            log: `Status updated from ${prevStatus.replaceAll('_', '')} to repaired`,
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
          description: `Status changed from ${prevStatus.replaceAll('_', ' ')} to ${newStatus.replaceAll('_', ' ')}`,
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

      const [replaceReview, activities] = await Promise.all([
        checkReplaceReview(updated.asset_id),
        fetchTicketActivities(updated.id),
      ]);

      res.json({
        message: 'Asset maintenance updated successfully',
        data: serializeAssetMaintenance(
          updated,
          replaceReview,
          undefined,
          activities
        ),
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
          status:
            (ticket.repair_location || '').toLowerCase() === 'workshop' &&
            (!ticket.status ||
              ticket.status === 'open' ||
              ticket.status === 'assigned')
              ? 'awaiting_return'
              : ticket.status === 'open'
                ? 'assigned'
                : ticket.status,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
        include: {
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
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

      const activities = await fetchTicketActivities(updated.id);

      res.json({
        message: 'Technician assigned successfully',
        data: serializeAssetMaintenance(
          updated,
          undefined,
          undefined,
          activities
        ),
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
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      await syncAssetStatusOnRepair(
        updated,
        updated.status_after_repair || 'working'
      );

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

      const activities = await fetchTicketActivities(updated.id);

      res.json({
        message: 'Repair result recorded successfully',
        data: serializeAssetMaintenance(
          updated,
          undefined,
          undefined,
          activities
        ),
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
            asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
            asset_maintenance_technician: true,
            spares: true,
          },
        });
      });

      if (
        updated.repair_location?.toLowerCase() === 'workshop' &&
        !updated.asset_maintenance_master?.outlet_id
      ) {
        await prisma.asset_master.update({
          where: { id: updated.asset_id },
          data: {
            current_status:
              updated.status_after_repair === 'damaged'
                ? 'Damaged'
                : 'Available',
            updatedate: new Date(),
            updatedby: req.user?.id || 1,
          },
        });
      } else if (updated.asset_maintenance_master?.outlet_id) {
        await prisma.asset_master.update({
          where: { id: updated.asset_id },
          data: {
            current_status:
              updated.status_after_repair === 'damaged'
                ? 'Damaged'
                : 'Installed',
            updatedate: new Date(),
            updatedby: req.user?.id || 1,
          },
        });
      }

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

      const activities = await fetchTicketActivities(updated.id);

      res.json({
        message: 'Maintenance job closed successfully',
        data: serializeAssetMaintenance(
          updated,
          undefined,
          undefined,
          activities
        ),
      });
    } catch (error: any) {
      console.error('Close Maintenance Job Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Executes the workshop return movement (and optional standby cooler install)
   * directly from a maintenance job, moving the job to `at_workshop`.
   */
  async createWorkshopReturnMovement(req: any, res: Response) {
    try {
      const ticketId = Number(req.params.id);
      const {
        to_depot_id,
        movement_date,
        install_standby,
        standby_asset_id,
        notes,
      } = req.body;

      const ticket = await prisma.asset_maintenance.findUnique({
        where: { id: ticketId },
        include: {
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ message: 'Maintenance ticket not found' });
      }

      const currentStatus = (ticket.status || '').toLowerCase();
      if (currentStatus === 'closed') {
        return res.status(400).json({
          message: 'Cannot create return movement for a closed ticket',
        });
      }
      if (currentStatus === 'at_workshop' || currentStatus === 'repaired') {
        return res.status(400).json({
          message: 'Cooler has already been returned to workshop',
        });
      }

      const master = ticket.asset_maintenance_master;
      if (!master) {
        return res.status(404).json({ message: 'Linked asset not found' });
      }

      const activeCoolerCustomer =
        master.cooler_asset_master?.find(
          (c: any) => c.status !== 'Removed' && c.coolers_customers
        )?.coolers_customers || null;

      let fromCustomer: any =
        master.asset_master_outlet || activeCoolerCustomer || null;

      if (!fromCustomer && master.serial_number) {
        const custAsset = await prisma.customer_assets.findFirst({
          where: { serial_number: master.serial_number },
          include: {
            customer_assets_customers: {
              select: {
                id: true,
                name: true,
                code: true,
                depot_id: true,
                customer_depot: { select: { id: true, name: true } },
              },
            },
          },
        });
        if (custAsset?.customer_assets_customers) {
          fromCustomer = custAsset.customer_assets_customers;
        }
      }

      const resolvedDepotId = Number(
        to_depot_id || fromCustomer?.depot_id || master.depot_id
      );
      if (!resolvedDepotId) {
        return res.status(400).json({
          message: 'Destination workshop depot is required',
        });
      }

      const toDepot = await prisma.depots.findUnique({
        where: { id: resolvedDepotId },
        select: { id: true, name: true },
      });
      if (!toDepot) {
        return res.status(404).json({ message: 'Destination depot not found' });
      }

      let standbyAsset: any = null;
      if (install_standby && standby_asset_id) {
        standbyAsset = await prisma.asset_master.findUnique({
          where: { id: Number(standby_asset_id) },
          select: {
            id: true,
            name: true,
            code: true,
            serial_number: true,
          },
        });
        if (!standbyAsset) {
          return res
            .status(404)
            .json({ message: 'Selected standby cooler not found' });
        }
        if (standbyAsset.id === ticket.asset_id) {
          return res.status(400).json({
            message: 'Standby cooler cannot be the same as the broken cooler',
          });
        }
      }

      const userId = req.user?.id || ticket.technician_id || 1;
      const moveDate = movement_date ? new Date(movement_date) : new Date();
      const jobNumber =
        ticket.job_number || `MT-${String(ticket.id).padStart(5, '0')}`;

      const txResult = await prisma.$transaction(async tx => {
        const returnMovement = await tx.asset_movements.create({
          data: {
            from_direction: fromCustomer ? 'outlet' : 'depot',
            from_customer_id: fromCustomer?.id || null,
            from_depot_id: fromCustomer ? null : master.depot_id || null,
            to_direction: 'depot',
            to_depot_id: toDepot.id,
            movement_type: 'return',
            return_reason: 'Workshop Repair',
            movement_date: moveDate,
            performed_by: userId,
            notes:
              notes ||
              `Workshop return for maintenance job ${jobNumber}${fromCustomer ? ` from ${fromCustomer.name}` : ''}`,
            status: 'A',
            approval_status: 'A',
            approved_by: userId,
            approved_at: new Date(),
            is_active: 'Y',
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
            asset_movement_assets: {
              create: [
                {
                  asset_id: ticket.asset_id,
                  createdby: userId,
                  createdate: new Date(),
                  log_inst: 1,
                },
              ],
            },
          },
        });

        await tx.asset_master.update({
          where: { id: ticket.asset_id },
          data: {
            depot_id: toDepot.id,
            outlet_id: null,
            current_location: toDepot.name,
            current_status: 'Under repair',
            updatedate: new Date(),
            updatedby: userId,
          },
        });

        await tx.coolers.updateMany({
          where: { asset_master_id: ticket.asset_id },
          data: {
            status: 'Removed',
            asset_movement_id: returnMovement.id,
            updatedate: new Date(),
            updatedby: userId,
          },
        });

        let standbyMovement: any = null;
        if (standbyAsset && fromCustomer?.id) {
          standbyMovement = await deployStandbyCoolerTx(tx, {
            standbyAsset,
            fromCustomerId: fromCustomer.id,
            fromCustomerName: fromCustomer.name,
            depotId: toDepot.id,
            moveDate,
            userId,
            jobNumber,
          });
        }

        const updatedTicket = await tx.asset_maintenance.update({
          where: { id: ticketId },
          data: {
            status: 'at_workshop',
            updatedby: userId,
            updatedate: new Date(),
          },
          include: {
            asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
            asset_maintenance_technician: true,
            spares: true,
          },
        });

        return { returnMovement, standbyMovement, updatedTicket };
      });

      const returnMovementCode = `MV-${String(txResult.returnMovement.id).padStart(5, '0')}`;
      const standbyMovementCode = txResult.standbyMovement
        ? `MV-${String(txResult.standbyMovement.id).padStart(5, '0')}`
        : null;

      await logAssetActivity({
        assetId: ticket.asset_id,
        eventType: 'maintenance',
        title: `Returned to ${toDepot.name} by ${returnMovementCode}`,
        description:
          standbyAsset && standbyMovementCode && fromCustomer
            ? `Asset status: Under repair · Standby cooler ${standbyAsset.serial_number} installed at ${fromCustomer.name} (${standbyMovementCode})`
            : 'Asset status: Under repair',
        status: 'at_workshop',
        locationName: toDepot.name,
        customerId: fromCustomer?.id || null,
        depotId: toDepot.id,
        performedBy: userId,
        sourceTable: 'asset_maintenance',
        sourceId: ticket.id,
        meta: {
          return_movement_id: txResult.returnMovement.id,
          return_movement_code: returnMovementCode,
          depot_id: toDepot.id,
          depot_name: toDepot.name,
          from_customer_id: fromCustomer?.id || null,
          from_customer_name: fromCustomer?.name || null,
          standby_asset_id: standbyAsset?.id || null,
          standby_serial: standbyAsset?.serial_number || null,
          standby_movement_id: txResult.standbyMovement?.id || null,
          standby_movement_code: standbyMovementCode,
        },
      });

      await logAssetActivity({
        assetId: ticket.asset_id,
        eventType: 'movement',
        title: `Return ${returnMovementCode} to ${toDepot.name}`,
        description: `Returned for workshop job ${jobNumber}`,
        status: 'Under repair',
        locationName: toDepot.name,
        customerId: fromCustomer?.id || null,
        depotId: toDepot.id,
        performedBy: userId,
        sourceTable: 'asset_movements',
        sourceId: txResult.returnMovement.id,
      });

      if (standbyAsset && txResult.standbyMovement && fromCustomer) {
        await logAssetActivity({
          assetId: standbyAsset.id,
          eventType: 'movement',
          title: `Standby installed at ${fromCustomer.name} (${standbyMovementCode})`,
          description: `Replacement during workshop repair of ${master.serial_number} (${jobNumber})`,
          status: 'Installed',
          locationName: fromCustomer.name,
          customerId: fromCustomer.id,
          depotId: toDepot.id,
          performedBy: userId,
          sourceTable: 'asset_movements',
          sourceId: txResult.standbyMovement.id,
        });
      }

      const [replaceReview, activities] = await Promise.all([
        checkReplaceReview(ticket.asset_id),
        fetchTicketActivities(ticket.id),
      ]);

      return res.json({
        message: 'Workshop return movement created successfully',
        data: serializeAssetMaintenance(
          txResult.updatedTicket,
          replaceReview,
          undefined,
          activities
        ),
      });
    } catch (error: any) {
      console.error('Create Workshop Return Movement Error:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Installs a standby cooler at the origin outlet for an already-returned
   * workshop maintenance ticket.
   */
  async installStandbyCooler(req: any, res: Response) {
    try {
      const ticketId = Number(req.params.id);
      const { depot_id, standby_asset_id, movement_date } = req.body || {};

      const ticket = await prisma.asset_maintenance.findUnique({
        where: { id: ticketId },
        include: {
          asset_maintenance_master: ASSET_MAINTENANCE_MASTER_INCLUDE,
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ message: 'Maintenance ticket not found' });
      }

      const currentStatus = (ticket.status || '').toLowerCase();
      if (currentStatus === 'closed') {
        return res.status(400).json({
          message: 'Cannot install standby cooler for a closed ticket',
        });
      }

      const existingActivities = await fetchTicketActivities(ticket.id);
      const alreadyHasStandby = existingActivities.some(
        (a: any) => a.metadata && a.metadata.standby_movement_code
      );
      if (alreadyHasStandby) {
        return res.status(400).json({
          message: 'A standby cooler is already installed for this ticket',
        });
      }

      const returnAct = [...existingActivities]
        .reverse()
        .find((a: any) => a.metadata && a.metadata.return_movement_code);
      const master = ticket.asset_maintenance_master;
      let fromCustomerId: number | null =
        returnAct?.metadata?.from_customer_id || master?.outlet_id || null;
      let fromCustomerName: string =
        returnAct?.metadata?.from_customer_name ||
        master?.asset_master_outlet?.name ||
        'Outlet';
      let fallbackDepotId: number | null =
        returnAct?.metadata?.depot_id ||
        master?.depot_id ||
        master?.asset_master_outlet?.depot_id ||
        null;

      if (!fromCustomerId && master?.serial_number) {
        const custAsset = await prisma.customer_assets.findFirst({
          where: { serial_number: master.serial_number },
          include: {
            customer_assets_customers: {
              select: { id: true, name: true, depot_id: true },
            },
          },
        });
        if (custAsset?.customer_assets_customers) {
          fromCustomerId = custAsset.customer_assets_customers.id;
          fromCustomerName = custAsset.customer_assets_customers.name;
          fallbackDepotId =
            fallbackDepotId || custAsset.customer_assets_customers.depot_id;
        }
      }

      if (!fromCustomerId) {
        return res.status(400).json({
          message:
            'Original outlet could not be determined for standby install',
        });
      }

      const resolvedDepotId = Number(depot_id || fallbackDepotId);
      if (!resolvedDepotId) {
        return res
          .status(400)
          .json({ message: 'Source depot is required for standby cooler' });
      }

      const standbyAsset = standby_asset_id
        ? await prisma.asset_master.findUnique({
            where: { id: Number(standby_asset_id) },
            select: { id: true, name: true, code: true, serial_number: true },
          })
        : await prisma.asset_master.findFirst({
            where: {
              depot_id: resolvedDepotId,
              outlet_id: null,
              current_status: 'Available',
              is_active: 'Y',
              id: { not: ticket.asset_id },
            },
            select: { id: true, name: true, code: true, serial_number: true },
          });

      if (!standbyAsset) {
        return res.status(404).json({
          message: 'No available standby cooler found at selected depot',
        });
      }
      if (standbyAsset.id === ticket.asset_id) {
        return res.status(400).json({
          message: 'Standby cooler cannot be the same as the broken cooler',
        });
      }

      const userId = req.user?.id || ticket.technician_id || 1;
      const moveDate = movement_date ? new Date(movement_date) : new Date();
      const jobNumber =
        ticket.job_number || `MT-${String(ticket.id).padStart(5, '0')}`;

      const standbyMovement = await prisma.$transaction(tx =>
        deployStandbyCoolerTx(tx, {
          standbyAsset,
          fromCustomerId,
          fromCustomerName,
          depotId: resolvedDepotId,
          moveDate,
          userId,
          jobNumber,
        })
      );

      const standbyMovementCode = `MV-${String(standbyMovement.id).padStart(5, '0')}`;

      await logAssetActivity({
        assetId: ticket.asset_id,
        eventType: 'maintenance',
        title: `Standby cooler ${standbyAsset.serial_number} installed`,
        description: `Installed at ${fromCustomerName} (${standbyMovementCode})`,
        status: ticket.status,
        locationName: fromCustomerName,
        customerId: fromCustomerId,
        depotId: resolvedDepotId,
        performedBy: userId,
        sourceTable: 'asset_maintenance',
        sourceId: ticket.id,
        meta: {
          standby_asset_id: standbyAsset.id,
          standby_serial: standbyAsset.serial_number,
          standby_movement_id: standbyMovement.id,
          standby_movement_code: standbyMovementCode,
        },
      });

      await logAssetActivity({
        assetId: standbyAsset.id,
        eventType: 'movement',
        title: `Standby installed at ${fromCustomerName} (${standbyMovementCode})`,
        description: `Replacement during workshop repair of ${master?.serial_number || ticket.asset_id} (${jobNumber})`,
        status: 'Installed',
        locationName: fromCustomerName,
        customerId: fromCustomerId,
        depotId: resolvedDepotId,
        performedBy: userId,
        sourceTable: 'asset_movements',
        sourceId: standbyMovement.id,
      });

      const [replaceReview, activities] = await Promise.all([
        checkReplaceReview(ticket.asset_id),
        fetchTicketActivities(ticket.id),
      ]);

      return res.json({
        message: 'Standby cooler installed successfully',
        data: serializeAssetMaintenance(
          ticket,
          replaceReview,
          undefined,
          activities,
          true
        ),
      });
    } catch (error: any) {
      console.error('Install Standby Cooler Error:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Retrieves quick summary stats for top KPI cards, optionally filtered by technician.
   */
  async getMaintenanceDashboardStats(req: Request, res: Response) {
    try {
      const { technician_id } = req.query as any;
      const technicianIdParam = technician_id
        ? String(technician_id).trim()
        : '';
      const hasTechFilter = Boolean(
        technicianIdParam && technicianIdParam !== 'all'
      );
      const isUnassigned =
        hasTechFilter &&
        (technicianIdParam === 'unassigned' ||
          technicianIdParam === 'null' ||
          technicianIdParam === '0');
      const techIdNum =
        hasTechFilter && !isUnassigned && !isNaN(Number(technicianIdParam))
          ? Number(technicianIdParam)
          : undefined;

      const techFilterClause: any = hasTechFilter
        ? isUnassigned
          ? { technician_id: null }
          : techIdNum !== undefined
            ? { technician_id: techIdNum }
            : {}
        : {};

      const now = new Date();
      const baseStatsWhere: any = {
        is_active: 'Y',
        ...techFilterClause,
      };

      const [openJobs, overdueJobs, newComplaints, closedJobs] =
        await Promise.all([
          prisma.asset_maintenance.count({
            where: {
              ...baseStatsWhere,
              status: {
                not: 'closed',
              },
            },
          }),
          prisma.asset_maintenance.count({
            where: {
              ...baseStatsWhere,
              status: { not: 'closed' },
              due_date: { lt: now },
            },
          }),
          prisma.customer_complaints.count({
            where: { status: 'P' },
          }),
          prisma.asset_maintenance.count({
            where: { ...baseStatsWhere, status: 'closed' },
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
