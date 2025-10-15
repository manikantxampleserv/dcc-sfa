import { body } from 'express-validator';

export const createInvoiceValidation = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('invoice_date')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invoice date must be a valid date'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage(
      'Status must be one of: draft, sent, paid, overdue, cancelled'
    ),

  body('payment_method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'])
    .withMessage(
      'Payment method must be one of: cash, credit, debit, check, bank_transfer, online'
    ),

  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),

  body('currency_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Currency ID must be a positive integer'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a non-negative number'),

  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a non-negative number'),

  body('tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a non-negative number'),

  body('shipping_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping amount must be a non-negative number'),

  body('total_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a non-negative number'),

  body('amount_paid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount paid must be a non-negative number'),

  body('balance_due')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance due must be a non-negative number'),

  body('notes').optional().isString().withMessage('Notes must be a string'),

  body('billing_address')
    .optional()
    .isString()
    .withMessage('Billing address must be a string'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is active must be Y or N'),

  body('invoiceItems')
    .optional()
    .isArray()
    .withMessage('Invoice items must be an array'),

  body('invoiceItems.*.product_id')
    .if(body('invoiceItems').exists())
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('invoiceItems.*.quantity')
    .if(body('invoiceItems').exists())
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number'),

  body('invoiceItems.*.unit_price')
    .if(body('invoiceItems').exists())
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),

  body('invoiceItems.*.discount_amount')
    .if(body('invoiceItems').exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a non-negative number'),

  body('invoiceItems.*.tax_amount')
    .if(body('invoiceItems').exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a non-negative number'),

  body('invoiceItems.*.notes')
    .if(body('invoiceItems').exists())
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
];

export const updateInvoiceValidation = [
  body('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('invoice_date')
    .optional()
    .isISO8601()
    .withMessage('Invoice date must be a valid date'),

  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage(
      'Status must be one of: draft, sent, paid, overdue, cancelled'
    ),

  body('payment_method')
    .optional()
    .isIn(['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'])
    .withMessage(
      'Payment method must be one of: cash, credit, debit, check, bank_transfer, online'
    ),

  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),

  body('currency_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Currency ID must be a positive integer'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a non-negative number'),

  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a non-negative number'),

  body('tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a non-negative number'),

  body('shipping_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping amount must be a non-negative number'),

  body('total_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a non-negative number'),

  body('amount_paid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount paid must be a non-negative number'),

  body('balance_due')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance due must be a non-negative number'),

  body('notes').optional().isString().withMessage('Notes must be a string'),

  body('billing_address')
    .optional()
    .isString()
    .withMessage('Billing address must be a string'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is active must be Y or N'),

  body('invoiceItems')
    .optional()
    .isArray()
    .withMessage('Invoice items must be an array'),

  body('invoiceItems.*.product_id')
    .if(body('invoiceItems').exists())
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('invoiceItems.*.quantity')
    .if(body('invoiceItems').exists())
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number'),

  body('invoiceItems.*.unit_price')
    .if(body('invoiceItems').exists())
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),

  body('invoiceItems.*.discount_amount')
    .if(body('invoiceItems').exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a non-negative number'),

  body('invoiceItems.*.tax_amount')
    .if(body('invoiceItems').exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a non-negative number'),

  body('invoiceItems.*.notes')
    .if(body('invoiceItems').exists())
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
];
