import { body } from 'express-validator';

export const createSalesTargetValidation = [
  body('sales_target_group_id')
    .notEmpty()
    .withMessage('Sales target group ID is required')
    .isInt({ min: 1 })
    .withMessage('Sales target group ID must be a positive integer'),

  body('product_category_id')
    .notEmpty()
    .withMessage('Product category ID is required')
    .isInt({ min: 1 })
    .withMessage('Product category ID must be a positive integer'),

  body('target_quantity')
    .notEmpty()
    .withMessage('Target quantity is required')
    .isInt({ min: 1 })
    .withMessage('Target quantity must be a positive integer'),

  body('target_amount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Target amount must be a valid decimal number')
    .custom(value => {
      if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Target amount must be non-negative');
      }
      return true;
    }),

  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (
        req.body.start_date &&
        new Date(value) <= new Date(req.body.start_date)
      ) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateSalesTargetValidation = [
  body('sales_target_group_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sales target group ID must be a positive integer'),

  body('product_category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product category ID must be a positive integer'),

  body('target_quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target quantity must be a positive integer'),

  body('target_amount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Target amount must be a valid decimal number')
    .custom(value => {
      if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Target amount must be non-negative');
      }
      return true;
    }),

  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (
        value &&
        req.body.start_date &&
        new Date(value) <= new Date(req.body.start_date)
      ) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
