import { Request, Response } from 'express';
import { sapService } from '../services/sap.service';
import prisma from '../../configs/prisma.client';

export const sapController = {
  async syncVanInventory(req: Request, res: Response) {
    try {
      const result = await sapService.createOrUpdateVanInventorySAP(req.body);

      return res.status(201).json({
        success: true,
        message: 'SAP inventory synced successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async searchUsers(req: Request, res: Response) {
    try {
      const name = (req.query.name as string) || '';
      if (!name)
        return res
          .status(400)
          .json({ success: false, message: 'name query param required' });
      const users = await prisma.users.findMany({
        where: {
          name: { contains: name },
          is_active: 'Y',
        },
        select: { id: true, name: true },
        take: 50,
      });
      return res.json({ success: true, data: users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async searchLocations(req: Request, res: Response) {
    try {
      const name = (req.query.name as string) || '';
      if (!name)
        return res
          .status(400)
          .json({ success: false, message: 'name query param required' });
      const depots = await prisma.depots.findMany({
        where: { name: { contains: name } },
        select: { id: true, name: true },
        take: 50,
      });
      return res.json({ success: true, data: depots });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async searchVehicles(req: Request, res: Response) {
    try {
      const name = (req.query.name as string) || '';
      if (!name)
        return res
          .status(400)
          .json({ success: false, message: 'name query param required' });
      const vehicles = await prisma.vehicles.findMany({
        where: {
          OR: [
            { vehicle_number: { contains: name } },
            { make: { contains: name } },
            { model: { contains: name } },
          ],
        },
        select: { id: true, vehicle_number: true },
        take: 50,
      });
      const result = vehicles.map(v => ({ id: v.id, name: v.vehicle_number }));
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async searchProduct(req: Request, res: Response) {
    try {
      const name = (req.query.name as string) || '';
      if (!name)
        return res
          .status(400)
          .json({ success: false, message: 'name query param required' });

      const products = await prisma.products.findMany({
        where: {
          OR: [{ name: { contains: name } }, { code: { contains: name } }],
          is_active: 'Y',
        },

        select: {
          id: true,
          name: true,
          code: true,
          product_unit_of_measurement: true,
        },
        take: 50,
      });

      const result = products.map(p => ({
        id: p.id,
        name: p.code ? `${p.name} (${p.code})` : p.name,
        unit: p.product_unit_of_measurement?.name || null,
        code: p.code,
      }));

      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
