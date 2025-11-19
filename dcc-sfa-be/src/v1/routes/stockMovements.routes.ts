import express from 'express';
import { stockMovementsController } from '../controllers/stockMovements.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
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
  requirePermission([{ module: 'stock-movement', action: 'create' }]),
  createStockMovementValidation,
  validate,
  stockMovementsController.createStockMovement
);

router.put(
  '/stock-movements/:id',
  authenticateToken,
  auditUpdate('stock_movements'),
  requirePermission([{ module: 'stock-movement', action: 'update' }]),
  updateStockMovementValidation,
  validate,
  stockMovementsController.updateStockMovement
);

router.get(
  '/stock-movements/:id',
  authenticateToken,
  requirePermission([{ module: 'stock-movement', action: 'read' }]),
  stockMovementsController.getStockMovementById
);

router.get(
  '/stock-movements',
  authenticateToken,
  requirePermission([{ module: 'stock-movement', action: 'read' }]),
  stockMovementsController.getAllStockMovements
);

router.delete(
  '/stock-movements/:id',
  authenticateToken,
  auditDelete('stock_movements'),
  requirePermission([{ module: 'stock-movement', action: 'delete' }]),
  stockMovementsController.deleteStockMovement
);

export default router;
