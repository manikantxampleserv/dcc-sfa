import { body } from 'express-validator';

export const createWarehouseValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),

  body('type')
    .optional()
    .isString()
    .withMessage('Type must be a string')
    .isLength({ max: 50 })
    .withMessage('Type must be less than 50 characters'),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
