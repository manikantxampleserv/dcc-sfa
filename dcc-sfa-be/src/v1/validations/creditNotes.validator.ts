import { body } from 'express-validator';

export const createCreditNotesValidator = [
  body('parent_id').notEmpty().withMessage('Parent ID is required'),
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('credit_note_date')
    .notEmpty()
    .withMessage('Credit Note Date is required'),
  body('due_date').notEmpty().withMessage('Due Date is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('payment_method').notEmpty().withMessage('Payment Method is required'),
  body('subtotal').notEmpty().withMessage('Subtotal is required'),
  body('discount_amount').notEmpty().withMessage('Discount Amount is required'),
  body('tax_amount').notEmpty().withMessage('Tax Amount is required'),
  body('shipping_amount').notEmpty().withMessage('Shipping Amount is required'),
  body('total_amount').notEmpty().withMessage('Total Amount is required'),
  body('amount_applied').notEmpty().withMessage('Amount Applied is required'),
  body('balance_due').notEmpty().withMessage('Balance Due is required'),
  body('notes').optional(),
  body('billing_address').optional(),
  body('is_active').optional(),
  body('currency_id').notEmpty().withMessage('Currency ID is required'),
];
