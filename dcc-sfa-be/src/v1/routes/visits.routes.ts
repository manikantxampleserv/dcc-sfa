import { Router } from 'express';
import { visitsController } from '../controllers/visits.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/reports/visits',
  authenticateToken,
  visitsController.createVisits
);
router.get('/reports/visits', authenticateToken, visitsController.getAllVisits);
router.get(
  '/reports/visits/:id',
  authenticateToken,
  visitsController.getVisitsById
);
router.put(
  '/reports/visits/:id',
  authenticateToken,
  visitsController.updateVisits
);
router.delete(
  '/reports/visits/:id',
  authenticateToken,
  visitsController.deleteVisits
);

export default router;
