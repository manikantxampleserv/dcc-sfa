import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { createRequest } from './requests.controller';

interface CoolerInstallationSerialized {
  id: number;
  customer_id: number;
  code: string;
  asset_master_id?: number | null;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  capacity?: number | null;
  install_date?: string | null;
  last_service_date?: string | null;
  next_service_due?: string | null;
  cooler_type_id?: number | null;
  cooler_sub_type_id?: number | null;
  status?: string | null;
  temperature?: number | null;
  energy_rating?: string | null;
  warranty_expiry?: string | null;
  maintenance_contract?: string | null;
  technician_id?: number | null;
  last_scanned_date?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  approval_status?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
  customer?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  technician?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string | null;
  } | null;
  cooler_type?: {
    id: number;
    name: string;
    code: string;
  } | null;
  cooler_sub_type?: {
    id: number;
    name: string;
    code: string;
  } | null;
  asset_master?: {
    id: number;
    name?: string | null;
    serial_number?: string | null;
    current_status?: string | null;
    current_location?: string | null;
    asset_type?: {
      id: number;
      name: string;
    } | null;
    asset_sub_type?: {
      id: number;
      name: string;
    } | null;
    brand?: {
      id: number;
      name: string;
    } | null;
  } | null;
}

const serializeCoolerInstallation = (
  cooler: any
): CoolerInstallationSerialized => {
  const {
    coolers_customers: customer,
    users: technician,
    cooler_asset_master: asset_master,
  } = cooler;
  const {
    asset_master_asset_types: asset_type,
    asset_master_asset_sub_types: asset_sub_type,
    asset_master_brands: brand,
  } = asset_master || {};

  return {
    id: cooler.id,
    customer_id: cooler.customer_id,
    code: cooler.code,
    asset_master_id: cooler.asset_master_id,
    brand: cooler.brand,
    model: cooler.model,
    serial_number: cooler.serial_number,
    capacity: cooler.capacity,
    install_date: cooler.install_date?.toISOString(),
    last_service_date: cooler.last_service_date?.toISOString(),
    next_service_due: cooler.next_service_due?.toISOString(),
    cooler_type_id: cooler.cooler_type_id,
    cooler_sub_type_id: cooler.cooler_sub_type_id,
    status: cooler.status,
    temperature: cooler.temperature ? Number(cooler.temperature) : null,
    energy_rating: cooler.energy_rating,
    warranty_expiry: cooler.warranty_expiry?.toISOString(),
    maintenance_contract: cooler.maintenance_contract,
    technician_id: cooler.technician_id,
    last_scanned_date: cooler.last_scanned_date?.toISOString(),
    is_active: cooler.is_active,
    createdate: cooler.createdate?.toISOString(),
    createdby: cooler.createdby,
    updatedate: cooler.updatedate?.toISOString(),
    updatedby: cooler.updatedby,
    approval_status: cooler.approval_status,

    customer: customer
      ? { id: customer.id, name: customer.name, code: customer.code }
      : null,
    technician: technician
      ? {
          id: technician.id,
          name: technician.name,
          email: technician.email,
          profile_image: technician.profile_image,
        }
      : null,
    asset_master: asset_master
      ? {
          id: asset_master.id,
          name: asset_master?.name,
          serial_number: asset_master.serial_number,
          current_status: asset_master.current_status,
          current_location: asset_master.current_location,
          asset_type: asset_type
            ? { id: asset_type.id, name: asset_type.name }
            : null,
          asset_sub_type: asset_sub_type
            ? { id: asset_sub_type.id, name: asset_sub_type.name }
            : null,
          brand: brand ? { id: brand.id, name: brand.name } : null,
        }
      : null,
  };
};

export const coolerInstallationsController = {
  // async createCoolerInstallation(req: Request, res: Response) {
  //   try {
  //     const data = req.body;
  //     if (!data.customer_id) {
  //       return res.status(400).json({ message: 'Customer ID is required' });
  //     }

  //     const generateCode = async (): Promise<string> => {
  //       const prefix = 'COOL';
  //       const count = await prisma.coolers.count();
  //       const timestamp = Date.now().toString().slice(-6);
  //       return `${prefix}-${String(count + 1).padStart(4, '0')}-${timestamp}`;
  //     };

  //     let coolerCode: string;

  //     if (data.code && data.code.trim() !== '') {
  //       coolerCode = data.code.trim();

  //       const existingCooler = await prisma.coolers.findUnique({
  //         where: { code: coolerCode },
  //       });

  //       if (existingCooler) {
  //         return res
  //           .status(400)
  //           .json({ message: 'Cooler code already exists' });
  //       }
  //     } else {
  //       coolerCode = await generateCode();
  //       let attempts = 0;

  //       while (attempts < 10) {
  //         const existing = await prisma.coolers.findUnique({
  //           where: { code: coolerCode },
  //         });
  //         if (!existing) break;
  //         coolerCode = await generateCode();
  //         attempts++;
  //       }

  //       if (attempts >= 10) {
  //         return res
  //           .status(500)
  //           .json({ message: 'Unable to generate unique cooler code' });
  //       }
  //     }

  //     const cooler = await prisma.coolers.create({
  //       data: {
  //         ...data,
  //         code: coolerCode,
  //         createdby: data.createdby ? Number(data.createdby) : 1,
  //         log_inst: data.log_inst || 1,
  //         createdate: new Date(),
  //         install_date: data.install_date
  //           ? new Date(data.install_date)
  //           : undefined,
  //         last_service_date: data.last_service_date
  //           ? new Date(data.last_service_date)
  //           : undefined,
  //         next_service_due: data.next_service_due
  //           ? new Date(data.next_service_due)
  //           : undefined,
  //         warranty_expiry: data.warranty_expiry
  //           ? new Date(data.warranty_expiry)
  //           : undefined,
  //         last_scanned_date: data.last_scanned_date
  //           ? new Date(data.last_scanned_date)
  //           : undefined,
  //       },
  //       include: {
  //         coolers_customers: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //         },
  //         users: {
  //           select: {
  //             id: true,
  //             name: true,
  //             email: true,
  //             profile_image: true,
  //           },
  //         },
  //         cooler_types: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //         },
  //         cooler_sub_types: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //         },
  //         cooler_asset_master: {
  //           select: {
  //             id: true,
  //             name: true,
  //             serial_number: true,
  //             current_status: true,
  //             current_location: true,
  //             asset_master_asset_types: true,
  //             asset_master_asset_sub_types: true,
  //             asset_master_brands: true,
  //           },
  //         },
  //       },
  //     });

  //     if (cooler.asset_master_id) {
  //       try {
  //         const customer = cooler.coolers_customers;
  //         const toLocation = customer
  //           ? `${customer.name} (${customer.code})`
  //           : 'Customer Location';

  //         if (cooler.status === 'Installed') {
  //           await prisma.asset_master.update({
  //             where: { id: cooler.asset_master_id },
  //             data: {
  //               current_location: toLocation,
  //               current_status: 'Installed',
  //               updatedate: new Date(),
  //               updatedby: data.createdby ? Number(data.createdby) : 1,
  //             },
  //           });
  //         } else if (cooler.install_date) {
  //           await prisma.asset_master.update({
  //             where: { id: cooler.asset_master_id },
  //             data: {
  //               current_location: toLocation,
  //               current_status: 'In Use',
  //               updatedate: new Date(),
  //               updatedby: data.createdby ? Number(data.createdby) : 1,
  //             },
  //           });
  //         }
  //       } catch (movementError) {
  //         console.error('Error creating asset movement:', movementError);
  //       }
  //     }

  //     res.status(201).json({
  //       message: 'Cooler installation created successfully',
  //       data: serializeCoolerInstallation(cooler),
  //     });
  //   } catch (error: any) {
  //     console.error('Create Cooler Installation Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  //II -> cooler instaltion with approval
  // async createCoolerInstallation(req: Request, res: Response) {
  //   try {
  //     const data = req.body;
  //     const userId = req.user?.id || 1;

  //     if (!data.customer_id) {
  //       return res.status(400).json({ message: 'Customer ID is required' });
  //     }

  //     const generateReference = async (): Promise<string> => {
  //       const prefix = 'INST';
  //       const count = await prisma.coolers.count();
  //       const timestamp = Date.now().toString().slice(-6);
  //       return `${prefix}-${String(count + 1).padStart(4, '0')}-${timestamp}`;
  //     };

  //     let internalReferenceCode: string;

  //     if (data.code && data.code.trim() !== '') {
  //       internalReferenceCode = data.code.trim();

  //       const existing = await prisma.coolers.findUnique({
  //         where: { code: internalReferenceCode },
  //       });

  //       if (existing) {
  //         return res.status(400).json({ message: 'This code already exists' });
  //       }
  //     } else {
  //       internalReferenceCode = await generateReference();
  //       let attempts = 0;

  //       while (attempts < 10) {
  //         const existing = await prisma.coolers.findUnique({
  //           where: { code: internalReferenceCode },
  //         });
  //         if (!existing) break;
  //         internalReferenceCode = await generateReference();
  //         attempts++;
  //       }

  //       if (attempts >= 10) {
  //         return res
  //           .status(500)
  //           .json({ message: 'Unable to generate unique code' });
  //       }
  //     }

  //     let assetMasterData = null;
  //     if (data.asset_master_id) {
  //       assetMasterData = await prisma.asset_master.findUnique({
  //         where: { id: data.asset_master_id },
  //         select: {
  //           id: true,
  //           name: true,
  //           code: true,
  //           serial_number: true,
  //         },
  //       });

  //       if (!assetMasterData) {
  //         return res.status(400).json({ message: 'Asset Master not found' });
  //       }
  //     }

  //     const cooler = await prisma.coolers.create({
  //       data: {
  //         ...data,

  //         code: assetMasterData ? assetMasterData.code : internalReferenceCode,

  //         approval_status: 'P',

  //         createdby: data.createdby ? Number(data.createdby) : userId,

  //         log_inst: data.log_inst || 1,

  //         createdate: new Date(),

  //         install_date: data.install_date
  //           ? new Date(data.install_date)
  //           : undefined,

  //         last_service_date: data.last_service_date
  //           ? new Date(data.last_service_date)
  //           : undefined,

  //         next_service_due: data.next_service_due
  //           ? new Date(data.next_service_due)
  //           : undefined,

  //         warranty_expiry: data.warranty_expiry
  //           ? new Date(data.warranty_expiry)
  //           : undefined,

  //         last_scanned_date: data.last_scanned_date
  //           ? new Date(data.last_scanned_date)
  //           : undefined,
  //       },

  //       include: {
  //         coolers_customers: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //         },

  //         users: {
  //           select: {
  //             id: true,
  //             name: true,
  //             email: true,
  //             profile_image: true,
  //           },
  //         },

  //         cooler_types: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //         },

  //         cooler_sub_types: {
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //         },

  //         cooler_asset_master: {
  //           select: {
  //             id: true,
  //             name: true,
  //             serial_number: true,
  //             current_status: true,
  //             current_location: true,
  //             code: true,
  //             asset_master_asset_types: true,
  //             asset_master_asset_sub_types: true,
  //             asset_master_brands: true,
  //           },
  //         },
  //       },
  //     });

  //     const finalDisplayCode = assetMasterData?.code || cooler.code;

  //     try {
  //       const requestPayload = {
  //         requester_id: userId,
  //         request_type: 'COOLER_INSTALLATION_APPROVAL',
  //         reference_id: cooler.id,
  //         request_data: JSON.stringify({
  //           cooler_id: cooler.id,
  //           cooler_code: finalDisplayCode,
  //           customer_id: cooler.customer_id,
  //           asset_master_id: cooler.asset_master_id,
  //           install_date: cooler.install_date,
  //           status: cooler.status,
  //         }),
  //         createdby: userId,
  //         log_inst: 1,
  //       };

  //       await createRequest(requestPayload);

  //       console.log(
  //         `Approval request created for cooler installation ${cooler.id}`
  //       );
  //     } catch (approvalError) {
  //       console.error('Error creating approval workflow:', approvalError);
  //       return res.status(500).json({
  //         message: 'Cooler created but approval workflow creation failed',
  //       });
  //     }

  //     return res.status(201).json({
  //       message:
  //         'Cooler installation created and sent for approval successfully',
  //       data: {
  //         ...serializeCoolerInstallation(cooler),
  //         code: finalDisplayCode,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Create Cooler Installation Error:', error);
  //     return res.status(500).json({ message: error.message });
  //   }
  // },

  async createCoolerInstallation(req: Request, res: Response) {
    try {
      const data = req.body;
      const userId = req.user?.id || 1;

      if (!data.customer_id) {
        return res.status(400).json({
          message: 'Customer ID is required',
        });
      }

      if (!data.asset_master_id) {
        return res.status(400).json({
          message: 'Asset Master ID is required',
        });
      }

      // =====================================================
      // GET ASSET MASTER
      // =====================================================

      const assetMasterData = await prisma.asset_master.findUnique({
        where: {
          id: Number(data.asset_master_id),
        },

        select: {
          id: true,
          name: true,
          code: true,
          serial_number: true,
          depot_id: true,
          outlet_id: true,
          current_location: true,
          current_status: true,
        },
      });

      if (!assetMasterData) {
        return res.status(400).json({
          message: 'Asset Master not found',
        });
      }

      // =====================================================
      // CHECK IF ASSET ALREADY INSTALLED
      // =====================================================

      const existingCooler = await prisma.coolers.findFirst({
        where: {
          asset_master_id: Number(data.asset_master_id),
          approval_status: {
            in: ['P', 'A'],
          },
        },
      });

      if (existingCooler) {
        return res.status(400).json({
          message:
            'This asset already has an active/pending cooler installation',
        });
      }

      // =====================================================
      // CREATE COOLER INSTALLATION
      // =====================================================

      const cooler = await prisma.coolers.create({
        data: {
          ...data,

          // use asset code
          code: assetMasterData.code,

          approval_status: 'P',

          createdby: data.createdby ? Number(data.createdby) : userId,

          log_inst: data.log_inst || 1,

          createdate: new Date(),

          install_date: data.install_date
            ? new Date(data.install_date)
            : undefined,

          last_service_date: data.last_service_date
            ? new Date(data.last_service_date)
            : undefined,

          next_service_due: data.next_service_due
            ? new Date(data.next_service_due)
            : undefined,

          warranty_expiry: data.warranty_expiry
            ? new Date(data.warranty_expiry)
            : undefined,

          last_scanned_date: data.last_scanned_date
            ? new Date(data.last_scanned_date)
            : undefined,
        },

        include: {
          coolers_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          users: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_image: true,
            },
          },

          cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          cooler_sub_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          cooler_asset_master: {
            select: {
              id: true,
              name: true,
              code: true,
              serial_number: true,
              current_status: true,
              current_location: true,
              asset_master_asset_types: true,
              asset_master_asset_sub_types: true,
              asset_master_brands: true,
            },
          },
        },
      });

      // =====================================================
      // CREATE ASSET MOVEMENT
      // =====================================================

      const movement = await prisma.asset_movements.create({
        data: {
          movement_type: 'installation',

          movement_date: new Date(),

          performed_by: userId,

          createdby: userId,

          createdate: new Date(),

          log_inst: 1,

          status: 'P',

          approval_status: 'P',

          from_direction: assetMasterData.depot_id
            ? 'depot'
            : assetMasterData.outlet_id
              ? 'outlet'
              : 'warehouse',

          to_direction: 'outlet',

          from_depot_id: assetMasterData.depot_id || null,

          from_customer_id: assetMasterData.outlet_id || null,

          to_customer_id: cooler.customer_id,

          notes: `Cooler installation for asset ${assetMasterData.code}`,

          asset_movement_assets: {
            create: [
              {
                asset_id: cooler.asset_master_id!,

                createdby: userId,

                createdate: new Date(),

                log_inst: 1,
              },
            ],
          },
        },

        include: {
          asset_movement_assets: true,
        },
      });

      // =====================================================
      // LINK MOVEMENT TO COOLER
      // =====================================================

      await prisma.coolers.update({
        where: {
          id: cooler.id,
        },

        data: {
          asset_movement_id: movement.id,
        },
      });

      // =====================================================
      // CREATE APPROVAL REQUEST
      // =====================================================

      await createRequest({
        requester_id: userId,

        request_type: 'ASSET_MOVEMENT_APPROVAL',

        reference_id: movement.id,

        request_data: JSON.stringify({
          movement_id: movement.id,
          cooler_id: cooler.id,
          asset_id: cooler.asset_master_id,
        }),

        createdby: userId,

        log_inst: 1,
      });

      console.log(
        `Asset movement approval request created for movement ${movement.id}`
      );

      // =====================================================
      // RESPONSE
      // =====================================================

      return res.status(201).json({
        success: true,

        message:
          'Cooler installation created and asset movement sent for approval successfully',

        data: {
          ...serializeCoolerInstallation(cooler),

          code: assetMasterData.code,

          asset_movement_id: movement.id,

          movement_approval_status: 'P',
        },
      });
    } catch (error: any) {
      console.error('Create Cooler Installation Error:', error);

      return res.status(500).json({
        success: false,

        message: error.message,
      });
    }
  },

  async getCoolerInstallations(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        search,
        isActive,
        status,
        customer_id,
        technician_id,
        user_id,
      } = req.query;

      const page_num = page ? parseInt(page as string, 10) : 1;
      const limit_num = limit ? parseInt(limit as string, 10) : 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const inspectorFilter = technician_id || user_id;

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),

        ...(search && {
          OR: [
            { code: { contains: searchLower } },
            { brand: { contains: searchLower } },
            { model: { contains: searchLower } },
            { serial_number: { contains: searchLower } },
            { status: { contains: searchLower } },
            { energy_rating: { contains: searchLower } },
            { maintenance_contract: { contains: searchLower } },
            { coolers_customers: { name: { contains: searchLower } } },
            { users: { name: { contains: searchLower } } },
          ],
        }),
        ...(status && { status: status as string }),
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(inspectorFilter !== undefined &&
          inspectorFilter !== null &&
          inspectorFilter !== '' && {
            technician_id:
              inspectorFilter === 'null'
                ? null
                : parseInt(inspectorFilter as string, 10),
          }),
      };

      const { data, pagination } = await paginate({
        model: prisma.coolers,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          coolers_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_image: true,
            },
          },
          cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_sub_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_asset_master: {
            select: {
              id: true,
              name: true,
              serial_number: true,
              current_status: true,
              current_location: true,
              asset_master_asset_types: true,
              asset_master_asset_sub_types: true,
              asset_master_brands: true,
            },
          },
        },
      });

      const statsFilter: any = {};

      const totalCoolers = await prisma.coolers.count({
        where: statsFilter,
      });
      const activeCoolers = await prisma.coolers.count({
        where: {
          is_active: 'Y',
        },
      });
      const inactiveCoolers = await prisma.coolers.count({
        where: {
          is_active: 'N',
        },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newCoolersThisMonth = await prisma.coolers.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_coolers: totalCoolers,
        active_coolers: activeCoolers,
        inactive_coolers: inactiveCoolers,
        new_coolers_this_month: newCoolersThisMonth,
      };

      res.json({
        success: true,
        message: 'Cooler installations retrieved successfully',
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
        data: data.map((d: any) => serializeCoolerInstallation(d)),
      });
    } catch (error: any) {
      console.error('Get Cooler Installations Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getCoolerInstallationById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'Invalid cooler installation ID' });
      }

      const cooler = await prisma.coolers.findUnique({
        where: { id: Number(id) },
        include: {
          coolers_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_image: true,
            },
          },
          cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_sub_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_asset_master: {
            select: {
              id: true,
              name: true,
              serial_number: true,
              current_status: true,
              current_location: true,
              asset_master_asset_types: true,
              asset_master_asset_sub_types: true,
              asset_master_brands: true,
            },
          },
        },
      });

      if (!cooler) {
        return res
          .status(404)
          .json({ message: 'Cooler installation not found' });
      }

      res.json({
        message: 'Cooler installation fetched successfully',
        data: serializeCoolerInstallation(cooler),
      });
    } catch (error: any) {
      console.error('Get Cooler Installation Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCoolerInstallation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCooler = await prisma.coolers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCooler) {
        return res
          .status(404)
          .json({ message: 'Cooler installation not found' });
      }

      const { code, ...restData } = req.body;

      const data = {
        ...restData,
        ...(code && code.trim() !== '' && { code }),
        updatedate: new Date(),
        install_date: req.body.install_date
          ? new Date(req.body.install_date)
          : undefined,
        last_service_date: req.body.last_service_date
          ? new Date(req.body.last_service_date)
          : undefined,
        next_service_due: req.body.next_service_due
          ? new Date(req.body.next_service_due)
          : undefined,
        warranty_expiry: req.body.warranty_expiry
          ? new Date(req.body.warranty_expiry)
          : undefined,
        last_scanned_date: req.body.last_scanned_date
          ? new Date(req.body.last_scanned_date)
          : undefined,
      };

      if (data.code && data.code !== existingCooler.code) {
        const existingCode = await prisma.coolers.findFirst({
          where: {
            code: data.code,
            id: { not: Number(id) },
          },
        });

        if (existingCode) {
          return res
            .status(400)
            .json({ message: 'Cooler code already exists' });
        }
      }

      const cooler = await prisma.coolers.update({
        where: { id: Number(id) },
        data,
        include: {
          coolers_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_image: true,
            },
          },
          cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_sub_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_asset_master: {
            select: {
              id: true,
              name: true,
              serial_number: true,
              current_status: true,
              current_location: true,
              asset_master_asset_types: true,
              asset_master_asset_sub_types: true,
              asset_master_brands: true,
            },
          },
        },
      });

      if (cooler.asset_master_id && data.status === 'Installed') {
        try {
          const customer = cooler.coolers_customers;
          const toLocation = customer
            ? `${customer.name} (${customer.code})`
            : 'Customer Location';

          await prisma.asset_master.update({
            where: { id: cooler.asset_master_id },
            data: {
              current_status: 'Installed',
              current_location: toLocation,
              updatedate: new Date(),
              updatedby: req.body.updatedby ? Number(req.body.updatedby) : 1,
            },
          });
        } catch (assetUpdateError) {
          console.error('Error syncing asset master status:', assetUpdateError);
        }
      }

      res.json({
        message: 'Cooler installation updated successfully',
        data: serializeCoolerInstallation(cooler),
      });
    } catch (error: any) {
      console.error('Update Cooler Installation Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCoolerInstallation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCooler = await prisma.coolers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCooler) {
        return res
          .status(404)
          .json({ message: 'Cooler installation not found' });
      }

      const relatedInspections = await prisma.cooler_inspections.count({
        where: { cooler_id: Number(id) },
      });

      if (relatedInspections > 0) {
        return res.status(400).json({
          message: `Cannot delete cooler installation. It has ${relatedInspections} related inspection(s). Please delete the inspections first or contact support.`,
        });
      }

      await prisma.coolers.delete({ where: { id: Number(id) } });

      res.json({ message: 'Cooler installation deleted successfully' });
    } catch (error: any) {
      console.error('Delete Cooler Installation Error:', error);
      if (error.code === 'P2003') {
        return res.status(400).json({
          message:
            'Cannot delete cooler installation. It has related records that must be deleted first.',
        });
      }
      res.status(500).json({ message: error.message });
    }
  },

  async updateCoolerStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, value } = req.body;

      if (!id || isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'Invalid cooler installation ID' });
      }

      if (!status || !value) {
        return res
          .status(400)
          .json({ message: 'Status field and value are required' });
      }

      const allowedStatuses = ['status', 'is_active'];
      const allowedOperationalStatuses = [
        'working',
        'maintenance',
        'broken',
        'offline',
      ];
      const allowedActiveValues = ['Y', 'N'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status field. Allowed values: status, is_active',
        });
      }

      if (status === 'status' && !allowedOperationalStatuses.includes(value)) {
        return res.status(400).json({
          message:
            'Invalid operational status. Must be one of: working, maintenance, broken, offline',
        });
      }

      if (status === 'is_active' && !allowedActiveValues.includes(value)) {
        return res.status(400).json({
          message: 'Invalid active status. Must be one of: Y, N',
        });
      }

      const existingCooler = await prisma.coolers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCooler) {
        return res
          .status(404)
          .json({ message: 'Cooler installation not found' });
      }

      const updatedCooler = await prisma.coolers.update({
        where: { id: Number(id) },
        data: {
          [status]: value,
          updatedate: new Date(),
          updatedby: req.user?.id,
        },
        include: {
          coolers_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_image: true,
            },
          },
          cooler_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_sub_types: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cooler_asset_master: {
            select: {
              id: true,
              serial_number: true,
              current_status: true,
              current_location: true,
              asset_master_asset_types: true,
              asset_master_asset_sub_types: true,
              asset_master_brands: true,
            },
          },
        },
      });

      const readableStatusMap: { [key: string]: string } = {
        status: 'operational status',
        is_active: 'Is Active',
      };
      const readableStatus = readableStatusMap[status] || status;

      res.json({
        message: `Cooler ${readableStatus} updated successfully`,
        data: serializeCoolerInstallation(updatedCooler),
      });
    } catch (error: any) {
      console.error('Update Cooler Status Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCoolerStatusOptions(req: Request, res: Response) {
    try {
      const statusOptions = [
        { value: 'working', label: 'Working', color: 'success' },
        { value: 'maintenance', label: 'Maintenance', color: 'warning' },
        { value: 'broken', label: 'Broken', color: 'error' },
        { value: 'offline', label: 'Offline', color: 'default' },
      ];

      res.json({
        success: true,
        message: 'Status options retrieved successfully',
        data: statusOptions,
      });
    } catch (error: any) {
      console.error('Get Status Options Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
