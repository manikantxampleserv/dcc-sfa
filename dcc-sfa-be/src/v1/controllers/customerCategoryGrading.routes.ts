import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { customerCategoryGradingController } from '../controllers/customerCategoryGrading.controller';

const router = Router();

router.get(
  '/customerCategoryGrading/:id',
  authenticateToken,
  customerCategoryGradingController.getGradingRequestById
);
router.get(
  '/customerCategoryGrading',
  authenticateToken,
  customerCategoryGradingController.getAllGradingRequests
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
