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
import { zonesController } from '../controllers/zones.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createZoneValidation } from '../validations/zones.validation';

const router = Router();

router.post(
  '/zones',
  authenticateToken,
  auditCreate('zones'),
  requirePermission([{ module: 'zone', action: 'create' }]),
  createZoneValidation,
  validate,
  zonesController.createZone
);

router.get(
  '/zones/:id',
  authenticateToken,
  requirePermission([{ module: 'zone', action: 'read' }]),
  zonesController.getZoneById
);
router.get(
  '/zones',
  authenticateToken,
  requirePermission([{ module: 'zone', action: 'read' }]),
  zonesController.getZones
);

router.put(
  '/zones/:id',
  authenticateToken,
  auditUpdate('zones'),
  requirePermission([{ module: 'zone', action: 'update' }]),
  zonesController.updateZone
);

router.delete(
  '/zones/:id',
  authenticateToken,
  auditDelete('zones'),
  requirePermission([{ module: 'zone', action: 'delete' }]),
  zonesController.deleteZone
);

export default router;
