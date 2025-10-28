import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { inventoryStockController } from '../controllers/inventoryStock.controller';

const router = Router();

router.post(
  '/inventory-stock',
  authenticateToken,
  auditCreate('inventory_stock'),
  inventoryStockController.createInventoryStock
);
router.get(
  '/inventory-stock',
  authenticateToken,
  inventoryStockController.getAllInventoryStock
);
router.get(
  '/inventory-stock/:id',
  authenticateToken,
  inventoryStockController.getInventoryStockById
);
router.put(
  '/inventory-stock/:id',
  authenticateToken,
  auditUpdate('inventory_stock'),
  inventoryStockController.updateInventoryStock
);
router.delete(
  '/inventory-stock/:id',
  authenticateToken,
  auditDelete('inventory_stock'),
  inventoryStockController.deleteInventoryStock
);

export default router;
