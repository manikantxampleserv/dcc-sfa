import { body } from 'express-validator';

export const createProductFlavourValidation = [
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

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
