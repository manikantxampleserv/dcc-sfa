import { Request, Response } from 'express';
import { deleteFile, uploadFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface DeliveryScheduleSerialized {
  id: number;
  order_id: number;
  customer_id: number;
  scheduled_date: Date;
  scheduled_time_slot?: string | null;
  assigned_vehicle_id?: number | null;
  assigned_driver_id?: number | null;
  status?: string | null;
  priority?: string | null;
  delivery_instructions?: string | null;
  actual_delivery_time?: Date | null;
  delivery_proof?: string | null;
  customer_signature?: string | null;
  failure_reason?: string | null;
  rescheduled_date?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  vehicle?: {
    id: number;
    registration_number: string;
    type: string;
    vehicle_number: string;
  } | null;
  driver?: {
    id: number;
    name: string;
    email: string;
    profile_image: string;
  } | null;
  customer?: { id: number; name: string; code: string; type: string } | null;
  order?: { id: number; order_number: string } | null;
}
const serializeDelivery = (d: any): DeliveryScheduleSerialized => ({
  id: d.id,
  order_id: d.order_id,
  customer_id: d.customer_id,
  scheduled_date: d.scheduled_date,
  scheduled_time_slot: d.scheduled_time_slot,
  assigned_vehicle_id: d.assigned_vehicle_id,
  assigned_driver_id: d.assigned_driver_id,
  status: d.status,
  priority: d.priority,
  delivery_instructions: d.delivery_instructions,
  actual_delivery_time: d.actual_delivery_time,
  delivery_proof: d.delivery_proof,
  customer_signature: d.customer_signature,
  failure_reason: d.failure_reason,
  rescheduled_date: d.rescheduled_date,
  is_active: d.is_active,
  createdate: d.createdate,
  createdby: d.createdby,
  updatedate: d.updatedate,
  updatedby: d.updatedby,
  log_inst: d.log_inst,
  vehicle: d.delivery_schedules_vehicles
    ? {
        id: d.delivery_schedules_vehicles.id,
        registration_number: d.delivery_schedules_vehicles.registration_number,
        type: d.delivery_schedules_vehicles.type,
        vehicle_number: d.delivery_schedules_vehicles.vehicle_number,
      }
    : null,
  driver: d.delivery_schedules_users
    ? {
        id: d.delivery_schedules_users.id,
        name: d.delivery_schedules_users.name,
        email: d.delivery_schedules_users.email,
        profile_image: d.delivery_schedules_users.profile_image,
      }
    : null,
  customer: d.delivery_schedules_customers
    ? {
        id: d.delivery_schedules_customers.id,
        name: d.delivery_schedules_customers.name,
        code: d.delivery_schedules_customers.code,
        type: d.delivery_schedules_customers.type,
      }
    : null,
  order: d.delivery_schedules_customers_orders
    ? {
        id: d.delivery_schedules_customers_orders.id,
        order_number: d.delivery_schedules_customers_orders.order_number,
      }
    : null,
});

export const deliverySchedulesController = {
  async createDeliverySchedule(req: any, res: any) {
    try {
      const data = req.body;

      let companySignaturePath: string | null = null;
      if (req.file) {
        const fileName = `delivery_schedules/customer_signatures/${Date.now()}-${req.file.originalname}`;
        companySignaturePath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
      }

      const delivery = await prisma.delivery_schedules.create({
        data: {
          order_id: Number(data.order_id),
          customer_id: Number(data.customer_id),
          scheduled_date: new Date(data.scheduled_date),
          scheduled_time_slot: data.scheduled_time_slot || null,
          assigned_vehicle_id: data.assigned_vehicle_id
            ? Number(data.assigned_vehicle_id)
            : null,
          assigned_driver_id: data.assigned_driver_id
            ? Number(data.assigned_driver_id)
            : null,
          status: data.status || 'scheduled',
          priority: data.priority || 'medium',
          delivery_instructions: data.delivery_instructions || null,
          actual_delivery_time: data.actual_delivery_time
            ? new Date(data.actual_delivery_time)
            : null,
          delivery_proof: data.delivery_proof || null,
          customer_signature: companySignaturePath,
          failure_reason: data.failure_reason || null,
          rescheduled_date: data.rescheduled_date
            ? new Date(data.rescheduled_date)
            : null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || data.createdby || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          delivery_schedules_vehicles: true,
          delivery_schedules_users: true,
          delivery_schedules_customers: true,
          delivery_schedules_customers_orders: true,
        },
      });

      res.status(201).json({
        message: 'Delivery schedule created successfully',
        data: serializeDelivery(delivery),
      });
    } catch (error: any) {
      console.error('Create Delivery Schedule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllDeliverySchedules(req: any, res: any) {
    try {
      const { page, limit, status, priority, isActive, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const filters: any = {
        ...(status && { status: status }),
        ...(priority && { priority: priority }),
        ...(isActive && { is_active: isActive }),
        ...(search && {
          OR: [
            { delivery_instructions: { contains: search as string } },
            { failure_reason: { contains: search as string } },
            {
              delivery_schedules_customers: {
                name: { contains: search as string },
              },
            },
            {
              delivery_schedules_customers_orders: {
                order_number: { contains: search as string },
              },
            },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.delivery_schedules,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          delivery_schedules_vehicles: true,
          delivery_schedules_users: true,
          delivery_schedules_customers: true,
          delivery_schedules_customers_orders: true,
        },
      });
      const totalDeliveries = await prisma.delivery_schedules.count({
        where: filters,
      });
      const activeDeliveries = await prisma.delivery_schedules.count({
        where: { ...filters, is_active: 'Y' },
      });
      const inactiveDeliveries = await prisma.delivery_schedules.count({
        where: { ...filters, is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newDeliveriesThisMonth = await prisma.delivery_schedules.count({
        where: {
          ...filters,
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Delivery schedules retrieved successfully',
        data.map((d: any) => serializeDelivery(d)),
        200,
        pagination,
        {
          total_deliveries: totalDeliveries,
          active_deliveries: activeDeliveries,
          inactive_deliveries: inactiveDeliveries,
          new_deliveries_this_month: newDeliveriesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get All Delivery Schedules Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getDeliveryScheduleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const delivery = await prisma.delivery_schedules.findUnique({
        where: { id: Number(id) },
        include: {
          delivery_schedules_vehicles: true,
          delivery_schedules_users: true,
          delivery_schedules_customers: true,
          delivery_schedules_customers_orders: true,
        },
      });

      if (!delivery)
        return res.status(404).json({ message: 'Delivery schedule not found' });

      res.json({
        message: 'Delivery schedule fetched successfully',
        data: serializeDelivery(delivery),
      });
    } catch (error: any) {
      console.error('Get Delivery Schedule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateDeliverySchedule(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.delivery_schedules.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Delivery schedule not found' });

      let companySignaturePath: string | null = existing.customer_signature;

      if (req.file) {
        const fileName = `delivery_schedules/customer_signatures/${Date.now()}-${req.file.originalname}`;
        companySignaturePath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );

        if (existing.customer_signature) {
          await deleteFile(existing.customer_signature);
        }
      }

      const body = req.body;

      const updated = await prisma.delivery_schedules.update({
        where: { id: Number(id) },
        data: {
          order_id: body.order_id ? Number(body.order_id) : existing.order_id,
          customer_id: body.customer_id
            ? Number(body.customer_id)
            : existing.customer_id,
          scheduled_date: body.scheduled_date
            ? new Date(body.scheduled_date)
            : existing.scheduled_date,
          scheduled_time_slot:
            body.scheduled_time_slot || existing.scheduled_time_slot,
          assigned_vehicle_id: body.assigned_vehicle_id
            ? Number(body.assigned_vehicle_id)
            : existing.assigned_vehicle_id,
          assigned_driver_id: body.assigned_driver_id
            ? Number(body.assigned_driver_id)
            : existing.assigned_driver_id,
          status: body.status || existing.status,
          priority: body.priority || existing.priority,
          delivery_instructions:
            body.delivery_instructions || existing.delivery_instructions,
          actual_delivery_time: body.actual_delivery_time
            ? new Date(body.actual_delivery_time)
            : existing.actual_delivery_time,
          delivery_proof: body.delivery_proof || existing.delivery_proof,
          customer_signature: companySignaturePath,
          failure_reason: body.failure_reason || existing.failure_reason,
          rescheduled_date: body.rescheduled_date
            ? new Date(body.rescheduled_date)
            : existing.rescheduled_date,
          is_active: body.is_active || existing.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
        include: {
          delivery_schedules_vehicles: true,
          delivery_schedules_users: true,
          delivery_schedules_customers: true,
          delivery_schedules_customers_orders: true,
        },
      });

      res.json({
        message: 'Delivery schedule updated successfully',
        data: serializeDelivery(updated),
      });
    } catch (error: any) {
      console.error('Update Delivery Schedule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteDeliverySchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.delivery_schedules.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Delivery schedule not found' });

      if (existing.customer_signature) {
        await deleteFile(existing.customer_signature);
      }

      await prisma.delivery_schedules.delete({ where: { id: Number(id) } });

      res.json({ message: 'Delivery schedule deleted successfully' });
    } catch (error: any) {
      console.error('Delete Delivery Schedule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
