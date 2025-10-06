import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { inventoryStockController } from '../controllers/inventoryStock.controller';

const router = Router();

router.post(
  '/inventory-stock',
  authenticateToken,
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
  inventoryStockController.updateInventoryStock
);
router.delete(
  '/inventory-stock/:id',
  authenticateToken,
  inventoryStockController.deleteInventoryStock
);

export default router;
