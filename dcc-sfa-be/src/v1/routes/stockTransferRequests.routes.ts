import express from 'express';
import { stockTransferRequestsController } from '../controllers/stockTransferRequests.controller';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createStockTransferRequestValidation } from '../validations/stockTransferRequests.validation';
import { validate } from '../../middlewares/validation.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/stock-transfer-requests',
  authenticateToken,
  auditCreate('stock_transfer_requests'),
  createStockTransferRequestValidation,
  validate,
  stockTransferRequestsController.upsertStockTransferRequest
);
router.get(
  '/stock-transfer-requests',
  authenticateToken,
  stockTransferRequestsController.getAllStockTransferRequests
);
router.get(
  '/stock-transfer-requests/:id',
  authenticateToken,
  stockTransferRequestsController.getStockTransferRequestById
);

router.delete(
  '/stock-transfer-requests/:id',
  authenticateToken,
  auditDelete('stock_transfer_requests'),
  stockTransferRequestsController.deleteStockTransferRequest
);

export default router;
