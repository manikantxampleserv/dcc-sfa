import express from 'express';
import { stockMovementsController } from '../controllers/stockMovements.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  createStockMovementValidation,
  updateStockMovementValidation,
} from '../validations/stockMovements.validation';

const router = express.Router();

router.post(
  '/stock-movements',
  authenticateToken,
  createStockMovementValidation,
  validate,
  stockMovementsController.createStockMovement
);

router.put(
  '/stock-movements/:id',
  authenticateToken,
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
  stockMovementsController.deleteStockMovement
);

export default router;
