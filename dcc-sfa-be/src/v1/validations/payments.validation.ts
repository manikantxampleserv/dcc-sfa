import { body, ValidationChain } from 'express-validator';

/**
 * Validate payment data
 * @param data - Payment data to validate
 * @returns Validation result
 */
export const validatePaymentData = (data: any) => {
  const errors: string[] = [];

  if (!data.customer_id || typeof data.customer_id !== 'number') {
    errors.push('Customer ID is required and must be a number');
  }

  if (!data.payment_date) {
    errors.push('Payment date is required');
  } else {
    const paymentDate = new Date(data.payment_date);
    if (isNaN(paymentDate.getTime())) {
      errors.push('Invalid payment date format');
    }
  }

  if (!data.collected_by || typeof data.collected_by !== 'number') {
    errors.push('Collected by user ID is required and must be a number');
  }

  if (!data.method || typeof data.method !== 'string') {
    errors.push('Payment method is required and must be a string');
  } else {
    const validMethods = [
      'cash',
      'credit',
      'debit',
      'check',
      'bank_transfer',
      'online',
    ];
    if (!validMethods.includes(data.method.toLowerCase())) {
      errors.push(`Payment method must be one of: ${validMethods.join(', ')}`);
    }
  }

  if (
    !data.total_amount ||
    typeof data.total_amount !== 'number' ||
    data.total_amount <= 0
  ) {
    errors.push('Total amount is required and must be a positive number');
  }

  if (data.reference_number && typeof data.reference_number !== 'string') {
    errors.push('Reference number must be a string');
  }

  if (data.notes && typeof data.notes !== 'string') {
    errors.push('Notes must be a string');
  }

  if (data.currency_id && typeof data.currency_id !== 'number') {
    errors.push('Currency ID must be a number');
  }

  if (data.payment_lines && Array.isArray(data.payment_lines)) {
    data.payment_lines.forEach((line: any, index: number) => {
      if (!line.invoice_id || typeof line.invoice_id !== 'number') {
        errors.push(
          `Payment line ${index + 1}: Invoice ID is required and must be a number`
        );
      }
      if (
        !line.amount_applied ||
        typeof line.amount_applied !== 'number' ||
        line.amount_applied <= 0
      ) {
        errors.push(
          `Payment line ${index + 1}: Amount applied is required and must be a positive number`
        );
      }
      if (line.notes && typeof line.notes !== 'string') {
        errors.push(`Payment line ${index + 1}: Notes must be a string`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Express validation middleware for creating payment
 */
export const validateCreatePayment: ValidationChain[] = [
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Customer ID is required and must be a positive integer'),

  body('payment_date')
    .isISO8601()
    .withMessage('Payment date is required and must be a valid date'),

  body('collected_by')
    .isInt({ min: 1 })
    .withMessage(
      'Collected by user ID is required and must be a positive integer'
    ),

  body('method')
    .isIn(['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'])
    .withMessage(
      'Payment method must be one of: cash, credit, debit, check, bank_transfer, online'
    ),

  body('total_amount')
    .isFloat({ min: 0.01 })
    .withMessage('Total amount is required and must be a positive number'),

  body('reference_number')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage(
      'Reference number must be a string with maximum 100 characters'
    ),

  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be a string with maximum 500 characters'),

  body('currency_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Currency ID must be a positive integer'),

  body('payment_lines')
    .optional()
    .isArray()
    .withMessage('Payment lines must be an array'),

  body('payment_lines.*.invoice_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invoice ID must be a positive integer'),

  body('payment_lines.*.amount_applied')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount applied must be a positive number'),

  body('payment_lines.*.notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage(
      'Payment line notes must be a string with maximum 500 characters'
    ),
];

/**
 * Express validation middleware for updating payment
 */
export const validateUpdatePayment: ValidationChain[] = [
  body('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),

  body('collected_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Collected by user ID must be a positive integer'),

  body('method')
    .optional()
    .isIn(['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'])
    .withMessage(
      'Payment method must be one of: cash, credit, debit, check, bank_transfer, online'
    ),

  body('total_amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Total amount must be a positive number'),

  body('reference_number')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage(
      'Reference number must be a string with maximum 100 characters'
    ),

  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be a string with maximum 500 characters'),

  body('currency_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Currency ID must be a positive integer'),

  body('payment_lines')
    .optional()
    .isArray()
    .withMessage('Payment lines must be an array'),

  body('payment_lines.*.invoice_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invoice ID must be a positive integer'),

  body('payment_lines.*.amount_applied')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount applied must be a positive number'),

  body('payment_lines.*.notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage(
      'Payment line notes must be a string with maximum 500 characters'
    ),
];
