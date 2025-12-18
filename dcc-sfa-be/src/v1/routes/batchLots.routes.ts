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
import { batchLotsController } from '../controllers/batchLots.controller';
import {
  createBatchLotValidation,
  updateBatchLotValidation,
} from '../validations/batchLots.validation';

const router = Router();

router.post(
  '/batch-lots',
  authenticateToken,
  auditCreate('batch_lots'),
  requirePermission([{ module: 'batch-lots', action: 'create' }]),
  createBatchLotValidation,
  batchLotsController.createBatchLot
);

router.get(
  '/batch-lots-dropdown',
  authenticateToken,
  batchLotsController.getBatchLotsDropdown
);

router.get(
  '/batch-lots',
  authenticateToken,
  requirePermission([{ module: 'batch-lots', action: 'read' }]),
  batchLotsController.getAllBatchLots
);

router.get(
  '/batch-lots/:id',
  authenticateToken,
  requirePermission([{ module: 'batch-lots', action: 'read' }]),
  batchLotsController.getBatchLotById
);

router.put(
  '/batch-lots/:id',
  authenticateToken,
  auditUpdate('batch_lots'),
  requirePermission([{ module: 'batch-lots', action: 'update' }]),
  updateBatchLotValidation,
  batchLotsController.updateBatchLot
);

router.delete(
  '/batch-lots/:id',
  authenticateToken,
  auditDelete('batch_lots'),
  requirePermission([{ module: 'batch-lots', action: 'delete' }]),
  batchLotsController.deleteBatchLot
);

export default router;
