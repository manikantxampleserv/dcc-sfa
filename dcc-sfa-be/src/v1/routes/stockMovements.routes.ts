import express from 'express';
import { stockMovementsController } from '../controllers/stockMovements.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/stock-movements',
  authenticateToken,
  stockMovementsController.createStockMovement
);

router.put(
  '/stock-movements/:id',
  authenticateToken,
  stockMovementsController.updateStockMovement
);
router.get(
  '/stock-movements/:id',
  authenticateToken,
  stockMovementsController.getStockMovementById
);
router.get(
  '/stock-movements',
  authenticateToken,
  stockMovementsController.getAllStockMovements
);

router.delete(
  '/stock-movements/:id',
  authenticateToken,
  stockMovementsController.deleteStockMovement
);

export default router;
