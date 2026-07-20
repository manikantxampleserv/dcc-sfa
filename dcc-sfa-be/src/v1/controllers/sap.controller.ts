import { Request, Response } from 'express';
import { sapService } from '../services/sap.service';
import prisma from '../../configs/prisma.client';

export const sapController = {
  async syncVanInventory(req: Request, res: Response) {
    const user = await prisma.users.findFirst({
      where: {
        sap_code: req.body.salesman_sap_code,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Salesman with SAP code ${req.body.salesman_sap_code} not found`,
      });
    }

    try {
      const result = await sapService.createOrUpdateVanInventorySAP(
        req.body,
        user.id
      );

      return res.status(201).json({
        success: true,
        message: 'SAP inventory synced successfully',
        data: result,
      });
    } catch (error: any) {
      console.error(error.stack);
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
          OR: [{ name: { contains: name } }, { sap_code: { contains: name } }],
          is_active: 'Y',
        },
        select: { id: true, name: true, sap_code: true },
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
        where: {
          OR: [{ name: { contains: name } }, { sap_code: { contains: name } }],
        },
        select: { id: true, name: true, sap_code: true },
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
            { sap_code: { contains: name } },
          ],
        },
        select: { id: true, vehicle_number: true, sap_code: true },
        take: 50,
      });
      const result = vehicles.map(v => ({
        id: v.id,
        name: v.vehicle_number,
        sap_code: v.sap_code,
      }));
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
          OR: [
            { name: { contains: name } },
            { code: { contains: name } },
            { sap_code: { contains: name } },
          ],
          is_active: 'Y',
        },

        select: {
          id: true,
          name: true,
          code: true,
          sap_code: true,
          product_unit_of_measurement: true,
        },
        take: 50,
      });

      const result = products.map(p => ({
        id: p.id,
        name: p.code ? `${p.name} (${p.code})` : p.name,
        unit: p.product_unit_of_measurement?.name || null,
        code: p.code,
        sap_code: p.sap_code,
      }));

      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateVanInventoryCancellation(req: any, res: any) {
    try {
      const { id } = req.params;
      const { is_cancelled } = req.body;

      if (!['Y', 'N'].includes(is_cancelled)) {
        return res.status(400).json({
          message: 'is_cancelled must be either Y or N',
        });
      }

      const existingInventory = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          approval_status: true,
        },
      });

      if (!existingInventory) {
        return res.status(404).json({
          message: 'Van inventory not found',
        });
      }

      if ((existingInventory.approval_status || 'P') !== 'P') {
        return res.status(400).json({
          message:
            'Cancellation can only be updated when approval status is Pending (P).',
        });
      }

      const inventory = await prisma.van_inventory.update({
        where: { id: Number(id) },
        data: {
          is_cancelled,
          updatedby: req.user.id,
          updatedate: new Date(),
          log_inst: { increment: 1 },
        },
      });

      return res.success(
        'Van inventory cancellation updated successfully',
        inventory
      );
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  async updateVanInventoryItemCancellation(req: any, res: any) {
    try {
      const { itemId } = req.params;
      const { is_cancelled } = req.body;

      if (!['Y', 'N'].includes(is_cancelled)) {
        return res.status(400).json({
          message: 'is_cancelled must be either Y or N',
        });
      }

      const existingItem = await prisma.van_inventory_items.findUnique({
        where: { id: Number(itemId) },
        include: {
          van_inventory_items_inventory: {
            select: {
              id: true,
              approval_status: true,
            },
          },
        },
      });

      if (!existingItem) {
        return res.status(404).json({
          message: 'Van inventory item not found',
        });
      }

      const approvalStatus =
        existingItem.van_inventory_items_inventory?.approval_status || 'P';

      if (approvalStatus !== 'P') {
        return res.status(400).json({
          message:
            'Item cancellation can only be updated when the parent van inventory is Pending (P).',
        });
      }

      const item = await prisma.van_inventory_items.update({
        where: { id: Number(itemId) },
        data: {
          is_cancelled,
        },
      });

      return res.success(
        'Van inventory item cancellation updated successfully',
        item
      );
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },
};
