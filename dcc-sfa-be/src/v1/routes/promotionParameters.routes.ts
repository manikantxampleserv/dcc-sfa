import { Router } from 'express';
import { promotionParametersController } from '../controllers/promotionParameters.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createPromotionParametersValidations,
  validate,
  promotionParametersController.createPromotionParameter
);
router.get(
  '/promotion-parameters',
  authenticateToken,
  promotionParametersController.getAllPromotionParameters
);
router.get(
  '/promotion-parameters/:id',
  authenticateToken,
  promotionParametersController.getPromotionParameterById
);
router.put(
  '/promotion-parameters/:id',
  authenticateToken,
  auditUpdate('promotion_parameters'),
  promotionParametersController.updatePromotionParameter
);
router.delete(
  '/promotion-parameters/:id',
  authenticateToken,
  auditDelete('promotion_parameters'),
  promotionParametersController.deletePromotionParameter
);

export default router;
