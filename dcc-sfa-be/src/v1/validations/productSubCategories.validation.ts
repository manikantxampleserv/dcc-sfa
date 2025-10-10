import { body } from 'express-validator';

export const createProductSubCategoriesValidation = [
  body('sub_category_name').notEmpty().withMessage('Name is required'),
  body('product_category_id')
    .notEmpty()
    .withMessage('Product Category ID is required'),
  body('description').optional(),
  body('is_active').optional().isIn(['Y', 'N']).withMessage('Invalid status'),
];
