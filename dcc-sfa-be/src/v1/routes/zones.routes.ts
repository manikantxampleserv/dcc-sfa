import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { zonesController } from '../controllers/zones.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createZoneValidation } from '../validations/zones.validation';

const router = Router();

router.post(
  '/zones',
  authenticateToken,
  createZoneValidation,
  validate,
  zonesController.createZone
);

router.get('/zones/:id', authenticateToken, zonesController.getZoneById);
router.get('/zones', authenticateToken, zonesController.getZones);

router.put('/zones/:id', authenticateToken, zonesController.updateZone);

router.delete('/zones/:id', authenticateToken, zonesController.deleteZone);

export default router;
