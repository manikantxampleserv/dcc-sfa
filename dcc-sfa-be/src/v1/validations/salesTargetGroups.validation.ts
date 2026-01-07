import { body } from 'express-validator';

export const createSalesTargetGroupsValidation = [
  body('sales_target_id').notEmpty().withMessage('Sales Target is required'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
