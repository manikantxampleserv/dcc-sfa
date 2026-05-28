import { Router } from 'express';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { templatesController } from '../controllers/templates.controller';

const router = Router();

router.post(
  '/templates',
  authenticateToken,
  auditCreate('templates'),
  requirePermission([{ module: 'templates', action: 'create' }]),
  templatesController.createTemplates
);

router.get(
  '/templates/:id',
  authenticateToken,
  requirePermission([{ module: 'templates', action: 'read' }]),
  templatesController.getTemplatesById
);

router.get(
  '/templates',
  authenticateToken,
  requirePermission([{ module: 'templates', action: 'read' }]),
  templatesController.getTemplates
);

router.put(
  '/templates/:id',
  authenticateToken,
  auditUpdate('templates'),
  requirePermission([{ module: 'templates', action: 'update' }]),
  templatesController.updateTemplates
);

router.delete(
  '/templates/:id',
  authenticateToken,
  auditDelete('templates'),
  requirePermission([{ module: 'templates', action: 'delete' }]),
  templatesController.deleteTemplates
);

export default router;
