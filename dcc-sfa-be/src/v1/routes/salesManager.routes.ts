import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { salesManagerController } from '../controllers/salesManager.controller';

const router = Router();

router.get(
  '/sales-manager/territory/summary',
  authenticateToken,
  salesManagerController.getTerritorySummary
);

router.get(
  '/sales-manager/teams',
  authenticateToken,
  salesManagerController.getTeamMembers
);

router.get(
  '/sales-manager/territory/zones-and-routes',
  authenticateToken,
  salesManagerController.getZonesAndRoutes
);

router.get(
  '/sales-manager/zones/:zoneId/routes',
  authenticateToken,
  salesManagerController.getZoneRoutes
);
// Today summaru of saleperson

router.get(
  '/sales-manager/today-summary',
  authenticateToken,
  salesManagerController.getTodaySummary
);

router.get(
  '/sales-manager/outlets',
  authenticateToken,
  salesManagerController.getOutlets
);

router.get(
  '/sales-manager/outlets/:id',
  authenticateToken,
  salesManagerController.getOutletDetails
);
// Today summaru of saleperson

// Target Dashboard & Details
router.get(
  '/sales-manager/target/summary',
  authenticateToken,
  salesManagerController.getTargetSummary
);

router.get(
  '/sales-manager/target/details',
  authenticateToken,
  salesManagerController.getTargetDetails
);

router.get(
  '/sales-manager/target/attention-routes',
  authenticateToken,
  salesManagerController.getAttentionRoutes
);

router.get(
  '/sales-manager/target/zones/:zoneId/routes',
  authenticateToken,
  salesManagerController.getZoneTargetRoutes
);
// Target Dashboard & Details

router.get(
  '/sales-manager/commission',
  authenticateToken,
  salesManagerController.getCommissionDetails
);

router.get(
  '/sales-manager/reports/coolers',
  authenticateToken,
  salesManagerController.getCoolerReport
);

router.get(
  '/sales-manager/reports/visits',
  authenticateToken,
  salesManagerController.getVisitsReport
);

router.get(
  '/sales-manager/reports/team',
  authenticateToken,
  salesManagerController.getTeamReport
);

export default router;
