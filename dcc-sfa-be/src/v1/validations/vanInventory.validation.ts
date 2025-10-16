import { body } from 'express-validator';

export const createVanInventoryValidation = [
  body('user_id').isInt().withMessage('User ID is required'),
  body('product_id').isInt().withMessage('Product ID is required'),
  body('batch_id')
    .optional()
    .isInt()
    .withMessage('Batch ID must be an integer'),
  body('serial_no_id')
    .optional()
    .isInt()
    .withMessage('Serial No ID must be an integer'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reserved_quantity')
    .isInt()
    .withMessage('Reserved Quantity must be an integer'),
  body('available_quantity')
    .isInt()
    .withMessage('Available Quantity must be an integer'),
  body('is_active').isString().withMessage('Is Active must be a string'),
];
