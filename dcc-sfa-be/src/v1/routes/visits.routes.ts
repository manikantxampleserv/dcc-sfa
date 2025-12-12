import { Router } from 'express';
import { visitsController } from '../controllers/visits.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/visits',
  authenticateToken,
  auditCreate('visits'),
  requirePermission([{ module: 'visit', action: 'create' }]),
  visitsController.createVisits
);

router.post(
  '/reports/visits',
  authenticateToken,
  auditCreate('visits'),
  requirePermission([{ module: 'visit', action: 'create' }]),
  visitsController.bulkUpsertVisits
);
router.get(
  '/reports/visits',
  authenticateToken,
  requirePermission([{ module: 'visit', action: 'read' }]),
  visitsController.getAllVisits
);
router.get(
  '/reports/visits/:id',
  authenticateToken,
  requirePermission([{ module: 'visit', action: 'read' }]),
  visitsController.getVisitsById
);
router.put(
  '/reports/visits/:id',
  authenticateToken,
  auditUpdate('visits'),
  requirePermission([{ module: 'visit', action: 'update' }]),
  visitsController.updateVisits
);
router.delete(
  '/reports/visits/:id',
  authenticateToken,
  auditDelete('visits'),
  requirePermission([{ module: 'visit', action: 'delete' }]),
  visitsController.deleteVisits
);

export default router;
