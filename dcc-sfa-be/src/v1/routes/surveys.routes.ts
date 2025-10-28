import { Router } from 'express';
import { surveysController } from '../controllers/surveys.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createSurveyValidation } from '../validations/surveys.validation';

const router = Router();

router.post(
  '/surveys',
  authenticateToken,
  auditCreate('surveys'),
  createSurveyValidation,
  surveysController.createSurvey
);

router.get('/surveys', authenticateToken, surveysController.getAllSurveys);

router.get('/surveys/:id', authenticateToken, surveysController.getSurveyById);

router.put(
  '/surveys/:id',
  authenticateToken,
  auditUpdate('surveys'),
  createSurveyValidation,
  surveysController.updateSurvey
);

router.delete(
  '/surveys/:id',
  authenticateToken,
  auditDelete('surveys'),
  surveysController.deleteSurvey
);

router.patch(
  '/surveys/:id/publish',
  authenticateToken,
  surveysController.publishSurvey
);

export default router;
