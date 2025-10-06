import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { inventoryStockController } from '../controllers/inventoryStock.controller';

const router = Router();

router.post(
  '/inventoryStock',
  authenticateToken,
  inventoryStockController.createInventoryStock
);
router.get(
  '/inventoryStock',
  authenticateToken,
  inventoryStockController.getAllInventoryStock
);
router.get(
  '/inventoryStock/:id',
  authenticateToken,
  inventoryStockController.getInventoryStockById
);
router.put(
  '/inventoryStock/:id',
  authenticateToken,
  inventoryStockController.updateInventoryStock
);
router.delete(
  '/inventoryStock/:id',
  authenticateToken,
  inventoryStockController.deleteInventoryStock
);

export default router;
