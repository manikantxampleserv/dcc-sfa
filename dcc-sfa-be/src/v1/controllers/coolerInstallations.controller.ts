import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

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
    serial_number?: string | null;
    current_status?: string | null;
    current_location?: string | null;
  } | null;
}

const serializeCoolerInstallation = (
  cooler: any
): CoolerInstallationSerialized => ({
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
  customer: cooler.coolers_customers
    ? {
        id: cooler.coolers_customers.id,
        name: cooler.coolers_customers.name,
        code: cooler.coolers_customers.code,
      }
    : null,
  technician: cooler.users
    ? {
        id: cooler.users.id,
        name: cooler.users.name,
        email: cooler.users.email,
        profile_image: cooler.users.profile_image,
      }
    : null,
  cooler_type: cooler.cooler_types
    ? {
        id: cooler.cooler_types.id,
        name: cooler.cooler_types.name,
        code: cooler.cooler_types.code,
      }
    : null,
  cooler_sub_type: cooler.cooler_sub_types
    ? {
        id: cooler.cooler_sub_types.id,
        name: cooler.cooler_sub_types.name,
        code: cooler.cooler_sub_types.code,
      }
    : null,
  asset_master: cooler.cooler_asset_master
    ? {
        id: cooler.cooler_asset_master.id,
        serial_number: cooler.cooler_asset_master.serial_number,
        current_status: cooler.cooler_asset_master.current_status,
        current_location: cooler.cooler_asset_master.current_location,
      }
    : null,
});

export const coolerInstallationsController = {
  async createCoolerInstallation(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.customer_id) {
        return res.status(400).json({ message: 'Customer ID is required' });
      }

      const generateCode = async (): Promise<string> => {
        const prefix = 'COOL';
        const count = await prisma.coolers.count();
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}-${String(count + 1).padStart(4, '0')}-${timestamp}`;
      };

      let coolerCode: string;

      // Handle user-provided code
      if (data.code && data.code.trim() !== '') {
        coolerCode = data.code.trim();

        // Check if user-provided code already exists
        const existingCooler = await prisma.coolers.findUnique({
          where: { code: coolerCode },
        });

        if (existingCooler) {
          return res
            .status(400)
            .json({ message: 'Cooler code already exists' });
        }
      } else {
        // Generate auto code only if user didn't provide one
        coolerCode = await generateCode();
        let attempts = 0;

        // Ensure generated code is unique
        while (attempts < 10) {
          const existing = await prisma.coolers.findUnique({
            where: { code: coolerCode },
          });
          if (!existing) break;
          coolerCode = await generateCode();
          attempts++;
        }

        if (attempts >= 10) {
          return res
            .status(500)
            .json({ message: 'Unable to generate unique cooler code' });
        }
      }

      const cooler = await prisma.coolers.create({
        data: {
          ...data,
          code: coolerCode,
          createdby: data.createdby ? Number(data.createdby) : 1,
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
              serial_number: true,
              current_status: true,
              current_location: true,
            },
          },
        },
      });

      if (cooler.asset_master_id && cooler.install_date) {
        try {
          const customer = cooler.coolers_customers;
          const toLocation = customer
            ? `${customer.name} (${customer.code})`
            : 'Customer Location';

          // await prisma.asset_movements.create({
          //   data: {
          //     asset_id: cooler.asset_master_id,
          //     from_location:
          //       cooler.cooler_asset_master?.current_location || 'Warehouse',
          //     to_location: toLocation,
          //     movement_type: 'Installation',
          //     movement_date: cooler.install_date,
          //     performed_by: data.createdby ? Number(data.createdby) : 1,
          //     notes: `Cooler ${cooler.code} installed at customer location`,
          //     is_active: 'Y',
          //     createdby: data.createdby ? Number(data.createdby) : 1,
          //     createdate: new Date(),
          //     log_inst: 1,
          //   },
          // });

          if (cooler.asset_master_id) {
            await prisma.asset_master.update({
              where: { id: cooler.asset_master_id },
              data: {
                current_location: toLocation,
                current_status: 'In Use',
                updatedate: new Date(),
                updatedby: data.createdby ? Number(data.createdby) : 1,
              },
            });
          }
        } catch (movementError) {
          console.error('Error creating asset movement:', movementError);
        }
      }

      res.status(201).json({
        message: 'Cooler installation created successfully',
        data: serializeCoolerInstallation(cooler),
      });
    } catch (error: any) {
      console.error('Create Cooler Installation Error:', error);
      res.status(500).json({ message: error.message });
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

      // Provide default values and validate inputs
      const page_num = page ? parseInt(page as string, 10) : 1;
      const limit_num = limit ? parseInt(limit as string, 10) : 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const inspectorFilter = technician_id || user_id;

      const filters: any = {
        // Only add is_active filter if isActive is provided
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
              serial_number: true,
              current_status: true,
              current_location: true,
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
              serial_number: true,
              current_status: true,
              current_location: true,
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
              serial_number: true,
              current_status: true,
              current_location: true,
            },
          },
        },
      });

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
