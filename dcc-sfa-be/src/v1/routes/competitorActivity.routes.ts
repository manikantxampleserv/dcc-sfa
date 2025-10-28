import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { competitorActivityController } from '../controllers/competitorActivity.controller';
import { createCompetitorActivityValidation } from '../validations/competitorActivity.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/competitor-activity',
  authenticateToken,
  auditCreate('competitor_activities'),
  createCompetitorActivityValidation,
  validate,
  competitorActivityController.createCompetitorActivity
);

router.get(
  '/competitor-activity/:id',
  authenticateToken,
  validate,
  competitorActivityController.getCompetitorActivityById
);

router.get(
  '/competitor-activity',
  authenticateToken,
  competitorActivityController.getCompetitorActivities
);

router.put(
  '/competitor-activity/:id',
  authenticateToken,
  auditUpdate('competitor_activities'),
  competitorActivityController.updateCompetitorActivity
);

router.delete(
  '/competitor-activity/:id',
  authenticateToken,
  auditDelete('competitor_activities'),
  competitorActivityController.deleteCompetitorActivity
);

export default router;
