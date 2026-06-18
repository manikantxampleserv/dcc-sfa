import { Router } from 'express';
import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { upload } from '../../utils/multer';
import { surveyResponseController } from '../controllers/surveyResponses.controller';

const router = Router();

router.post(
  '/survey-responses',
  authenticateToken,
  upload.single('photo'),
  auditCreate('survey_response'),
  requirePermission([{ module: 'survey', action: 'create' }]),
  surveyResponseController.createOrUpdateSurveyResponse
);

router.get(
  '/survey-responses',
  authenticateToken,
  requirePermission([{ module: 'survey', action: 'read' }]),
  surveyResponseController.getAllSurveyResponses
);

router.get(
  '/survey-responses/:id',
  authenticateToken,
  requirePermission([{ module: 'survey', action: 'read' }]),
  surveyResponseController.getSurveyResponseById
);

router.delete(
  '/survey-responses/:id',
  authenticateToken,
  auditDelete('survey_response'),
  requirePermission([{ module: 'survey', action: 'delete' }]),
  surveyResponseController.deleteSurveyResponse
);

router.get(
  '/survey-responses/:responseId/answers',
  authenticateToken,
  requirePermission([{ module: 'survey', action: 'read' }]),
  surveyResponseController.getSurveyAnswers
);

export default router;
