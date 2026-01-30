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
import { subunitsController } from '../controllers/subunits.controller';
import { validate } from '../../middlewares/validation.middleware';
import {
  createSubunitValidation,
  updateSubunitValidation,
} from '../validations/subunits.validation';

const router = Router();

router.post(
  '/subunits',
  authenticateToken,
  auditCreate('subunits'),
  createSubunitValidation,
  validate,
  subunitsController.createSubunit
);

router.get(
  '/subunits/:id',
  authenticateToken,
  subunitsController.getSubunitById
);
router.get('/subunits', authenticateToken, subunitsController.getSubunits);

router.put(
  '/subunits/:id',
  authenticateToken,
  auditUpdate('subunits'),
  updateSubunitValidation,
  validate,
  subunitsController.updateSubunit
);

router.delete(
  '/subunits/:id',
  authenticateToken,
  auditDelete('subunits'),
  subunitsController.deleteSubunit
);

router.get(
  '/subunits/lookup/units-of-measurement',
  authenticateToken,
  subunitsController.getUnitsOfMeasurement
);

router.get(
  '/subunits/lookup/products',
  authenticateToken,
  subunitsController.getProducts
);

export default router;
