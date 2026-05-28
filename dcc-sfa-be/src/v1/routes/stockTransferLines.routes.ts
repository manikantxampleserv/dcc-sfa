import express from 'express';
import { auditDelete } from '../../middlewares/audit.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { stockTransferLinesController } from '../controllers/stockTransferLines.controller';

const router = express.Router();

router.get(
  '/stock-transfer-lines/:id',
  authenticateToken,
  stockTransferLinesController.getStockTransferLineById
);
router.get(
  '/stock-transfer-lines',
  authenticateToken,
  stockTransferLinesController.getAllStockTransferLines
);

router.delete(
  '/stock-transfer-lines/:id',
  authenticateToken,
  auditDelete('stock_transfer_lines'),
  stockTransferLinesController.deleteStockTransferLine
);

export default router;
