import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { executiveDashboardController } from '../controllers/executiveDashboard.controller';

const router = Router();

router.get(
  '/dashboard/statistics',
  authenticateToken,
  executiveDashboardController.getStatistics
);

router.get(
  '/dashboard/sales-performance',
  authenticateToken,
  executiveDashboardController.getSalesPerformance
);

router.get(
  '/dashboard/top-products',
  authenticateToken,
  executiveDashboardController.getTopProducts
);

router.get(
  '/dashboard/order-status',
  authenticateToken,
  executiveDashboardController.getOrderStatus
);

export default router;
