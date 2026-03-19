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

router.post('/regions', authenticateToken, regionsController.createRegions);

router.get('/regions/:id', authenticateToken, regionsController.getRegionsById);

router.get('/regions', authenticateToken, regionsController.getAllRegions);

router.put(
  '/regions/:id',
  authenticateToken,
  auditUpdate('regions'),
  requirePermission([{ module: 'role', action: 'update' }]),
  regionsController.updateRegions
);

router.delete(
  '/regions/:id',
  authenticateToken,
  auditDelete('regions'),
  requirePermission([{ module: 'role', action: 'delete' }]),
  regionsController.deleteRegions
);

export default router;
