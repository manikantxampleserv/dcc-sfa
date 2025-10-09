import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { salesTargetGroupsController } from '../controllers/salesTargetGroups.controller';
import { createSalesTargetGroupsValidation } from '../validations/salesTargetGroups.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/sales-target-groups',
  authenticateToken,
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
  salesTargetGroupsController.deleteSalesTargetGroups
);

export default router;
