import { Router } from 'express';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { templatesController } from '../controllers/templates.controller';

const router = Router();

router.post(
  '/templates',
  authenticateToken,
  auditCreate('templates'),
  templatesController.createTemplates
);

router.get(
  '/templates/:id',
  authenticateToken,
  templatesController.getTemplatesById
);

router.get('/templates', authenticateToken, templatesController.getTemplates);

router.put(
  '/templates/:id',
  authenticateToken,
  auditUpdate('templates'),
  templatesController.updateTemplates
);

router.delete(
  '/templates/:id',
  authenticateToken,
  auditDelete('templates'),
  templatesController.deleteTemplates
);

export default router;
