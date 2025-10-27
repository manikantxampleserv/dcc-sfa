import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { salesTargetOverridesController } from '../controllers/salesTargetOverrides.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createSalesTargetOverrideValidation } from '../validations/salesTargetOverrides.validation';

const router = Router();

router.post(
  '/sales-target-overrides',
  authenticateToken,
  createSalesTargetOverrideValidation,
  validate,
  salesTargetOverridesController.createSalesTargetOverride
);
router.get(
  '/sales-target-overrides',
  authenticateToken,
  salesTargetOverridesController.getAllSalesTargetOverrides
);
router.get(
  '/sales-target-overrides/:id',
  authenticateToken,
  salesTargetOverridesController.getSalesTargetOverrideById
);
router.put(
  '/sales-target-overrides/:id',
  authenticateToken,
  salesTargetOverridesController.updateSalesTargetOverride
);
router.delete(
  '/sales-target-overrides/:id',
  authenticateToken,
  salesTargetOverridesController.deleteSalesTargetOverride
);

export default router;
