import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CoolerInspectionSerialized {
  id: number;
  cooler_id: number;
  visit_id?: number | null;
  inspected_by: number;
  inspection_date?: string | null;
  temperature?: number | null;
  is_working: string;
  issues?: string | null;
  images?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  action_required: string;
  action_taken?: string | null;
  next_inspection_due?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  cooler?: {
    id: number;
    code: string;
    brand?: string | null;
    model?: string | null;
    customer?: {
      id: number;
      name: string;
      code?: string | null;
    } | null;
  } | null;
  inspector?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string | null;
  } | null;
  visit?: {
    id: number;
    visit_date?: string | null;
    customer?: {
      id: number;
      name: string;
      code?: string | null;
    } | null;
  } | null;
}

const serializeCoolerInspection = (
  inspection: any
): CoolerInspectionSerialized => ({
  id: inspection.id,
  cooler_id: inspection.cooler_id,
  visit_id: inspection.visit_id,
  inspected_by: inspection.inspected_by,
  inspection_date: inspection.inspection_date?.toISOString(),
  temperature: inspection.temperature ? Number(inspection.temperature) : null,
  is_working: inspection.is_working,
  issues: inspection.issues,
  images: inspection.images,
  latitude: inspection.latitude ? Number(inspection.latitude) : null,
  longitude: inspection.longitude ? Number(inspection.longitude) : null,
  action_required: inspection.action_required,
  action_taken: inspection.action_taken,
  next_inspection_due: inspection.next_inspection_due?.toISOString(),
  is_active: inspection.is_active,
  createdate: inspection.createdate?.toISOString(),
  createdby: inspection.createdby,
  updatedate: inspection.updatedate?.toISOString(),
  updatedby: inspection.updatedby,
  cooler: inspection.coolers
    ? {
        id: inspection.coolers.id,
        code: inspection.coolers.code,
        brand: inspection.coolers.brand,
        model: inspection.coolers.model,
        customer: inspection.coolers.coolers_customers
          ? {
              id: inspection.coolers.coolers_customers.id,
              name: inspection.coolers.coolers_customers.name,
              code: inspection.coolers.coolers_customers.code,
            }
          : null,
      }
    : null,
  inspector: inspection.users
    ? {
        id: inspection.users.id,
        name: inspection.users.name,
        email: inspection.users.email,
        profile_image: inspection.users.profile_image,
      }
    : null,
  visit: inspection.visits
    ? {
        id: inspection.visits.id,
        visit_date: inspection.visits.visit_date?.toISOString(),
        customer: inspection.visits.visit_customers
          ? {
              id: inspection.visits.visit_customers.id,
              name: inspection.visits.visit_customers.name,
              code: inspection.visits.visit_customers.code,
            }
          : null,
      }
    : null,
});

export const coolerInspectionsController = {
  async createCoolerInspection(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.cooler_id) {
        return res.status(400).json({ message: 'Cooler ID is required' });
      }
      if (!data.inspected_by) {
        return res.status(400).json({ message: 'Inspector ID is required' });
      }

      const inspection = await prisma.cooler_inspections.create({
        data: {
          ...data,
          inspection_date: data.inspection_date
            ? new Date(data.inspection_date)
            : null,
          next_inspection_due: data.next_inspection_due
            ? new Date(data.next_inspection_due)
            : null,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          coolers: {
            select: {
              id: true,
              code: true,
              brand: true,
              model: true,
              serial_number: true,
              capacity: true,
              coolers_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
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
          visits: {
            select: {
              id: true,
              visit_date: true,
              visit_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        message: 'Cooler inspection created successfully',
        data: serializeCoolerInspection(inspection),
      });
    } catch (error: any) {
      console.error('Create Cooler Inspection Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // async getCoolerInspections(req: Request, res: Response) {
  //   try {
  //     const {
  //       page = '1',
  //       limit = '10',
  //       search = '',
  //       isActive,
  //       isWorking,
  //       actionRequired,
  //       cooler_id,
  //       inspected_by,
  //       inspector_id,
  //       visit_id,
  //     } = req.query;
  //     const page_num = parseInt(page as string, 10);
  //     const limit_num = parseInt(limit as string, 10);
  //     const searchLower = (search as string).toLowerCase();

  //     const inspectorFilter = inspector_id || inspected_by;

  //     const filters: any = {
  //       is_active: isActive as string,
  //       ...(search && {
  //         OR: [
  //           { issues: { contains: searchLower } },
  //           { action_taken: { contains: searchLower } },
  //           { coolers: { code: { contains: searchLower } } },
  //           { coolers: { brand: { contains: searchLower } } },
  //           { coolers: { model: { contains: searchLower } } },
  //           { users: { name: { contains: searchLower } } },
  //           { users: { email: { contains: searchLower } } },
  //         ],
  //       }),
  //       ...(isWorking && { is_working: isWorking as string }),
  //       ...(actionRequired && { action_required: actionRequired as string }),
  //       ...(cooler_id !== undefined &&
  //         cooler_id !== null &&
  //         cooler_id !== '' && {
  //           cooler_id: parseInt(cooler_id as string, 10),
  //         }),
  //       ...(inspectorFilter !== undefined &&
  //         inspectorFilter !== null &&
  //         inspectorFilter !== '' && {
  //           inspected_by:
  //             inspectorFilter === 'null'
  //               ? null
  //               : parseInt(inspectorFilter as string, 10),
  //         }),
  //       ...(visit_id !== undefined &&
  //         visit_id !== null &&
  //         visit_id !== '' && {
  //           visit_id:
  //             visit_id === 'null' ? null : parseInt(visit_id as string, 10),
  //         }),
  //     };

  //     const totalInspections = await prisma.cooler_inspections.count();
  //     const activeInspections = await prisma.cooler_inspections.count({
  //       where: { is_active: 'Y' },
  //     });
  //     const inactiveInspections = await prisma.cooler_inspections.count({
  //       where: { is_active: 'N' },
  //     });

  //     const now = new Date();
  //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  //     const newInspectionsThisMonth = await prisma.cooler_inspections.count({
  //       where: {
  //         createdate: {
  //           gte: startOfMonth,
  //           lt: endOfMonth,
  //         },
  //       },
  //     });

  //     const stats = {
  //       total_inspections: totalInspections,
  //       active_inspections: activeInspections,
  //       inactive_inspections: inactiveInspections,
  //       new_inspections_this_month: newInspectionsThisMonth,
  //     };

  //     const { data, pagination } = await paginate({
  //       model: prisma.cooler_inspections,
  //       filters,
  //       page: page_num,
  //       limit: limit_num,
  //       orderBy: { createdate: 'desc' },
  //       include: {
  //         coolers: {
  //           select: {
  //             id: true,
  //             code: true,
  //             brand: true,
  //             model: true,
  //             serial_number: true,
  //             capacity: true,
  //             coolers_customers: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 code: true,
  //               },
  //             },
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
  //         visits: {
  //           select: {
  //             id: true,
  //             visit_date: true,
  //             visit_customers: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 code: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     res.json({
  //       success: true,
  //       message: 'Cooler inspections retrieved successfully',
  //       data: data.map((d: any) => serializeCoolerInspection(d)),
  //       meta: {
  //         requestDuration: Date.now(),
  //         timestamp: new Date().toISOString(),
  //         ...pagination,
  //       },
  //       stats,
  //     });
  //   } catch (error: any) {
  //     console.error('Get Cooler Inspections Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // },

  async getCoolerInspections(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        search,
        isActive,
        isWorking,
        actionRequired,
        cooler_id,
        inspected_by,
        user_id,
        inspector_id,
        visit_id,
      } = req.query;

      const page_num = page ? parseInt(page as string, 10) : 1;
      const limit_num = limit ? parseInt(limit as string, 10) : 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const inspectorFilter = inspector_id || inspected_by || user_id;

      const filters: any = {
        visit_id: { not: null },
        ...(search && {
          OR: [
            { issues: { contains: searchLower } },
            { action_taken: { contains: searchLower } },
            { coolers: { code: { contains: searchLower } } },
            { coolers: { brand: { contains: searchLower } } },
            { coolers: { model: { contains: searchLower } } },
            { users: { name: { contains: searchLower } } },
            { users: { email: { contains: searchLower } } },
            { user_id: { contains: searchLower } },
          ],
        }),
        ...(isActive !== undefined &&
          isActive !== null &&
          isActive !== '' && {
            is_active: isActive as string,
          }),
        ...(isWorking !== undefined &&
          isWorking !== null &&
          isWorking !== '' && {
            is_working: isWorking as string,
          }),
        ...(actionRequired !== undefined &&
          actionRequired !== null &&
          actionRequired !== '' && {
            action_required: actionRequired as string,
          }),
        ...(cooler_id !== undefined &&
          cooler_id !== null &&
          cooler_id !== '' && {
            cooler_id: parseInt(cooler_id as string, 10),
          }),
        ...(inspectorFilter !== undefined &&
          inspectorFilter !== null &&
          inspectorFilter !== '' && {
            inspected_by: parseInt(inspectorFilter as string, 10),
          }),
        ...(visit_id !== undefined &&
          visit_id !== null &&
          visit_id !== '' && {
            visit_id: parseInt(visit_id as string, 10),
          }),
      };

      const totalInspections = await prisma.cooler_inspections.count();
      const activeInspections = await prisma.cooler_inspections.count({
        where: {
          is_active: 'Y',
        },
      });
      const inactiveInspections = await prisma.cooler_inspections.count({
        where: {
          is_active: 'N',
        },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const newInspectionsThisMonth = await prisma.cooler_inspections.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const stats = {
        total_inspections: totalInspections,
        active_inspections: activeInspections,
        inactive_inspections: inactiveInspections,
        new_inspections_this_month: newInspectionsThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.cooler_inspections,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          coolers: {
            select: {
              id: true,
              code: true,
              brand: true,
              model: true,
              serial_number: true,
              capacity: true,
              coolers_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
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
          visits: {
            select: {
              id: true,
              visit_date: true,
              visit_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Cooler inspections retrieved successfully',
        data: data.map((d: any) => serializeCoolerInspection(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Cooler Inspections Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  async getCoolerInspectionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const inspection = await prisma.cooler_inspections.findUnique({
        where: { id: Number(id) },
        include: {
          coolers: {
            select: {
              id: true,
              code: true,
              brand: true,
              model: true,
              serial_number: true,
              capacity: true,
              coolers_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
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
          visits: {
            select: {
              id: true,
              visit_date: true,
              visit_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      if (!inspection) {
        return res.status(404).json({ message: 'Cooler inspection not found' });
      }

      res.json({
        message: 'Cooler inspection fetched successfully',
        data: serializeCoolerInspection(inspection),
      });
    } catch (error: any) {
      console.error('Get Cooler Inspection Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCoolerInspection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingInspection = await prisma.cooler_inspections.findUnique({
        where: { id: Number(id) },
      });

      if (!existingInspection) {
        return res.status(404).json({ message: 'Cooler inspection not found' });
      }

      const data = {
        ...req.body,
        inspection_date: req.body.inspection_date
          ? new Date(req.body.inspection_date)
          : undefined,
        next_inspection_due: req.body.next_inspection_due
          ? new Date(req.body.next_inspection_due)
          : undefined,
        updatedate: new Date(),
      };

      const inspection = await prisma.cooler_inspections.update({
        where: { id: Number(id) },
        data,
        include: {
          coolers: {
            select: {
              id: true,
              code: true,
              brand: true,
              model: true,
              serial_number: true,
              capacity: true,
              coolers_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
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
          visits: {
            select: {
              id: true,
              visit_date: true,
              visit_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      res.json({
        message: 'Cooler inspection updated successfully',
        data: serializeCoolerInspection(inspection),
      });
    } catch (error: any) {
      console.error('Update Cooler Inspection Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCoolerInspection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingInspection = await prisma.cooler_inspections.findUnique({
        where: { id: Number(id) },
      });

      if (!existingInspection) {
        return res.status(404).json({ message: 'Cooler inspection not found' });
      }

      await prisma.cooler_inspections.delete({ where: { id: Number(id) } });

      res.json({ message: 'Cooler inspection deleted successfully' });
    } catch (error: any) {
      console.error('Delete Cooler Inspection Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCoolerInspectionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, value } = req.body;

      // Validate ID
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid inspection ID' });
      }

      // Validate status field and value
      const allowedStatuses = ['is_working', 'action_required', 'is_active'];
      const allowedValues = ['Y', 'N'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            'Invalid status field. Allowed values: is_working, action_required, is_active',
        });
      }

      if (!allowedValues.includes(value)) {
        return res.status(400).json({
          message: 'Invalid status value. Allowed values: Y, N',
        });
      }

      const inspection = await prisma.cooler_inspections.findUnique({
        where: { id: Number(id) },
      });

      if (!inspection) {
        return res.status(404).json({ message: 'Cooler inspection not found' });
      }

      const updatedInspection = await prisma.cooler_inspections.update({
        where: { id: Number(id) },
        data: {
          [status]: value,
          updatedate: new Date(),
          updatedby: req.user?.id,
        },
        include: {
          coolers: {
            select: {
              id: true,
              code: true,
              brand: true,
              model: true,
              serial_number: true,
              capacity: true,
              coolers_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
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
          visits: {
            select: {
              id: true,
              visit_date: true,
              visit_customers: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      // Map internal status names to user-friendly labels for the message
      const readableStatusMap: { [key: string]: string } = {
        is_working: 'working status',
        action_required: 'action required status',
        is_active: 'active status',
      };
      const readableStatus = readableStatusMap[status] || status;

      res.json({
        message: `Cooler inspection ${readableStatus} updated successfully`,
        data: serializeCoolerInspection(updatedInspection),
      });
    } catch (error: any) {
      console.error('Update Cooler Inspection Status Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCoolerInspectionStatusOptions(req: Request, res: Response) {
    try {
      const statusOptions = [
        {
          field: 'is_working',
          label: 'Working Status',
          options: [
            { value: 'Y', label: 'Working', color: 'success' },
            { value: 'N', label: 'Not Working', color: 'error' },
          ],
        },
        {
          field: 'action_required',
          label: 'Action Required',
          options: [
            { value: 'Y', label: 'Action Required', color: 'warning' },
            { value: 'N', label: 'No Action Required', color: 'success' },
          ],
        },
        {
          field: 'is_active',
          label: 'Active Status',
          options: [
            { value: 'Y', label: 'Active', color: 'success' },
            { value: 'N', label: 'Inactive', color: 'error' },
          ],
        },
      ];

      res.json({
        message: 'Cooler inspection status options retrieved successfully',
        data: statusOptions,
      });
    } catch (error: any) {
      console.error('Get Cooler Inspection Status Options Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
