import { body } from 'express-validator';

export const createPromotionProductsValidations = [
  body('promotion_id').isInt().withMessage('promotion_id must be an integer'),
  body('product_id').isInt().withMessage('product_id must be an integer'),
  body('is_active').isString().withMessage('is_active must be a boolean'),
];
