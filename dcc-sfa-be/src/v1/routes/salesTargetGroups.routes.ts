import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createSalesTargetGroupsValidation,
  validate,
  salesTargetGroupsController.createSalesTargetGroups
);

router.get(
  '/sales-target-groups',
  authenticateToken,
  salesTargetGroupsController.getAllSalesTargetGroups
);

router.put(
  '/sales-target-groups/:id',
  authenticateToken,
  auditUpdate('sales_target_groups'),
  salesTargetGroupsController.updateSalesTargetGroups
);
router.get(
  '/sales-target-groups/:id',
  authenticateToken,
  salesTargetGroupsController.getSalesTargetGroupsById
);

router.delete(
  '/sales-target-groups/:id',
  authenticateToken,
  auditDelete('sales_target_groups'),
  salesTargetGroupsController.deleteSalesTargetGroups
);

export default router;
