import { Request, Response } from 'express';
import { sapService } from '../services/sap.service';

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
};
