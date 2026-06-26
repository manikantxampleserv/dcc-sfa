import { body } from 'express-validator';

export const saveReconciliationValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),
  
  body('items.*.id')
    .isInt()
    .withMessage('Item ID must be an integer'),
  
  body('items.*.actual_qty')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Actual Quantity must be a number'),
];
