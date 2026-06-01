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
import { regionsController } from '../controllers/regions.controller';

const router = Router();

router.post(
  '/regions',
  authenticateToken,
  auditCreate('regions'),
  requirePermission([{ module: 'region', action: 'create' }]),
  regionsController.createRegions
);

router.get(
  '/regions/:id',
  authenticateToken,
  requirePermission([{ module: 'region', action: 'read' }]),
  regionsController.getRegionsById
);

router.get(
  '/regions',
  authenticateToken,
  requirePermission([{ module: 'region', action: 'read' }]),
  regionsController.getAllRegions
);

router.put(
  '/regions/:id',
  authenticateToken,
  auditUpdate('regions'),
  requirePermission([{ module: 'region', action: 'update' }]),
  regionsController.updateRegions
);

router.delete(
  '/regions/:id',
  authenticateToken,
  auditDelete('regions'),
  requirePermission([{ module: 'region', action: 'delete' }]),
  regionsController.deleteRegions
);

export default router;
