import { Router } from 'express';
import { promotionProductsController } from '../controllers/promotionProducts.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createPromotionProductsValidations } from '../validations/promotionProducts.validator';
const router = Router();

router.post(
  '/promotion-products',
  authenticateToken,
  createPromotionProductsValidations,
  validate,
  promotionProductsController.createPromotionProduct
);
router.get(
  '/promotion-products',
  authenticateToken,
  promotionProductsController.getAllPromotionProducts
);
router.get(
  '/promotion-products/:id',
  authenticateToken,
  promotionProductsController.getPromotionProductById
);
router.put(
  '/promotion-products/:id',
  authenticateToken,
  promotionProductsController.updatePromotionProduct
);
router.delete(
  '/promotion-products/:id',
  authenticateToken,
  promotionProductsController.deletePromotionProduct
);

export default router;
