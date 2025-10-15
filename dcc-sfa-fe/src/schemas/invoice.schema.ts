import * as Yup from 'yup';

export const invoiceValidationSchema = Yup.object({
  invoice_number: Yup.string()
    .optional()
    .max(50, 'Invoice number must not exceed 50 characters'),

  parent_id: Yup.number()
    .required('Order is required')
    .positive('Order must be a positive number'),

  customer_id: Yup.number()
    .required('Customer is required')
    .positive('Customer must be a positive number'),

  currency_id: Yup.number()
    .optional()
    .positive('Currency must be a positive number'),

  invoice_date: Yup.string().required('Invoice date is required'),

  due_date: Yup.string()
    .optional()
    .test(
      'due-date-after-invoice',
      'Due date must be after invoice date',
      function (value) {
        const { invoice_date } = this.parent;
        if (!value || !invoice_date) return true;
        return new Date(value) >= new Date(invoice_date);
      }
    ),

  status: Yup.string()
    .required('Status is required')
    .oneOf(
      ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      'Please select a valid status'
    ),

  payment_method: Yup.string()
    .optional()
    .oneOf(
      ['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'],
      'Please select a valid payment method'
    ),

  subtotal: Yup.number()
    .required('Subtotal is required')
    .min(0, 'Subtotal must be greater than or equal to 0'),

  discount_amount: Yup.number()
    .optional()
    .min(0, 'Discount amount must be greater than or equal to 0'),

  tax_amount: Yup.number()
    .optional()
    .min(0, 'Tax amount must be greater than or equal to 0'),

  shipping_amount: Yup.number()
    .optional()
    .min(0, 'Shipping amount must be greater than or equal to 0'),

  total_amount: Yup.number()
    .required('Total amount is required')
    .min(0.01, 'Total amount must be greater than 0')
    .test(
      'is-positive',
      'Total amount must be a positive number',
      (value: number | undefined) => {
        return value !== undefined && value > 0;
      }
    ),

  amount_paid: Yup.number()
    .optional()
    .min(0, 'Amount paid must be greater than or equal to 0'),

  balance_due: Yup.number()
    .optional()
    .min(0, 'Balance due must be greater than or equal to 0'),

  notes: Yup.string()
    .optional()
    .max(500, 'Notes must not exceed 500 characters'),

  billing_address: Yup.string()
    .optional()
    .max(500, 'Billing address must not exceed 500 characters'),

  is_active: Yup.string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be Active or Inactive'),

  invoice_items: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.number()
          .required('Product is required')
          .positive('Product must be a positive number'),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1'),
        unit_price: Yup.number()
          .required('Unit price is required')
          .min(0, 'Unit price must be greater than or equal to 0'),
        discount_amount: Yup.number()
          .optional()
          .min(0, 'Discount amount must be greater than or equal to 0'),
        tax_amount: Yup.number()
          .optional()
          .min(0, 'Tax amount must be greater than or equal to 0'),
        notes: Yup.string()
          .optional()
          .max(500, 'Notes must not exceed 500 characters'),
      })
    )
    .min(1, 'At least one invoice item is required'),
});
