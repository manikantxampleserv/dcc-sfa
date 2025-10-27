import { body } from 'express-validator';

export const createPromotionParametersValidations = [
  body('promotion_id').isInt().withMessage('promotion_id must be an integer'),
  body('param_name').isString().withMessage('param_name must be a string'),
  body('param_type').isString().withMessage('param_type must be a string'),
  body('param_value')
    .optional()
    .isString()
    .withMessage('param_value must be a string'),
  body('param_category')
    .isString()
    .withMessage('param_category must be a string'),
  body('is_active').isString().withMessage('is_active must be a string'),
];
