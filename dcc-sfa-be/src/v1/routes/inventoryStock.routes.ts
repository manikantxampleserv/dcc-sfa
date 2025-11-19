import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
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
  requirePermission([{ module: 'warehouse', action: 'create' }]),
  inventoryStockController.createInventoryStock
);
router.get(
  '/inventory-stock',
  authenticateToken,
  requirePermission([{ module: 'warehouse', action: 'read' }]),
  inventoryStockController.getAllInventoryStock
);
router.get(
  '/inventory-stock/:id',
  authenticateToken,
  requirePermission([{ module: 'warehouse', action: 'read' }]),
  inventoryStockController.getInventoryStockById
);
router.put(
  '/inventory-stock/:id',
  authenticateToken,
  auditUpdate('inventory_stock'),
  requirePermission([{ module: 'warehouse', action: 'update' }]),
  inventoryStockController.updateInventoryStock
);
router.delete(
  '/inventory-stock/:id',
  authenticateToken,
  auditDelete('inventory_stock'),
  requirePermission([{ module: 'warehouse', action: 'delete' }]),
  inventoryStockController.deleteInventoryStock
);

export default router;
