import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createZoneValidation,
  validate,
  zonesController.createZone
);

router.get('/zones/:id', authenticateToken, zonesController.getZoneById);
router.get('/zones', authenticateToken, zonesController.getZones);

router.put(
  '/zones/:id',
  authenticateToken,
  auditUpdate('zones'),
  zonesController.updateZone
);

router.delete(
  '/zones/:id',
  authenticateToken,
  auditDelete('zones'),
  zonesController.deleteZone
);

export default router;
