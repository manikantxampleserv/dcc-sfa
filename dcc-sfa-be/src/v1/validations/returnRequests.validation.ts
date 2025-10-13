import { body } from 'express-validator';

export const returnRequestsValidation = [
  body('customer_id').isInt().withMessage('Customer ID is required'),
  body('product_id').isInt().withMessage('Product ID is required'),
  body('serial_id')
    .optional()
    .isInt()
    .withMessage('Serial ID must be an integer'),
  body('return_date').isDate().withMessage('Return date must be a valid date'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('status').optional().isString().withMessage('Status must be a string'),
  body('approved_by')
    .optional()
    .isInt()
    .withMessage('Approved by must be an integer'),
  body('approved_date')
    .optional()
    .isDate()
    .withMessage('Approved date must be a valid date'),
  body('resolution_notes')
    .optional()
    .isString()
    .withMessage('Resolution notes must be a string'),
  body('is_active')
    .optional()
    .isString()
    .withMessage('Is active must be a string'),
];
