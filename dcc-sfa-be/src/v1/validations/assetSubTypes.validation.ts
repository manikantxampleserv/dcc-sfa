import { body } from 'express-validator';

export const createAssetSubTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),

  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 100 })
    .withMessage('Code must be less than 100 characters'),

  body('asset_type_id')
    .notEmpty()
    .withMessage('Asset type is required')
    .isInt()
    .withMessage('Asset type must be a valid integer'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
