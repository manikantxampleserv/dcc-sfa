import { body } from 'express-validator';

export const createSubunitValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),

  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 100 })
    .withMessage('Code must not exceed 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('unit_of_measurement_id')
    .isInt({ min: 1 })
    .withMessage('Unit of measurement ID is required and must be a positive integer'),

  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID is required and must be a positive integer'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),

  body('log_inst')
    .optional()
    .isInt()
    .withMessage('Log instance must be a number'),
];

export const updateSubunitValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),

  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 100 })
    .withMessage('Code must not exceed 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('unit_of_measurement_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Unit of measurement ID must be a positive integer'),

  body('product_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),

  body('log_inst')
    .optional()
    .isInt()
    .withMessage('Log instance must be a number'),
];
