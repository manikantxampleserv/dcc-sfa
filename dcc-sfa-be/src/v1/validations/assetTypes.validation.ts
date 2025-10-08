import { body } from 'express-validator';

export const createAssetTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters'),

  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),

  body('brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string')
    .isLength({ max: 100 })
    .withMessage('Brand must be less than 100 characters'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
