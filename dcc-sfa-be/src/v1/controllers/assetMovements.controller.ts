import type { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { createAssetMovementApprovalWorkflow } from '../../helpers';
import { createRequest } from './requests.controller';
import { ContractGenerationService } from '../../services/contractGeneration.service';

interface AssetMovementSerialized {
  id: number;
  asset_ids: number[];
  from_direction?: string | null;
  from_depot_id?: number | null;
  from_customer_id?: number | null;
  to_direction?: string | null;
  to_depot_id?: number | null;
  to_customer_id?: number | null;
  movement_type?: string | null;
  movement_date: Date;
  performed_by: number;
  notes?: string | null;
  status?: string | null;
  approval_status?: string | null;
  approved_by?: number | null;
  approved_at?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  contract_url?: string | null;
  asset_movement_assets?: {
    id: number;
    asset_id: number;
    asset_master: {
      id: number;
      name: string;
      serial_number: string;
      asset_master_asset_types?: {
        id: number;
        name: string;
      } | null;
    };
  }[];
  asset_movement_from_depot?: {
    id: number;
    name: string;
  } | null;
  asset_movement_from_customer?: {
    id: number;
    name: string;
  } | null;
  asset_movement_to_depot?: {
    id: number;
    name: string;
  } | null;
  asset_movement_to_customer?: {
    id: number;
    name: string;
  } | null;
  asset_movements_performed_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  current_approver?: string | null;
}

const serializeAssetMovement = (
  movement: any,
  currentApprover: string | null = null
): AssetMovementSerialized => {
  return {
    id: movement.id,
    asset_ids:
      movement.asset_movement_assets?.map((aa: any) => aa.asset_id) || [],
    from_direction: movement.from_direction,
    from_depot_id: movement.from_depot_id,
    from_customer_id: movement.from_customer_id,
    to_direction: movement.to_direction,
    to_depot_id: movement.to_depot_id,
    to_customer_id: movement.to_customer_id,
    movement_type: movement.movement_type,
    movement_date: movement.movement_date,
    performed_by: movement.performed_by,
    notes: movement.notes,
    status: movement.status,
    approval_status: movement.approval_status,
    current_approver: currentApprover || null,
    approved_by: movement.approved_by,
    approved_at: movement.approved_at,
    is_active: movement.is_active,
    createdate: movement.createdate,
    createdby: movement.createdby,
    updatedate: movement.updatedate,
    updatedby: movement.updatedby,
    log_inst: movement.log_inst,
    contract_url:
      movement.asset_movements_generated_contract?.[0]?.contract_url || null,
    asset_movement_assets:
      movement.asset_movement_assets?.map((aa: any) => ({
        id: aa.id,
        asset_id: aa.asset_id,
        asset_master: aa.asset_movement_assets_asset
          ? {
            id: aa.asset_movement_assets_asset.id,
            name: aa.asset_movement_assets_asset.name,
            serial_number: aa.asset_movement_assets_asset.serial_number,
            asset_master_asset_types: aa.asset_movement_assets_asset
              .asset_master_asset_types
              ? {
                id: aa.asset_movement_assets_asset.asset_master_asset_types
                  .id,
                name: aa.asset_movement_assets_asset
                  .asset_master_asset_types.name,
              }
              : null,
          }
          : null,
      })) || [],
    asset_movement_from_depot: movement.asset_movement_from_depot
      ? {
        id: movement.asset_movement_from_depot.id,
        name: movement.asset_movement_from_depot.name,
      }
      : null,
    asset_movement_from_customer: movement.asset_movement_from_customer
      ? {
        id: movement.asset_movement_from_customer.id,
        name: movement.asset_movement_from_customer.name,
      }
      : null,
    asset_movement_to_depot: movement.asset_movement_to_depot
      ? {
        id: movement.asset_movement_to_depot.id,
        name: movement.asset_movement_to_depot.name,
      }
      : null,
    asset_movement_to_customer: movement.asset_movement_to_customer
      ? {
        id: movement.asset_movement_to_customer.id,
        name: movement.asset_movement_to_customer.name,
      }
      : null,
    asset_movements_performed_by: movement.asset_movements_performed_by
      ? {
        id: movement.asset_movements_performed_by.id,
        name: movement.asset_movements_performed_by.name,
        email: movement.asset_movements_performed_by.email,
      }
      : null,
  };
};

const COOLER_APPROVAL_STATUS = {
  PENDING: 'P',
  APPROVED: 'A',
} as const;

const COOLER_PENDING_VALUES = ['P', 'pending'] as const;

const isInstallationMovementDepotToOutlet = (movement: {
  movement_type?: string | null;
  from_direction?: string | null;
  to_direction?: string | null;
}): boolean => {
  return (
    movement.movement_type?.toLowerCase() === 'installation' &&
    movement.from_direction?.toLowerCase() === 'depot' &&
    movement.to_direction?.toLowerCase() === 'outlet'
  );
};

const createCoolerInstallationsForMovement = async (
  movement: {
    id: number;
    to_customer_id?: number | null;
    from_depot_id?: number | null;
    movement_date: Date;
    performed_by: number;
    createdby: number;
    log_inst?: number | null;
  },
  assetIds: number[],
  approvalExists: boolean,
  isApproved: boolean,
  performedByUserId: number
): Promise<void> => {
  const needsApproval = approvalExists && !isApproved;
  const coolerStatus = needsApproval ? 'Ready To Install' : 'Installed';
  const coolerApprovalStatus = needsApproval
    ? COOLER_APPROVAL_STATUS.PENDING
    : COOLER_APPROVAL_STATUS.APPROVED;

  console.log(
    `[createCoolerInstallations] movementId=${movement.id} ` +
    `approvalExists=${approvalExists} isApproved=${isApproved} ` +
    `→ coolerStatus="${coolerStatus}" coolerApprovalStatus="${coolerApprovalStatus}" ` +
    `assetIds=${JSON.stringify(assetIds)}`
  );

  for (const assetId of assetIds) {
    try {
      const assetMaster = await prisma.asset_master.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          name: true,
          code: true,
          serial_number: true,
          depot_id: true,
          outlet_id: true,
          current_status: true,
          current_location: true,
          asset_type_id: true,
          asset_master_asset_types: { select: { id: true, name: true } },
        },
      });

      if (!assetMaster) {
        console.warn(
          `[createCoolerInstallations] Asset ${assetId} not found – skipping`
        );
        continue;
      }

      if (!movement.to_customer_id) {
        console.warn(
          `[createCoolerInstallations] movement ${movement.id} has no to_customer_id – ` +
          `cannot create cooler for asset ${assetId}`
        );
        continue;
      }

      const existingCooler = await prisma.coolers.findFirst({
        where: {
          asset_master_id: assetId,
          approval_status: { in: [...COOLER_PENDING_VALUES, 'A', 'approved'] },
        },
      });

      if (existingCooler) {
        console.log(
          `[createCoolerInstallations] Cooler already exists for asset ${assetId} ` +
          `(id=${existingCooler.id} approval_status="${existingCooler.approval_status}") – skipping`
        );
        continue;
      }

      const newCooler = await prisma.coolers.create({
        data: {
          customer_id: movement.to_customer_id,
          code: assetMaster.code || `COOL-${assetId}-${movement.id}`,
          asset_master_id: assetId,
          asset_movement_id: movement.id,
          serial_number: assetMaster.serial_number,
          install_date: !needsApproval
            ? new Date(movement.movement_date)
            : undefined,
          status: coolerStatus,
          approval_status: coolerApprovalStatus,
          is_active: 'Y',
          createdby: performedByUserId,
          createdate: new Date(),
          log_inst: movement.log_inst || 1,
        },
      });

      console.log(
        `[createCoolerInstallations] Created cooler id=${newCooler.id} ` +
        `for asset ${assetId} with status="${coolerStatus}" approval_status="${coolerApprovalStatus}"`
      );
    } catch (coolerError: any) {
      console.error(
        `[createCoolerInstallations] Error for asset ${assetId}:`,
        coolerError.message
      );
    }
  }
};

const approveCoolerInstallationsForMovement = async (
  movementId: number,
  assetIds: number[],
  approvedByUserId: number
): Promise<void> => {
  console.log(
    `[approveCoolerInstallations] movementId=${movementId} ` +
    `assetIds=${JSON.stringify(assetIds)} approvedBy=${approvedByUserId}`
  );

  const existingCoolers = await prisma.coolers.findMany({
    where: { asset_movement_id: movementId },
    select: {
      id: true,
      asset_master_id: true,
      status: true,
      approval_status: true,
    },
  });

  console.log(
    `[approveCoolerInstallations] Coolers found for movement ${movementId}:`,
    JSON.stringify(existingCoolers)
  );

  if (existingCoolers.length === 0) {
    console.log(
      `[approveCoolerInstallations] No coolers linked to movement ${movementId} – nothing to approve`
    );
    return;
  }

  const updateResult = await prisma.coolers.updateMany({
    where: {
      asset_movement_id: movementId,
      approval_status: { in: [...COOLER_PENDING_VALUES] },
    },
    data: {
      status: 'Installed',
      approval_status: COOLER_APPROVAL_STATUS.APPROVED,
      install_date: new Date(),
      updatedate: new Date(),
      updatedby: approvedByUserId,
    },
  });

  console.log(
    `[approveCoolerInstallations] updateMany result for movement ${movementId}:`,
    JSON.stringify(updateResult)
  );

  if (assetIds.length > 0) {
    try {
      await prisma.asset_master.updateMany({
        where: { id: { in: assetIds } },
        data: {
          current_status: 'Installed',
          updatedate: new Date(),
          updatedby: approvedByUserId,
        },
      });
      console.log(
        `[approveCoolerInstallations] asset_master updated for assetIds=${JSON.stringify(assetIds)}`
      );
    } catch (assetUpdateErr: any) {
      console.error(
        '[approveCoolerInstallations] Error updating asset_master:',
        assetUpdateErr.message
      );
    }
  }
};

export const assetMovementsController = {
  async createAssetMovements(req: Request, res: Response) {
    try {
      const data = req.body;
      const assetIds = Array.isArray(data.asset_ids)
        ? data.asset_ids
        : [data.asset_id];

      if (!assetIds.length || !data.performed_by || !data.movement_type) {
        return res.status(400).json({
          message:
            'asset_ids (array or single), performed_by, and movement_type are required',
        });
      }

      const currentAssets = await prisma.asset_master.findMany({
        where: { id: { in: assetIds } },
      });

      if (currentAssets.length !== assetIds.length) {
        return res.status(404).json({
          message: 'One or more assets not found',
          missing_assets: assetIds.filter(
            (id: number) => !currentAssets.find((asset: any) => asset.id === id)
          ),
        });
      }

      let assetStatusUpdate: string = '';
      let fromDepotId: number | null = null;
      let toDepotId: number | null = null;
      let fromCustomerId: number | null = null;
      let toCustomerId: number | null = null;
      let fromDirection: string = '';
      let toDirection: string = '';

      if (data.from_direction === 'depot' && data.from_depot_id) {
        fromDirection = 'depot';
        fromDepotId = data.from_depot_id;
      } else if (data.from_direction === 'outlet' && data.from_customer_id) {
        fromDirection = 'outlet';
        fromCustomerId = data.from_customer_id;
      }

      if (data.to_direction === 'depot' && data.to_depot_id) {
        toDirection = 'depot';
        toDepotId = data.to_depot_id;
      } else if (data.to_direction === 'outlet' && data.to_customer_id) {
        toDirection = 'outlet';
        toCustomerId = data.to_customer_id;
      }

      if (fromDepotId) {
        const fromDepot = await prisma.depots.findUnique({
          where: { id: fromDepotId },
        });
        if (!fromDepot) {
          return res.status(400).json({ message: 'From depot not found' });
        }
      }

      if (toDepotId) {
        const toDepot = await prisma.depots.findUnique({
          where: { id: toDepotId },
        });
        if (!toDepot) {
          return res.status(400).json({ message: 'To depot not found' });
        }
      }

      if (fromCustomerId) {
        const fromCustomer = await prisma.customers.findUnique({
          where: { id: fromCustomerId },
        });
        if (!fromCustomer) {
          return res.status(400).json({ message: 'From customer not found' });
        }
      }

      if (toCustomerId) {
        const toCustomer = await prisma.customers.findUnique({
          where: { id: toCustomerId },
        });
        if (!toCustomer) {
          return res.status(400).json({ message: 'To customer not found' });
        }
      }

      switch (data.movement_type.toLowerCase()) {
        case 'transfer':
          assetStatusUpdate = 'Available';
          break;
        case 'maintenance':
        case 'repair':
          assetStatusUpdate = 'Under Maintenance';
          console.log(
            `Maintenance records will be created after approval for maintenance/repair movement`
          );
          break;
        case 'installation':
          assetStatusUpdate = 'Installed';
          break;
        case 'disposal':
          assetStatusUpdate = 'Retired';
          break;
        case 'return':
          assetStatusUpdate = 'Available';
          break;
        default:
          return res.status(400).json({
            message:
              'Invalid movement_type. Must be one of: transfer, maintenance, repair, disposal, return, installation',
          });
      }

      const isDepotToOutletMovement =
        fromDirection === 'depot' && toDirection === 'outlet';
      const isInstallation =
        data.movement_type.toLowerCase() === 'installation' &&
        isDepotToOutletMovement;

      const assetMovement = await prisma.$transaction(async tx => {
        return await tx.asset_movements.create({
          data: {
            from_direction: data.from_direction,
            to_direction: data.to_direction,
            from_depot_id: fromDepotId,
            from_customer_id: fromCustomerId,
            to_depot_id: toDepotId,
            to_customer_id: toCustomerId,
            movement_type: data.movement_type,
            movement_date: new Date(data.movement_date),
            performed_by: data.performed_by,
            notes: data.notes,
            status: 'P',
            is_active: data.is_active || 'Y',
            createdby: req.user?.id || 1,
            createdate: new Date(),
            log_inst: data.log_inst || 1,
            asset_movement_assets: {
              create: assetIds.map((assetId: number) => ({
                asset_id: assetId,
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              })),
            },
          },
          include: {
            asset_movement_assets: {
              include: {
                asset_movement_assets_asset: {
                  include: {
                    asset_master_asset_types: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
            asset_movements_performed_by: true,
            asset_movement_from_depot: {
              select: { id: true, name: true },
            },
            asset_movement_from_customer: {
              select: { id: true, name: true },
            },
            asset_movement_to_depot: {
              select: { id: true, name: true },
            },
            asset_movement_to_customer: {
              select: { id: true, name: true },
            },
          },
        });
      });

      try {
        const assetUpdateData: any = {
          current_status: assetStatusUpdate,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        };

        if (isDepotToOutletMovement) {
          assetUpdateData.installation_date = new Date();
        }

        await prisma.asset_master.updateMany({
          where: {
            id: { in: assetIds },
          },
          data: assetUpdateData,
        });

        console.log(
          `Asset Master records updated for ${assetIds.length} assets during movement`
        );
      } catch (updateError) {
        console.error('Error updating asset master records:', updateError);
      }

      setTimeout(async () => {
        try {
          await createRequest({
            requester_id: data.performed_by,
            request_type: 'ASSET_MOVEMENT_APPROVAL',
            reference_id: assetMovement.id,
            createdby: req.user?.id || 1,
            log_inst: 1,
          });

          console.log(
            `Legacy approval request created for asset movement: ${assetMovement.id}`
          );
        } catch (requestError) {
          console.error(
            'Error creating legacy approval request:',
            requestError
          );
        }
      }, 500);

      if (isInstallation) {
        setImmediate(async () => {
          try {
            await createCoolerInstallationsForMovement(
              {
                id: assetMovement.id,
                to_customer_id: toCustomerId,
                from_depot_id: fromDepotId,
                movement_date: assetMovement.movement_date,
                performed_by: assetMovement.performed_by,
                createdby: assetMovement.createdby,
                log_inst: assetMovement.log_inst,
              },
              assetIds,
              true,
              false,
              req.user?.id || data.performed_by
            );
          } catch (coolerErr) {
            console.error(
              'Error creating cooler installations on movement create:',
              coolerErr
            );
          }
        });
      }

      return res.status(201).json({
        message: 'Asset movement created successfully',
        data: serializeAssetMovement(assetMovement),
      });
    } catch (error: any) {
      console.error('Create Asset Movement Error:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetMovements(req: any, res: any) {
    try {
      const { page, limit, search, status, asset_type_id, performed_by } =
        req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            {
              asset_movement_assets: {
                some: {
                  asset_movement_assets_asset: {
                    OR: [
                      { serial_number: { contains: searchLower } },
                      { current_location: { contains: searchLower } },
                      { current_status: { contains: searchLower } },
                      { assigned_to: { contains: searchLower } },
                      {
                        asset_master_asset_types: {
                          name: { contains: searchLower },
                        },
                      },
                    ],
                  },
                },
              },
            },
            { from_direction: { contains: searchLower } },
            { to_direction: { contains: searchLower } },
            { movement_type: { contains: searchLower } },
            { notes: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(performed_by && { performed_by: Number(performed_by) }),
        ...(asset_type_id && {
          asset_movement_assets: {
            some: {
              asset_movement_assets_asset: {
                asset_type_id: Number(asset_type_id),
              },
            },
          },
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_movements,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_movement_assets: {
            include: {
              asset_movement_assets_asset: {
                include: {
                  asset_master_asset_types: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          asset_movements_performed_by: true,
          asset_movement_from_depot: {
            select: { id: true, name: true },
          },
          asset_movement_from_customer: {
            select: { id: true, name: true },
          },
          asset_movement_to_depot: {
            select: { id: true, name: true },
          },
          asset_movement_to_customer: {
            select: { id: true, name: true },
          },
          asset_movements_generated_contract: {
            select: { contract_url: true },
            orderBy: { createdate: 'desc' },
            take: 1,
          },
        },
      });

      // Get current pending approvers
      const movementIds = data.map((m: any) => m.id);
      const approvalRequests = await prisma.sfa_d_requests.findMany({
        where: {
          reference_id: { in: movementIds },
          request_type: 'ASSET_MOVEMENT_APPROVAL',
        },
        include: {
          sfa_d_requests_approvals_request: {
            where: {
              status: 'P',
            },
            orderBy: {
              sequence: 'asc',
            },
            include: {
              sfa_d_requests_approvals_approver: {
                select: {
                  name: true,
                  employee_id: true,
                  email: true,
                  profile_image: true,
                },
              },
            },
          },
        },
      });

      const approverMap = new Map<number, string>();
      for (const req of approvalRequests) {
        if (
          req.reference_id !== null &&
          req.sfa_d_requests_approvals_request.length > 0
        ) {
          const firstPendingStep = req.sfa_d_requests_approvals_request[0];
          if (firstPendingStep.sfa_d_requests_approvals_approver) {
            const approver = firstPendingStep.sfa_d_requests_approvals_approver;
            approverMap.set(
              req.reference_id,
              JSON.stringify({
                name: approver.name,
                email: approver.email || '',
                profile_image: approver.profile_image || null,
                employee_id: approver.employee_id || '',
              })
            );
          }
        }
      }

      const totalAssetMovements = await prisma.asset_movements.count();
      const activeAssetMovements = await prisma.asset_movements.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssetMovements = await prisma.asset_movements.count({
        where: { is_active: 'N' },
      });
      const thisMonthAssetMovements = await prisma.asset_movements.count({
        where: {
          createdate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
          },
        },
      });

      res.success(
        'Asset movements retrieved successfully',
        data.map((m: any) => serializeAssetMovement(m, approverMap.get(m.id))),
        200,
        pagination,
        {
          total_records: totalAssetMovements,
          active_records: activeAssetMovements,
          inactive_records: inactiveAssetMovements,
          this_month_records: thisMonthAssetMovements,
        }
      );
    } catch (error: any) {
      console.error('Get Asset Movements Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetMovementsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movement = await prisma.asset_movements.findUnique({
        where: { id: Number(id) },
        include: {
          asset_movement_assets: {
            include: {
              asset_movement_assets_asset: {
                include: {
                  asset_master_asset_types: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          asset_movements_performed_by: true,
          asset_movement_from_depot: {
            select: { id: true, name: true },
          },
          asset_movement_from_customer: {
            select: { id: true, name: true },
          },
          asset_movement_to_depot: {
            select: { id: true, name: true },
          },
          asset_movement_to_customer: {
            select: { id: true, name: true },
          },
          asset_movements_generated_contract: {
            select: { contract_url: true },
            orderBy: { createdate: 'desc' },
            take: 1,
          },
        },
      });

      if (!movement) {
        return res.status(404).json({ message: 'Asset movement not found' });
      }

      let currentApproverName: string | null = null;
      const request = await prisma.sfa_d_requests.findFirst({
        where: {
          reference_id: movement.id,
          request_type: 'ASSET_MOVEMENT_APPROVAL',
        },
        include: {
          sfa_d_requests_approvals_request: {
            where: {
              status: 'P',
            },
            orderBy: {
              sequence: 'asc',
            },
            take: 1,
            include: {
              sfa_d_requests_approvals_approver: {
                select: {
                  name: true,
                  email: true,
                  profile_image: true,
                  employee_id: true,
                },
              },
            },
          },
        },
      });

      if (request && request.sfa_d_requests_approvals_request.length > 0) {
        const firstPendingStep = request.sfa_d_requests_approvals_request[0];
        const approver = firstPendingStep.sfa_d_requests_approvals_approver;
        currentApproverName = approver
          ? JSON.stringify({
            name: approver.name,
            email: approver.email || '',
            profile_image: approver.profile_image || null,
            employee_id: approver.employee_id || '',
          })
          : null;
      }

      res.json({
        message: 'Asset movement fetched successfully',
        data: serializeAssetMovement(movement, currentApproverName),
      });
    } catch (error: any) {
      console.error('Get Asset Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetMovements(req: any, res: any) {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await prisma.asset_movements.findUnique({
        where: { id: Number(id) },
        include: {
          asset_movement_assets: {
            select: { asset_id: true },
          },
        },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Asset movement not found' });
      }

      const { asset_ids, priority, ...updateData } = data;

      const validUpdateData: any = {};
      const allowedFields = [
        'from_direction',
        'to_direction',
        'movement_type',
        'movement_date',
        'performed_by',
        'notes',
        'status',
        'approval_status',
        'approved_by',
        'approved_at',
        'from_depot_id',
        'from_customer_id',
        'to_depot_id',
        'to_customer_id',
        'is_active',
        'updatedby',
        'updatedate',
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          validUpdateData[field] = updateData[field];
        }
      });

      const wasApproved = existing.approval_status === 'A';
      const becomingApproved =
        !wasApproved && validUpdateData.approval_status === 'A';

      if (
        wasApproved &&
        (updateData.asset_ids ||
          updateData.from_direction ||
          updateData.to_direction ||
          updateData.movement_type ||
          updateData.performed_by ||
          updateData.notes)
      ) {
        console.log(
          `Asset movement ${id} was approved; resetting approval_status due to edit`
        );
        validUpdateData.approval_status = 'P';
        validUpdateData.approved_by = null;
        validUpdateData.approved_at = null;

        setTimeout(async () => {
          try {
            await createAssetMovementApprovalWorkflow(
              Number(id),
              `AMV-${Number(id).toString().padStart(5, '0')}`,
              existing.performed_by,
              'medium',
              {
                asset_ids: updateData.asset_ids || [],
                from_direction:
                  updateData.from_direction || existing.from_direction,
                to_direction: updateData.to_direction || existing.to_direction,
                from_depot_id:
                  updateData.from_depot_id || existing.from_depot_id,
                from_customer_id:
                  updateData.from_customer_id || existing.from_customer_id,
                to_depot_id: updateData.to_depot_id || existing.to_depot_id,
                to_customer_id:
                  updateData.to_customer_id || existing.to_customer_id,
                movement_type:
                  updateData.movement_type || existing.movement_type,
                movement_date:
                  updateData.movement_date || existing.movement_date,
                notes: updateData.notes || existing.notes,
              },
              req.user?.id || 1
            );
          } catch (workflowError) {
            console.error(
              'Error creating approval workflow for updated movement:',
              workflowError
            );
          }

          try {
            await createRequest({
              requester_id: existing.performed_by,
              request_type: 'ASSET_MOVEMENT_APPROVAL',
              reference_id: Number(id),
              createdby: req.user?.id || 1,
              log_inst: 1,
            });
          } catch (requestError) {
            console.error(
              'Error creating approval request for updated movement:',
              requestError
            );
          }
        }, 500);
      }

      const updated = await prisma.$transaction(async tx => {
        await tx.asset_movements.update({
          where: { id: Number(id) },
          data: {
            ...validUpdateData,
            movement_date: validUpdateData.movement_date
              ? new Date(validUpdateData.movement_date)
              : undefined,
            updatedby: req.user?.id || 1,
            updatedate: new Date(),
          },
        });

        if (asset_ids && Array.isArray(asset_ids)) {
          await tx.asset_movement_assets.deleteMany({
            where: { movement_id: Number(id) },
          });
          if (asset_ids.length > 0) {
            await tx.asset_movement_assets.createMany({
              data: asset_ids.map((assetId: number) => ({
                movement_id: Number(id),
                asset_id: assetId,
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              })),
            });
          }
        }

        return tx.asset_movements.findUnique({
          where: { id: Number(id) },
          include: {
            asset_movement_assets: {
              include: {
                asset_movement_assets_asset: {
                  include: {
                    asset_master_asset_types: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
            asset_movements_performed_by: true,
            asset_movement_from_depot: { select: { id: true, name: true } },
            asset_movement_from_customer: { select: { id: true, name: true } },
            asset_movement_to_depot: { select: { id: true, name: true } },
            asset_movement_to_customer: { select: { id: true, name: true } },
            asset_movements_generated_contract: {
              select: { contract_url: true },
              orderBy: { createdate: 'desc' },
              take: 1,
            },
          },
        });
      });

      if (becomingApproved && updated && isInstallationMovementDepotToOutlet(updated)) {
        const effectiveAssetIds: number[] =
          asset_ids && Array.isArray(asset_ids) && asset_ids.length > 0
            ? asset_ids
            : existing.asset_movement_assets.map((a: any) => a.asset_id);

        setImmediate(async () => {
          try {
            await approveCoolerInstallationsForMovement(
              Number(id),
              effectiveAssetIds,
              req.user?.id || 1
            );

            for (const assetId of effectiveAssetIds) {
              const linked = await prisma.coolers.findFirst({
                where: {
                  asset_movement_id: Number(id),
                  asset_master_id: assetId,
                },
              });
              if (!linked) {
                await createCoolerInstallationsForMovement(
                  {
                    id: Number(id),
                    to_customer_id: updated.to_customer_id,
                    from_depot_id: updated.from_depot_id,
                    movement_date: updated.movement_date,
                    performed_by: updated.performed_by,
                    createdby: updated.createdby,
                    log_inst: updated.log_inst,
                  },
                  [assetId],
                  false,
                  true,
                  req.user?.id || 1
                );
              }
            }
          } catch (coolerSyncErr) {
            console.error(
              'Error syncing cooler installations on movement approval:',
              coolerSyncErr
            );
          }
        });
      }

      return res.json({
        message: 'Asset movement updated successfully',
        data: serializeAssetMovement(updated),
      });
    } catch (error: any) {
      console.error('Update Asset Movement Error:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  // async deleteAssetMovements(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const existing = await prisma.asset_movements.findUnique({
  //       where: { id: Number(id) },
  //     });

  //     if (!existing) {
  //       return res.status(404).json({ message: 'Asset movement not found' });
  //     }

  //     await prisma.asset_movements.delete({ where: { id: Number(id) } });
  //     res.json({ message: 'Asset movement deleted successfully' });
  //   } catch (error: any) {
  //     console.error('Delete Asset Movement Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  async deleteAssetMovements(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movementId = Number(id);

      const existing = await prisma.asset_movements.findUnique({
        where: { id: movementId },
      });

      if (!existing) {
        return res.status(404).json({
          message: 'Asset movement not found',
        });
      }

      await prisma.$transaction(async tx => {
        await tx.asset_movement_contracts.deleteMany({
          where: {
            asset_movement_id: movementId,
          },
        });

        await tx.coolers.deleteMany({
          where: {
            asset_movement_id: movementId,
          },
        });

        await tx.asset_movement_assets.deleteMany({
          where: {
            movement_id: movementId,
          },
        });

        const requests = await tx.sfa_d_requests.findMany({
          where: {
            reference_id: movementId,
            request_type: 'ASSET_MOVEMENT_APPROVAL',
          },
          select: {
            id: true,
          },
        });

        const requestIds = requests.map(r => r.id);

        if (requestIds.length > 0) {
          await tx.sfa_d_request_approvals.deleteMany({
            where: {
              request_id: {
                in: requestIds,
              },
            },
          });

          await tx.sfa_d_requests.deleteMany({
            where: {
              id: {
                in: requestIds,
              },
            },
          });
        }

        await tx.asset_movements.delete({
          where: {
            id: movementId,
          },
        });
      });

      return res.json({
        message: 'Asset movement and all linked records deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Asset Movement Error:', error);

      return res.status(500).json({
        message: error.message,
      });
    }
  },
  async generateContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contractService = new ContractGenerationService();

      const assetMovement = await prisma.asset_movements.findUnique({
        where: { id: Number(id) },
      });

      if (!assetMovement) {
        return res.status(404).json({ message: 'Asset movement not found' });
      }

      if (assetMovement.approval_status !== 'A') {
        return res.status(400).json({
          message: 'Asset movement must be approved before generating contract',
        });
      }

      const existingContract =
        await contractService.getContractByAssetMovementId(Number(id));
      if (existingContract) {
        return res
          .status(400)
          .json({ message: 'Contract already exists for this asset movement' });
      }

      const contractRecord = await contractService.generateContractOnApproval(
        Number(id)
      );

      res.status(201).json({
        message: 'Contract generated and uploaded successfully',
        data: {
          contract_id: contractRecord.id,
          contract_number: contractRecord.contract_number,
          contract_url: contractRecord.contract_url,
          contract_date: contractRecord.contract_date,
        },
      });
    } catch (error: any) {
      console.error('Generate Contract Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async downloadContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contractService = new ContractGenerationService();

      const contract = await contractService.getContractByAssetMovementId(
        Number(id)
      );

      if (!contract) {
        return res
          .status(404)
          .json({ message: 'Contract not found for this asset movement' });
      }

      res.redirect(302, contract.contract_url);
    } catch (error: any) {
      console.error('Download Contract Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  async getContractInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contractService = new ContractGenerationService();

      const contract = await contractService.getContractByAssetMovementId(
        Number(id)
      );

      if (!contract) {
        return res
          .status(404)
          .json({ message: 'Contract not found for this asset movement' });
      }

      res.json({
        message: 'Contract info retrieved successfully',
        data: {
          contract_id: contract.id,
          contract_number: contract.contract_number,
          contract_url: contract.contract_url,
          contract_date: contract.contract_date,
        },
      });
    } catch (error: any) {
      console.error('Get Contract Info Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
