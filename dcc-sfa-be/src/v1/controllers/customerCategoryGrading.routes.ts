import { Router } from 'express';
import { customerCategoryGradingController } from '../controllers/customerCategoryGrading.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';

const router = Router();

router.get(
  '/customerCategoryGrading/pending',
  authenticateToken,
  customerCategoryGradingController.getPendingGradingRequests
);
router.get(
  '/customerCategoryGrading/:id',
  authenticateToken,
  customerCategoryGradingController.getGradingRequestById
);
router.put(
  '/customerCategoryGrading/:id/process',
  authenticateToken,
  customerCategoryGradingController.processGradingRequest
);
router.put(
  '/customerCategoryGrading/bulk-process',
  authenticateToken,
  customerCategoryGradingController.bulkProcessGradingRequests
);
router.get(
  '/customerCategoryGrading/stats/summary',
  authenticateToken,
  customerCategoryGradingController.getGradingStats
);

export default router;
