import express from 'express';
import { stockMovementsController } from '../controllers/stockMovements.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  createStockMovementValidation,
  updateStockMovementValidation,
} from '../validations/stockMovements.validation';

const router = express.Router();

router.post(
  '/stock-movements',
  authenticateToken,
  auditCreate('stock_movements'),
  createStockMovementValidation,
  validate,
  stockMovementsController.createStockMovement
);

router.put(
  '/stock-movements/:id',
  authenticateToken,
  auditUpdate('stock_movements'),
  updateStockMovementValidation,
  validate,
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
  auditDelete('stock_movements'),
  stockMovementsController.deleteStockMovement
);

export default router;
