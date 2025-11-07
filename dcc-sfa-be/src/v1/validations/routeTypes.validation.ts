import { body } from 'express-validator';

export const createRouteTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Route type name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Route type name must be between 1 and 100 characters')
    .trim(),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateRouteTypeValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Route type name must be between 1 and 100 characters')
    .trim(),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

