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
  '/salesperson-item-inventory/:salesperson_id',
  authenticateToken,
  vanInventoryController.getinventoryItemSalesperson
);

router.get(
  '/inventory-item-salesperson/:salesperson_id',
  authenticateToken,
  vanInventoryController.getSalespersonInventory
);

router.get(
  '/inventory-items-dropdown/:salesperson_id',
  authenticateToken,
  vanInventoryController.getSalespersonInventoryItemsDropdown
);

router.get(
  '/inventory-item-salesperson-items/:salesperson_id',
  authenticateToken,
  vanInventoryController.getSalespersonInventoryItems
);
export default router;
