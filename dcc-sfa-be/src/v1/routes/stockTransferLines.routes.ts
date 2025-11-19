import express from 'express';
import { auditDelete } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { stockTransferLinesController } from '../controllers/stockTransferLines.controller';

const router = express.Router();

router.get(
  '/stock-transfer-lines/:id',
  authenticateToken,
  requirePermission([{ module: 'stock-transfer', action: 'read' }]),
  stockTransferLinesController.getStockTransferLineById
);
router.get(
  '/stock-transfer-lines',
  authenticateToken,
  requirePermission([{ module: 'stock-transfer', action: 'read' }]),
  stockTransferLinesController.getAllStockTransferLines
);

router.delete(
  '/stock-transfer-lines/:id',
  authenticateToken,
  auditDelete('stock_transfer_lines'),
  requirePermission([{ module: 'stock-transfer', action: 'delete' }]),
  stockTransferLinesController.deleteStockTransferLine
);

export default router;
