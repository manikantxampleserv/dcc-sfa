import { Router } from 'express';
import { promotionParametersController } from '../controllers/promotionParameters.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createPromotionParametersValidations } from '../validations/promotionParameters.validator';
const router = Router();

router.post(
  '/promotion-parameters',
  authenticateToken,
  auditCreate('promotion_parameters'),
  requirePermission([{ module: 'product', action: 'create' }]),
  createPromotionParametersValidations,
  validate,
  promotionParametersController.createPromotionParameter
);
router.get(
  '/promotion-parameters',
  authenticateToken,
  requirePermission([{ module: 'product', action: 'read' }]),
  promotionParametersController.getAllPromotionParameters
);
router.get(
  '/promotion-parameters/:id',
  authenticateToken,
  requirePermission([{ module: 'product', action: 'read' }]),
  promotionParametersController.getPromotionParameterById
);
router.put(
  '/promotion-parameters/:id',
  authenticateToken,
  auditUpdate('promotion_parameters'),
  requirePermission([{ module: 'product', action: 'update' }]),
  promotionParametersController.updatePromotionParameter
);
router.delete(
  '/promotion-parameters/:id',
  authenticateToken,
  auditDelete('promotion_parameters'),
  requirePermission([{ module: 'product', action: 'delete' }]),
  promotionParametersController.deletePromotionParameter
);

export default router;
