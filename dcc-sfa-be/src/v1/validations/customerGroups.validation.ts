import { body } from 'express-validator';

export const createCustomerGroupsValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('discount_percentage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount percentage must be a positive number'),

  body('credit_terms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Credit terms must be a positive integer'),

  body('payment_terms')
    .optional()
    .isString()
    .withMessage('Payment terms must be a string')
    .isLength({ max: 100 })
    .withMessage('Payment terms cannot exceed 100 characters'),

  body('price_group')
    .optional()
    .isString()
    .withMessage('Price group must be a string')
    .isLength({ max: 50 })
    .withMessage('Price group cannot exceed 50 characters'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be either "Y" or "N"'),
];
