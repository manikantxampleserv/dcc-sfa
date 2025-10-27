import { Router } from 'express';
import { promotionsController } from '../controllers/promotions.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createPromotionsValidations } from '../validations/promotions.validator';
const router = Router();

router.post(
  '/promotions',
  authenticateToken,
  createPromotionsValidations,
  validate,
  promotionsController.createPromotions
);
router.get(
  '/promotions',
  authenticateToken,
  promotionsController.getAllPromotions
);
router.get(
  '/promotions/:id',
  authenticateToken,
  promotionsController.getPromotionsById
);
router.put(
  '/promotions/:id',
  authenticateToken,
  validate,
  promotionsController.updatePromotions
);
router.delete(
  '/promotions/:id',
  authenticateToken,
  promotionsController.deletePromotions
);

export default router;
