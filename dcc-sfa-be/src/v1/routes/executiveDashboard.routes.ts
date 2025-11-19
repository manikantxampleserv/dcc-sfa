import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { executiveDashboardController } from '../controllers/executiveDashboard.controller';

const router = Router();

router.get(
  '/dashboard/statistics',
  authenticateToken,
  requirePermission([{ module: 'dashboard', action: 'read' }]),
  executiveDashboardController.getStatistics
);

router.get(
  '/dashboard/sales-performance',
  authenticateToken,
  requirePermission([{ module: 'dashboard', action: 'read' }]),
  executiveDashboardController.getSalesPerformance
);

router.get(
  '/dashboard/top-products',
  authenticateToken,
  requirePermission([{ module: 'dashboard', action: 'read' }]),
  executiveDashboardController.getTopProducts
);

router.get(
  '/dashboard/order-status',
  authenticateToken,
  requirePermission([{ module: 'dashboard', action: 'read' }]),
  executiveDashboardController.getOrderStatus
);

export default router;
