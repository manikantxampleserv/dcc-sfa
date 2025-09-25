import { body } from 'express-validator';

export const validateRole = [
  body('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 3 })
    .withMessage('Role name must be at least 3 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage("is_active must be either 'Y' or 'N'"),
];
