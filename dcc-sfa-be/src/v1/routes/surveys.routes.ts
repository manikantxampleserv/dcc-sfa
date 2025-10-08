import { Router } from 'express';
import { surveysController } from '../controllers/surveys.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createSurveyValidation } from '../validations/surveys.validation';

const router = Router();

router.post(
  '/surveys',
  authenticateToken,
  createSurveyValidation,
  surveysController.createSurvey
);

router.get('/surveys', authenticateToken, surveysController.getAllSurveys);

router.get('/surveys/:id', authenticateToken, surveysController.getSurveyById);

router.put(
  '/surveys/:id',
  authenticateToken,
  createSurveyValidation,
  surveysController.updateSurvey
);

router.delete(
  '/surveys/:id',
  authenticateToken,
  surveysController.deleteSurvey
);

router.patch(
  '/surveys/:id/publish',
  authenticateToken,
  surveysController.publishSurvey
);

export default router;
