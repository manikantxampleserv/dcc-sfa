import { body } from 'express-validator';

export const createBrandValidation = [
  body('name').notEmpty().withMessage('Brand name is required'),
  body('code').notEmpty().withMessage('Brand code is required'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be either "Y" or "N"'),
];

export const updateBrandValidation = [
  body('name').optional().notEmpty().withMessage('Brand name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Brand code cannot be empty'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be either "Y" or "N"'),
];
