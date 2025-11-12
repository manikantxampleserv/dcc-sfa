import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface VehicleSerialized {
  id: number;
  vehicle_number: string;
  type: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  capacity?: number | null;
  fuel_type?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_update?: Date | null;
  assigned_to?: number | null;
  status?: string | null;
  fuel_level?: number | null;
  mileage?: number | null;
  last_service_date?: Date | null;
  next_service_due?: Date | null;
  insurance_expiry?: Date | null;
  registration_expiry?: Date | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeVehicle = (vehicle: any): VehicleSerialized => ({
  id: vehicle.id,
  vehicle_number: vehicle.vehicle_number,
  type: vehicle.type,
  make: vehicle.make,
  model: vehicle.model,
  year: vehicle.year,
  capacity: vehicle.capacity ? parseFloat(vehicle.capacity.toString()) : null,
  fuel_type: vehicle.fuel_type,
  current_latitude: vehicle.current_latitude
    ? parseFloat(vehicle.current_latitude.toString())
    : null,
  current_longitude: vehicle.current_longitude
    ? parseFloat(vehicle.current_longitude.toString())
    : null,
  last_location_update: vehicle.last_location_update,
  assigned_to: vehicle.assigned_to,
  status: vehicle.status,
  fuel_level: vehicle.fuel_level
    ? parseFloat(vehicle.fuel_level.toString())
    : null,
  mileage: vehicle.mileage ? parseFloat(vehicle.mileage.toString()) : null,
  last_service_date: vehicle.last_service_date,
  next_service_due: vehicle.next_service_due,
  insurance_expiry: vehicle.insurance_expiry,
  registration_expiry: vehicle.registration_expiry,
  is_active: vehicle.is_active,
  created_by: vehicle.createdby,
  createdate: vehicle.createdate,
  updatedate: vehicle.updatedate,
  updatedby: vehicle.updatedby,
});

export const vehiclesController = {
  async createVehicle(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.vehicle_number || !data.type) {
        return res
          .status(400)
          .json({ message: 'Vehicle number and type are required' });
      }

      const vehicle = await prisma.vehicles.create({
        data: {
          ...data,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Vehicle created successfully',
        data: serializeVehicle(vehicle),
      });
    } catch (error: any) {
      console.error('Create Vehicle Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getVehicles(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive,
        type,
        status,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: isActive as string,
        ...(search && {
          OR: [
            { vehicle_number: { contains: searchLower } },
            { type: { contains: searchLower } },
            { make: { contains: searchLower } },
            { model: { contains: searchLower } },
          ],
        }),
        ...(type && { type: type as string }),
        ...(status && { status: status as string }),
      };

      const totalVehicles = await prisma.vehicles.count();
      const activeVehicles = await prisma.vehicles.count({
        where: { is_active: 'Y' },
      });
      const inactiveVehicles = await prisma.vehicles.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newVehiclesThisMonth = await prisma.vehicles.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_vehicles: totalVehicles,
        active_vehicles: activeVehicles,
        inactive_vehicles: inactiveVehicles,
        new_vehicles: newVehiclesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.vehicles,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Vehicles retrieved successfully',
        data: data.map((d: any) => serializeVehicle(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Vehicles Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: Number(id) },
      });

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      res.json({
        message: 'Vehicle fetched successfully',
        data: serializeVehicle(vehicle),
      });
    } catch (error: any) {
      console.error('Get Vehicle Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingVehicle = await prisma.vehicles.findUnique({
        where: { id: Number(id) },
      });

      if (!existingVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const vehicle = await prisma.vehicles.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Vehicle updated successfully',
        data: serializeVehicle(vehicle),
      });
    } catch (error: any) {
      console.error('Update Vehicle Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingVehicle = await prisma.vehicles.findUnique({
        where: { id: Number(id) },
      });

      if (!existingVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      await prisma.vehicles.delete({ where: { id: Number(id) } });

      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error: any) {
      console.error('Delete Vehicle Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
