import { Router } from 'express';
import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { surveysController } from '../controllers/surveys.controller';
import { createSurveyValidation } from '../validations/surveys.validation';

const router = Router();

router.post(
  '/surveys',
  authenticateToken,
  auditCreate('surveys'),
  requirePermission([{ module: 'survey', action: 'create' }]),
  createSurveyValidation,
  surveysController.createOrUpdateSurvey
);

router.get(
  '/surveys',
  authenticateToken,
  requirePermission([{ module: 'survey', action: 'read' }]),
  surveysController.getAllSurveys
);

router.get(
  '/surveys/:id',
  authenticateToken,
  requirePermission([{ module: 'survey', action: 'read' }]),
  surveysController.getSurveyById
);

router.delete(
  '/surveys/:id',
  authenticateToken,
  auditDelete('surveys'),
  requirePermission([{ module: 'survey', action: 'delete' }]),
  surveysController.deleteSurvey
);

router.patch(
  '/surveys/:id/publish',
  authenticateToken,
  requirePermission([{ module: 'survey', action: 'update' }]),
  surveysController.publishSurvey
);

export default router;
