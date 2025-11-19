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
import { salesTargetGroupsController } from '../controllers/salesTargetGroups.controller';
import { createSalesTargetGroupsValidation } from '../validations/salesTargetGroups.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/sales-target-groups',
  authenticateToken,
  auditCreate('sales_target_groups'),
  requirePermission([{ module: 'sales-target-group', action: 'create' }]),
  createSalesTargetGroupsValidation,
  validate,
  salesTargetGroupsController.createSalesTargetGroups
);

router.get(
  '/sales-target-groups',
  authenticateToken,
  requirePermission([{ module: 'sales-target-group', action: 'read' }]),
  salesTargetGroupsController.getAllSalesTargetGroups
);

router.put(
  '/sales-target-groups/:id',
  authenticateToken,
  auditUpdate('sales_target_groups'),
  requirePermission([{ module: 'sales-target-group', action: 'update' }]),
  salesTargetGroupsController.updateSalesTargetGroups
);
router.get(
  '/sales-target-groups/:id',
  authenticateToken,
  requirePermission([{ module: 'sales-target-group', action: 'read' }]),
  salesTargetGroupsController.getSalesTargetGroupsById
);

router.delete(
  '/sales-target-groups/:id',
  authenticateToken,
  auditDelete('sales_target_groups'),
  requirePermission([{ module: 'sales-target-group', action: 'delete' }]),
  salesTargetGroupsController.deleteSalesTargetGroups
);

export default router;
