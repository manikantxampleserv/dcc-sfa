import { body } from 'express-validator';

export const createCreditNoteItemsValidator = [
  body('parent_id').isInt().withMessage('parent_id must be an integer'),
  body('product_id').isInt().withMessage('product_id must be an integer'),
  body('quantity').isInt().withMessage('quantity must be an integer'),
  body('unit_price').isFloat().withMessage('unit_price must be a float'),
  body('discount_amount')
    .isFloat()
    .withMessage('discount_amount must be a float'),
  body('tax_amount').isFloat().withMessage('tax_amount must be a float'),
  body('total_amount').isFloat().withMessage('total_amount must be a float'),
  body('notes').isString().withMessage('notes must be a string'),
];
