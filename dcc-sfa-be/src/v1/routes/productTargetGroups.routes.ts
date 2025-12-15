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
import { productTargetGroupsController } from '../controllers/productTargetGroups.controller';
import { createProductTargetGroupValidation } from '../validations/productTargetGroups.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-target-groups',
  authenticateToken,
  auditCreate('product_target_group'),
  requirePermission([{ module: 'product-target-group', action: 'create' }]),
  createProductTargetGroupValidation,
  validate,
  productTargetGroupsController.createProductTargetGroup
);

router.get(
  '/product-target-groups/:id',
  authenticateToken,
  requirePermission([{ module: 'product-target-group', action: 'read' }]),
  validate,
  productTargetGroupsController.getProductTargetGroupById
);
router.get(
  '/product-target-groups',
  authenticateToken,
  requirePermission([{ module: 'product-target-group', action: 'read' }]),
  productTargetGroupsController.getProductTargetGroups
);

router.put(
  '/product-target-groups/:id',
  authenticateToken,
  auditUpdate('product_target_group'),
  requirePermission([{ module: 'product-target-group', action: 'update' }]),
  productTargetGroupsController.updateProductTargetGroup
);

router.delete(
  '/product-target-groups/:id',
  authenticateToken,
  auditDelete('product_target_group'),
  requirePermission([{ module: 'product-target-group', action: 'delete' }]),
  productTargetGroupsController.deleteProductTargetGroup
);

export default router;
