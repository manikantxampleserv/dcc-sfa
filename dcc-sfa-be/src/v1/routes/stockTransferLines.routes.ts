import express from 'express';
import { stockTransferLinesController } from '../controllers/stockTransferLines.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

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
  stockTransferLinesController.deleteStockTransferLine
);

export default router;
