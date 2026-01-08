import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { competitorActivityController } from '../controllers/competitorActivity.controller';
import { createCompetitorActivityValidation } from '../validations/competitorActivity.validation';
import { validate } from '../../middlewares/validation.middleware';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/competitor-activity',
  upload.single('image'),
  authenticateToken,
  auditCreate('competitor_activities'),
  requirePermission([{ module: 'competitor', action: 'create' }]),
  createCompetitorActivityValidation,
  validate,
  competitorActivityController.createCompetitorActivity
);

router.get(
  '/competitor-activity/:id',
  authenticateToken,
  requirePermission([{ module: 'competitor', action: 'read' }]),
  validate,
  competitorActivityController.getCompetitorActivityById
);

router.get(
  '/competitor-activity',
  authenticateToken,
  requirePermission([{ module: 'competitor', action: 'read' }]),
  competitorActivityController.getCompetitorActivities
);

router.put(
  '/competitor-activity/:id',
  upload.single('image'),
  authenticateToken,
  auditUpdate('competitor_activities'),
  requirePermission([{ module: 'competitor', action: 'update' }]),
  competitorActivityController.updateCompetitorActivity
);

router.delete(
  '/competitor-activity/:id',
  authenticateToken,
  auditDelete('competitor_activities'),
  requirePermission([{ module: 'competitor', action: 'delete' }]),
  competitorActivityController.deleteCompetitorActivity
);

export default router;
