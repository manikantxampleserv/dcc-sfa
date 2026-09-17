import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { coolerTrackingDashboardController } from '../controllers/coolerTrackingDashboard.controller';

const router = Router();

/**
 * @route GET /api/v1/reports/cooler-tracking-dashboard
 * @description Aggregated data for the Cooler Tracking Dashboard (outlet,
 *              coverage, and depot views). Returns the full dataset in one
 *              call — mirrors the shape of the legacy mockData.json.
 * @access Private — requires authentication + report:read permission
 */
router.get(
  '/cooler-tracking-dashboard',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  coolerTrackingDashboardController.getDashboardData
);

export default router;
