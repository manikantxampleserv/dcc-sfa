import { body } from 'express-validator';

export const createOrderValidation = [
  body('parent_id').notEmpty().withMessage('Parent ID is required'),
  body('salesperson_id').notEmpty().withMessage('SalesPerson ID is required'),
  body('is_active')
    .notEmpty()
    .isIn(['Y', 'N'])
    .notEmpty()
    .withMessage('Is active must be Y or N'),
];
