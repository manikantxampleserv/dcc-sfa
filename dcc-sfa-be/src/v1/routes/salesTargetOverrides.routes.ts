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
import { salesTargetOverridesController } from '../controllers/salesTargetOverrides.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createSalesTargetOverrideValidation } from '../validations/salesTargetOverrides.validation';

const router = Router();

router.post(
  '/sales-target-overrides',
  authenticateToken,
  auditCreate('sales_target_overrides'),
  requirePermission([{ module: 'sales-target', action: 'create' }]),
  createSalesTargetOverrideValidation,
  validate,
  salesTargetOverridesController.createSalesTargetOverride
);
router.get(
  '/sales-target-overrides',
  authenticateToken,
  requirePermission([{ module: 'sales-target', action: 'read' }]),
  salesTargetOverridesController.getAllSalesTargetOverrides
);
router.get(
  '/sales-target-overrides/:id',
  authenticateToken,
  requirePermission([{ module: 'sales-target', action: 'read' }]),
  salesTargetOverridesController.getSalesTargetOverrideById
);
router.put(
  '/sales-target-overrides/:id',
  authenticateToken,
  auditUpdate('sales_target_overrides'),
  requirePermission([{ module: 'sales-target', action: 'update' }]),
  salesTargetOverridesController.updateSalesTargetOverride
);
router.delete(
  '/sales-target-overrides/:id',
  authenticateToken,
  auditDelete('sales_target_overrides'),
  requirePermission([{ module: 'sales-target', action: 'delete' }]),
  salesTargetOverridesController.deleteSalesTargetOverride
);

export default router;
