import { Router } from 'express';
import { visitsController } from '../controllers/visits.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/reports/visits',
  authenticateToken,
  auditCreate('visits'),
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
  auditUpdate('visits'),
  visitsController.updateVisits
);
router.delete(
  '/reports/visits/:id',
  authenticateToken,
  auditDelete('visits'),
  visitsController.deleteVisits
);

export default router;
