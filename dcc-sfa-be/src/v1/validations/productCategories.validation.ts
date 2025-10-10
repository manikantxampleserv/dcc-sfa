import { body, param, query } from 'express-validator';

export const createProductCategoriesValidation = [
  body('category_name').notEmpty().withMessage('Category name is required'),
  body('description').optional(),
  body('is_active').optional().isIn(['Y', 'N']).withMessage('Invalid status'),
];
