import express from 'express';
import { stockTransferRequestsController } from '../controllers/stockTransferRequests.controller';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createStockTransferRequestValidation } from '../validations/stockTransferRequests.validation';
import { validate } from '../../middlewares/validation.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/stock-transfer-requests',
  authenticateToken,
  auditCreate('stock_transfer_requests'),
  requirePermission([{ module: 'stock-transfer', action: 'create' }]),
  createStockTransferRequestValidation,
  validate,
  stockTransferRequestsController.upsertStockTransferRequest
);
router.get(
  '/stock-transfer-requests',
  authenticateToken,
  requirePermission([{ module: 'stock-transfer', action: 'read' }]),
  stockTransferRequestsController.getAllStockTransferRequests
);
router.get(
  '/stock-transfer-requests/:id',
  authenticateToken,
  requirePermission([{ module: 'stock-transfer', action: 'read' }]),
  stockTransferRequestsController.getStockTransferRequestById
);

router.delete(
  '/stock-transfer-requests/:id',
  authenticateToken,
  auditDelete('stock_transfer_requests'),
  requirePermission([{ module: 'stock-transfer', action: 'delete' }]),
  stockTransferRequestsController.deleteStockTransferRequest
);

export default router;
