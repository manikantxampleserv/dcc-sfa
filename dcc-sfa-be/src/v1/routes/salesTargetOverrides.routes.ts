import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { salesTargetOverridesController } from '../controllers/salesTargetOverrides.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createSalesTargetOverrideValidation } from '../validations/salesTargetOverrides.validation';

const router = Router();

router.post(
  '/sales-target-overrides',
  authenticateToken,
  auditCreate('sales_target_overrides'),
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
  auditUpdate('sales_target_overrides'),
  salesTargetOverridesController.updateSalesTargetOverride
);
router.delete(
  '/sales-target-overrides/:id',
  authenticateToken,
  auditDelete('sales_target_overrides'),
  salesTargetOverridesController.deleteSalesTargetOverride
);

export default router;
