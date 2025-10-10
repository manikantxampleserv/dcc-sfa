import { body } from 'express-validator';

export const createProductValidation = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('base_price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage(
      'Base price must be a decimal with up to 2 digits after decimal'
    ),

  body('tax_rate')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage(
      'Tax rate must be a decimal with up to 2 digits after decimal'
    ),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be either "Y" or "N"'),
];
