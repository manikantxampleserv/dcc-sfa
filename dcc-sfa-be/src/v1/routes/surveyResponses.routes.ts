// import { Router } from 'express';
// import { authenticateToken } from '../../middlewares/auth.middleware';
// import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';
// import { surveyResponseController } from '../controllers/surveyResponses.controller';

// const router = Router();

// router.post(
//   '/survey-responses',
//   authenticateToken,
//   auditCreate('survey_response'),
//   surveyResponseController.createOrUpdateSurveyResponse
// );
// router.get(
//   '/survey-responses',
//   authenticateToken,
//   surveyResponseController.getAllSurveyResponses
// );
// router.get(
//   '/survey-responses/:id',
//   authenticateToken,
//   surveyResponseController.getSurveyResponseById
// );
// router.delete(
//   '/survey-responses/:id',
//   authenticateToken,
//   auditDelete('survey_response'),
//   surveyResponseController.deleteSurveyResponse
// );

// export default router;

import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';
import { surveyResponseController } from '../controllers/surveyResponses.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/survey-responses',
  authenticateToken,
  upload.single('photo'),
  auditCreate('survey_response'),
  surveyResponseController.createOrUpdateSurveyResponse
);

router.get(
  '/survey-responses',
  authenticateToken,
  surveyResponseController.getAllSurveyResponses
);

router.get(
  '/survey-responses/:id',
  authenticateToken,
  surveyResponseController.getSurveyResponseById
);

router.delete(
  '/survey-responses/:id',
  authenticateToken,
  auditDelete('survey_response'),
  surveyResponseController.deleteSurveyResponse
);

router.get(
  '/survey-responses/:responseId/answers',
  authenticateToken,
  surveyResponseController.getSurveyAnswers
);

export default router;
