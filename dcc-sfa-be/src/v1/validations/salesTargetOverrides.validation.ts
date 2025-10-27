import { body } from 'express-validator';

export const createSalesTargetOverrideValidation = [
  body('sales_person_id').isInt().withMessage('Sales person ID is required'),
  body('product_category_id')
    .isInt()
    .withMessage('Product category ID is required'),
  body('target_quantity').isInt().withMessage('Target quantity is required'),
  body('target_amount').isFloat().withMessage('Target amount is required'),
  body('start_date').isDate().withMessage('Start date is required'),
  body('end_date').isDate().withMessage('End date is required'),
  body('is_active').isString().withMessage('Is active is required'),
];
