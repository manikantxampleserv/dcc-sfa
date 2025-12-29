import express from 'express';
import { vanInventoryController } from '../controllers/vanInventory.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get(
  '/inventory-item-salesperson',
  authenticateToken,
  vanInventoryController.getSalespersonInventory
);

router.get(
  '/inventory-item-salesperson/:salesperson_id',
  authenticateToken,
  vanInventoryController.getSalespersonInventory
);

export default router;
